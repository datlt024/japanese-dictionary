/**
 * Translates vocabulary_collocations.meaning_en → meaning_vi using Groq free API.
 *
 * Usage:
 *   npm run collocation:generate-vi          # all missing
 *   npm run collocation:generate-vi 200      # limit to 200
 */

import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

import type { Database } from "../../src/shared/types/database.generated"

dotenv.config({ path: ".env.local" })

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const GROQ_API_KEY = process.env.GROQ_API_KEY!
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const GROQ_MODEL = "llama-3.3-70b-versatile"

const ITEMS_PER_REQUEST = 40
const REQUEST_DELAY_MS = 3_000
const FETCH_LIMIT = parseInt(process.argv[2] ?? "0", 10)

const SYSTEM_PROMPT = `Bạn là chuyên gia dịch thuật Nhật–Việt.

Nhiệm vụ: dịch meaning_en (nghĩa tiếng Anh của cụm từ tiếng Nhật) sang meaning_vi (tiếng Việt) ngắn gọn, tự nhiên.

Quy tắc:
- Dịch ngắn gọn, tự nhiên, đúng nghĩa
- Dùng từ tiếng Việt phổ thông
- Nếu có nhiều nghĩa, giữ 2–3 nghĩa tiêu biểu, dùng dấu chấm phẩy (;) ngăn cách
- KHÔNG dịch máy từng chữ từ tiếng Anh
- KHÔNG thêm dấu chấm ở cuối
- KHÔNG dùng dấu ngoặc kép trong nội dung

Trả về JSON object với key "results" chứa mảng kết quả.

Ví dụ input:
[{"id":1,"expression_jp":"お世話になる","meaning_en":"to be in someone's care; to receive help"},{"id":2,"expression_jp":"気にする","meaning_en":"to mind; to care about; to worry"}]

Ví dụ output:
{"results":[{"id":1,"meaning_vi":"nhờ sự giúp đỡ của ai; được chăm sóc"},{"id":2,"meaning_vi":"để ý; quan tâm; lo lắng"}]}`

type CollocInput = {
    id: number
    expression_jp: string
    meaning_en: string
}

type CollocResult = {
    id: number
    meaning_vi: string
}

function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
    return chunks
}

async function fetchPending(): Promise<CollocInput[]> {
    const PAGE_SIZE = 1000
    const all: CollocInput[] = []
    let from = 0

    console.log("Fetching collocations with missing meaning_vi...")

    while (true) {
        const to = FETCH_LIMIT > 0
            ? Math.min(from + PAGE_SIZE - 1, from + (FETCH_LIMIT - all.length) - 1)
            : from + PAGE_SIZE - 1

        const { data, error } = await supabase
            .from("vocabulary_collocations")
            .select("id, expression_jp, meaning_en")
            .is("meaning_vi", null)
            .not("meaning_en", "is", null)
            .order("id", { ascending: true })
            .range(from, to)

        if (error) { console.warn(`Fetch error: ${error.message}`); break }
        if (!data || data.length === 0) break

        all.push(...data.map((r) => ({
            id: r.id,
            expression_jp: r.expression_jp,
            meaning_en: r.meaning_en!,
        })))

        console.log(`  Fetched: ${all.length}`)
        if (data.length < PAGE_SIZE) break
        if (FETCH_LIMIT > 0 && all.length >= FETCH_LIMIT) break
        from += PAGE_SIZE
    }

    return all
}

async function translate(group: CollocInput[]): Promise<CollocResult[]> {
    const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            temperature: 0.3,
            max_tokens: 4096,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: JSON.stringify(group) },
            ],
        }),
    })

    if (!res.ok) {
        const err = await res.text()
        const error = new Error(`Groq API error ${res.status}: ${err.slice(0, 200)}`)
        if (res.status === 429 && err.includes("tokens per day")) {
            (error as Error & { dailyQuotaExceeded: boolean }).dailyQuotaExceeded = true
        }
        throw error
    }

    const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
    const text = json.choices?.[0]?.message?.content ?? ""
    const parsed = JSON.parse(text)
    const items: unknown[] = Array.isArray(parsed) ? parsed : (parsed?.results ?? [])

    return (items as CollocResult[]).filter(
        (r) => typeof r.id === "number" && typeof r.meaning_vi === "string" && r.meaning_vi.trim()
    ).map((r) => ({ id: r.id, meaning_vi: r.meaning_vi.trim() }))
}

async function applyResults(results: CollocResult[]): Promise<number> {
    let updated = 0
    await Promise.all(
        results.map(async ({ id, meaning_vi }) => {
            const { error } = await supabase
                .from("vocabulary_collocations")
                .update({ meaning_vi })
                .eq("id", id)
            if (error) console.error(`  Failed id=${id}: ${error.message}`)
            else updated++
        })
    )
    return updated
}

async function main() {
    if (!GROQ_API_KEY) {
        console.error("Missing GROQ_API_KEY in .env.local")
        process.exit(1)
    }

    const items = await fetchPending()
    if (items.length === 0) { console.log("No pending collocations."); return }

    const groups = chunkArray(items, ITEMS_PER_REQUEST)
    console.log(`Processing ${items.length} collocations in ${groups.length} groups`)

    const allResults: CollocResult[] = []
    let totalFailed = 0
    let stoppedEarly = false

    for (let i = 0; i < groups.length; i++) {
        process.stdout.write(`[${i + 1}/${groups.length}] `)
        try {
            const results = await translate(groups[i])
            allResults.push(...results)
            process.stdout.write(`OK (${results.length})\n`)
        } catch (err) {
            process.stdout.write(`FAILED\n`)
            if (err instanceof Error && (err as Error & { dailyQuotaExceeded?: boolean }).dailyQuotaExceeded) {
                console.warn("Daily token quota exceeded. Re-run tomorrow to continue.")
                stoppedEarly = true
                break
            }
            totalFailed++
            console.error(`  ${err instanceof Error ? err.message.slice(0, 120) : err}`)
        }
        if (i < groups.length - 1) await sleep(REQUEST_DELAY_MS)
    }

    console.log(`\nApplying ${allResults.length} results...`)
    const updated = await applyResults(allResults)

    console.log("\nDone.")
    if (stoppedEarly) console.log("Stopped early — daily quota hit")
    console.log(`Translated: ${allResults.length} / ${items.length}`)
    console.log(`Updated in DB: ${updated}`)
    if (totalFailed > 0) console.warn(`Failed groups: ${totalFailed}`)
}

main().catch((err) => { console.error(err); process.exit(1) })
