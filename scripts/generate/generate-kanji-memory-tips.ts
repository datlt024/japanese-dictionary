/**
 * Generates Vietnamese memory tips for kanji using Gemini API (AI Studio free tier).
 *
 * Free tier: 15 requests/min, 1,500 requests/day
 * Get a free API key at: https://aistudio.google.com
 * Add to .env.local: GEMINI_API_KEY=your_key_here
 *
 * Usage:
 *   npm run kanji:generate-memory-tips         # all missing
 *   npm run kanji:generate-memory-tips 100     # limit to 100
 */

import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"

import type { Database } from "../../src/shared/types/database.generated"

dotenv.config({ path: ".env.local" })

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!
const GEMINI_MODEL = "gemini-2.0-flash"
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

// Free tier: 15 RPM → 4s delay to stay safe
const REQUEST_DELAY_MS = 4_000
const KANJIS_PER_REQUEST = 30
const RESULTS_DIR = path.join(process.cwd(), "data/kanji-memory-tips/results")

const FETCH_LIMIT = parseInt(process.argv[2] ?? "0", 10)

type KanjiInput = {
    kanji_id: number
    kanji: string
    meaning_vi: string | null
    radical: string | null
    radical_name_vi: string | null
    stroke_count: number | null
}

type KanjiResult = {
    kanji_id: number
    memory_tip: string
}

const SYSTEM_PROMPT = `Bạn là chuyên gia dạy Hán tự Nhật Bản cho người Việt.

Nhiệm vụ: tạo mẹo ghi nhớ chữ Hán bằng tiếng Việt, ngắn gọn và trực quan.

Quy tắc bắt buộc:
- memory_tip phải viết bằng tiếng Việt, ngắn (1–2 câu, tối đa 80 từ)
- Dựa vào hình dạng nét bút, bộ thủ hoặc cấu trúc của chữ để tạo liên tưởng dễ nhớ
- Liên kết hình ảnh trực quan với nghĩa của chữ
- Ưu tiên mẹo dựa trên bộ thủ (radical) khi bộ thủ có liên quan rõ ràng đến nghĩa
- Viết tự nhiên, gần gũi với người Việt học tiếng Nhật
- KHÔNG dịch máy từ tiếng Anh
- KHÔNG dùng thuật ngữ học thuật phức tạp
- KHÔNG dùng dấu ngoặc kép (") bên trong nội dung memory_tip

Trả về JSON object với key "results" chứa mảng kết quả.

Ví dụ input:
[{"kanji_id":1,"kanji":"木","meaning_vi":"cây; gỗ","radical":"木","radical_name_vi":"cây","stroke_count":4}]

Ví dụ output:
{"results":[{"kanji_id":1,"memory_tip":"Hình dáng giống một cái cây với thân đứng, cành vươn hai bên và rễ trải xuống dưới."}]}`

function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size))
    }
    return chunks
}

async function fetchPendingKanjis(): Promise<KanjiInput[]> {
    const PAGE_SIZE = 1000
    const all: KanjiInput[] = []
    let from = 0

    console.log("Fetching kanji with missing memory_tip...")

    while (true) {
        const to = FETCH_LIMIT > 0
            ? Math.min(from + PAGE_SIZE - 1, from + (FETCH_LIMIT - all.length) - 1)
            : from + PAGE_SIZE - 1

        const { data, error } = await supabase
            .from("kanjis")
            .select("id, kanji, meaning_vi, radical, radical_name_vi, stroke_count")
            .is("memory_tip", null)
            .order("jlpt", { ascending: false, nullsFirst: false })
            .order("grade", { ascending: true, nullsFirst: false })
            .order("id", { ascending: true })
            .range(from, to)

        if (error) {
            console.warn(`  Fetch error at offset ${from}: ${error.message}`)
            break
        }
        if (!data || data.length === 0) break

        all.push(
            ...data.map((row) => ({
                kanji_id: row.id,
                kanji: row.kanji,
                meaning_vi: row.meaning_vi,
                radical: row.radical,
                radical_name_vi: row.radical_name_vi,
                stroke_count: row.stroke_count,
            }))
        )

        console.log(`  Fetched: ${all.length}`)

        if (data.length < PAGE_SIZE) break
        if (FETCH_LIMIT > 0 && all.length >= FETCH_LIMIT) break
        from += PAGE_SIZE
    }

    return all
}

async function generateTips(group: KanjiInput[]): Promise<KanjiResult[]> {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts: [{ text: JSON.stringify(group) }] }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.7,
                maxOutputTokens: 8192,
            },
        }),
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Gemini API error ${res.status}: ${err.slice(0, 300)}`)
    }

    const json = await res.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }

    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
    const parsed = JSON.parse(text)

    const items: unknown[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.results)
            ? parsed.results
            : []

    if (items.length === 0) throw new Error(`Empty results in response: ${text.slice(0, 200)}`)

    return (items as KanjiResult[]).filter(
        (row) =>
            typeof row.kanji_id === "number" &&
            typeof row.memory_tip === "string" &&
            row.memory_tip.trim().length > 0
    ).map((row) => ({
        kanji_id: row.kanji_id,
        memory_tip: row.memory_tip.trim(),
    }))
}

async function applyResults(results: KanjiResult[]): Promise<number> {
    let updated = 0

    await Promise.all(
        results.map(async ({ kanji_id, memory_tip }) => {
            const { error } = await supabase
                .from("kanjis")
                .update({ memory_tip })
                .eq("id", kanji_id)

            if (error) {
                console.error(`  Failed kanji_id=${kanji_id}: ${error.message}`)
            } else {
                updated++
            }
        })
    )

    return updated
}

async function main() {
    if (!GEMINI_API_KEY) {
        console.error("Missing GEMINI_API_KEY in .env.local")
        console.error("Get a free key at: https://aistudio.google.com")
        process.exit(1)
    }

    const kanjis = await fetchPendingKanjis()

    if (kanjis.length === 0) {
        console.log("No pending kanji found.")
        return
    }

    console.log(`Processing ${kanjis.length} kanji in groups of ${KANJIS_PER_REQUEST}`)

    const groups = chunkArray(kanjis, KANJIS_PER_REQUEST)
    fs.mkdirSync(RESULTS_DIR, { recursive: true })

    const allResults: KanjiResult[] = []
    let totalFailed = 0

    for (let i = 0; i < groups.length; i++) {
        const group = groups[i]
        process.stdout.write(`[${i + 1}/${groups.length}] ${group.map((k) => k.kanji).join("")} ... `)

        try {
            const results = await generateTips(group)
            allResults.push(...results)
            process.stdout.write(`OK (${results.length})\n`)
        } catch (err) {
            process.stdout.write(`FAILED\n`)
            totalFailed++
            console.error(`  Error:`, err instanceof Error ? err.message.slice(0, 120) : err)
        }

        if (i < groups.length - 1) {
            await sleep(REQUEST_DELAY_MS)
        }
    }

    const outputPath = path.join(RESULTS_DIR, `run-${Date.now()}.json`)
    fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2), "utf8")
    console.log(`\nSaved ${allResults.length} tips → ${outputPath}`)

    console.log(`Applying to database...`)
    const updated = await applyResults(allResults)

    console.log("\nDone.")
    console.log(`Processed: ${kanjis.length} total pending`)
    console.log(`Generated this run: ${allResults.length}`)
    console.log(`Updated in DB: ${updated}`)
    if (totalFailed > 0) console.warn(`Failed groups: ${totalFailed}`)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
