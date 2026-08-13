/**
 * Auto-generate Vietnamese explanations for static exam questions using Claude API.
 *
 * Usage:
 *   npm run exam:enrich [exam-id] [limit]
 *   npm run exam:enrich n5-2021 20
 *   npm run exam:enrich n5-2021          # all questions
 *
 * Explanations are saved to:
 *   src/features/dictionary/study/data/explanations/{exam-id}.json
 *
 * The JSON is keyed by "{groupId}:{display}" and merged into question data
 * at module load time in the exam data file.
 *
 * Notes:
 * - Language questions (vocab, grammar, reading) are fully auto-generated.
 * - Listening questions need a transcript. If you provide transcripts in
 *   TRANSCRIPTS below, explanations will be generated from them.
 */

import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import Anthropic from "@anthropic-ai/sdk"

dotenv.config({ path: ".env.local" })

// ── Args ─────────────────────────────────────────────────────────────────────

const EXAM_ID  = process.argv[2] ?? "n5-2021"
const LIMIT    = parseInt(process.argv[3] ?? "9999", 10)
const SLEEP_MS = 300  // between API calls

// ── Paths ─────────────────────────────────────────────────────────────────────

const DATA_DIR  = path.join(process.cwd(), "src/features/dictionary/study/data")
const OUT_FILE  = path.join(DATA_DIR, "explanations", `${EXAM_ID}.json`)

// ── Claude ────────────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// ── Optional: listening transcripts ──────────────────────────────────────────
// Fill in the transcript for each question key to get real explanations.
// Key format: "{groupId}:{display}", e.g. "lq1:1ばん"
// Leave empty string to skip a question.
const TRANSCRIPTS: Record<string, string> = {
    // "lq1:1ばん": "...(transcript of what the audio says for this question)...",
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) {
    return new Promise<void>(r => setTimeout(r, ms))
}

function isPlaceholder(text: string | undefined): boolean {
    if (!text || text.trim() === "") return true
    if (text.includes("[Điền giải thích")) return true
    return false
}

// ── Prompts ───────────────────────────────────────────────────────────────────

type QType = "kanji_reading" | "kanji_writing" | "context_vocab" | "grammar_blank"
    | "listening_pic" | "listening_text" | "listening_scene"

interface Q {
    groupId: string
    sectionId: string
    type: QType
    display: string
    reading?: string
    sentence?: string
    context?: string
    options: string[]
    correctIndex: number
    explanation?: string
}

function buildPrompt(q: Q, transcriptHint?: string): string | null {
    const correct = q.options[q.correctIndex]

    if (q.type === "kanji_reading") {
        const ctx = q.sentence ?? q.display
        return `Bạn là giáo viên tiếng Nhật. Viết 1–2 câu giải thích ngắn gọn bằng tiếng Việt tại sao cách đọc đúng của "${q.display}" trong câu "${ctx}" là "${correct}".
Các lựa chọn sai: ${q.options.filter((_, i) => i !== q.correctIndex).join(", ")}.
Chỉ giải thích ngắn, không dùng Markdown, không có tiêu đề.`
    }

    if (q.type === "kanji_writing") {
        const ctx = q.sentence ?? q.display
        return `Bạn là giáo viên tiếng Nhật. Viết 1–2 câu giải thích ngắn gọn bằng tiếng Việt tại sao cách viết kanji đúng của "${q.display}" là "${correct}" trong câu "${ctx}".
Các lựa chọn sai: ${q.options.filter((_, i) => i !== q.correctIndex).join(", ")}.
Chỉ giải thích ngắn, không dùng Markdown, không có tiêu đề.`
    }

    if (q.type === "context_vocab") {
        const sentence = q.sentence ?? q.display
        return `Bạn là giáo viên tiếng Nhật. Câu hỏi:
Câu: "${sentence}"
Đáp án đúng: "${correct}"
Các lựa chọn khác: ${q.options.filter((_, i) => i !== q.correctIndex).join(", ")}

Viết 1–2 câu giải thích ngắn gọn bằng tiếng Việt tại sao "${correct}" là lựa chọn đúng trong ngữ cảnh này.
Chỉ giải thích ngắn, không dùng Markdown, không có tiêu đề.`
    }

    if (q.type === "grammar_blank") {
        const sentence = q.sentence ?? q.display
        const ctx = q.context ? `\nĐoạn văn bối cảnh: [có đoạn văn đính kèm]` : ""
        return `Bạn là giáo viên tiếng Nhật. Câu hỏi điền vào chỗ trống:
Câu: "${sentence}"${ctx}
Đáp án đúng: "${correct}"
Các lựa chọn khác: ${q.options.filter((_, i) => i !== q.correctIndex).join(", ")}

Viết 1–2 câu giải thích ngắn gọn bằng tiếng Việt tại sao "${correct}" là đáp án đúng (giải thích ngữ pháp hoặc nghĩa phù hợp với ngữ cảnh).
Chỉ giải thích ngắn, không dùng Markdown, không có tiêu đề.`
    }

    // Listening: only generate if transcript is provided
    if (transcriptHint) {
        return `Bạn là giáo viên tiếng Nhật. Câu hỏi nghe hiểu:
Nội dung audio (tóm tắt): ${transcriptHint}
Đáp án đúng: ${correct}
Các lựa chọn khác: ${q.options.filter((_, i) => i !== q.correctIndex).join(", ")}

Viết 1–2 câu giải thích ngắn gọn bằng tiếng Việt tại sao "${correct}" là đáp án đúng.
Chỉ giải thích ngắn, không dùng Markdown, không có tiêu đề.`
    }

    return null  // skip: no transcript available
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    // Load existing explanations
    let existing: Record<string, string> = {}
    if (fs.existsSync(OUT_FILE)) {
        existing = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"))
    }

    // Dynamically import exam questions
    const examFile = path.join(DATA_DIR, `${EXAM_ID}-exam.ts`)
    if (!fs.existsSync(examFile)) {
        console.error(`File not found: ${examFile}`)
        process.exit(1)
    }

    const exportName = EXAM_ID.toUpperCase().replace(/-/g, "_") + "_QUESTIONS"
    // e.g. "n5-2021" → "N5_2021_QUESTIONS"

    // tsx dynamic import of TypeScript file (works when run with tsx)
    const mod = await import(examFile) as Record<string, Q[]>
    const allQuestions: Q[] = mod[exportName]
    if (!allQuestions) {
        console.error(`Export "${exportName}" not found in ${examFile}`)
        process.exit(1)
    }

    // Determine which questions need explanations
    const todo = allQuestions.filter(q => {
        const key = `${q.groupId}:${q.display}`
        return isPlaceholder(existing[key])
    }).slice(0, LIMIT)

    console.log(`Exam: ${EXAM_ID}`)
    console.log(`Total questions: ${allQuestions.length}`)
    console.log(`Already explained: ${allQuestions.length - todo.length}`)
    console.log(`To generate: ${todo.length}`)
    console.log()

    if (todo.length === 0) {
        console.log("Nothing to do.")
        return
    }

    let done = 0
    let skipped = 0

    for (const q of todo) {
        const key = `${q.groupId}:${q.display}`
        const transcript = TRANSCRIPTS[key]
        const prompt = buildPrompt(q, transcript)

        if (!prompt) {
            console.log(`  SKIP  ${key} (listening — add transcript to TRANSCRIPTS to generate)`)
            skipped++
            continue
        }

        process.stdout.write(`  ${key} ... `)

        try {
            const msg = await anthropic.messages.create({
                model: "claude-haiku-4-5-20251001",
                max_tokens: 256,
                messages: [{ role: "user", content: prompt }],
            })

            const text = (msg.content[0] as { type: string; text: string }).text.trim()
            existing[key] = text
            done++
            console.log("OK")
        } catch (err) {
            console.log(`ERROR: ${err}`)
        }

        // Save after each question so progress isn't lost on failure
        fs.writeFileSync(OUT_FILE, JSON.stringify(existing, null, 2) + "\n", "utf8")

        await sleep(SLEEP_MS)
    }

    console.log()
    console.log(`Generated: ${done}  |  Skipped (no transcript): ${skipped}`)
    console.log(`Saved to: ${OUT_FILE}`)
    console.log()
    if (skipped > 0) {
        console.log(`To generate listening explanations, add transcripts to the TRANSCRIPTS`)
        console.log(`object at the top of scripts/generate/enrich-exam-explanations.ts`)
        console.log(`then run: npm run exam:enrich ${EXAM_ID}`)
    }
}

main().catch(e => { console.error(e); process.exit(1) })
