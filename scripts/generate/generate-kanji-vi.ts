import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"
import Anthropic from "@anthropic-ai/sdk"

import type { Database } from "../../src/shared/types/database.generated"

dotenv.config({ path: ".env.local" })

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
})

const KANJIS_PER_REQUEST = 200
const REQUESTS_PER_BATCH = 100
const MODEL = "claude-haiku-4-5-20251001"
const POLL_INTERVAL_MS = 30_000
const PROMPT_PATH = path.join(process.cwd(), "prompts/kanji-vi.txt")
const RESULTS_DIR = path.join(process.cwd(), "data/kanji-vi/results")
const PROMPT_MARKER = "Bây giờ hãy dịch batch sau:"

type KanjiInput = {
    kanji_id: number
    kanji: string
    meaning_en: string
}

type KanjiResult = {
    kanji_id: number
    meaning_vi: string
}

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

    console.log("Fetching kanji with missing meaning_vi...")

    while (true) {
        const { data, error } = await supabase
            .from("kanjis")
            .select("id, kanji, meaning_en")
            .is("meaning_vi", null)
            .not("meaning_en", "is", null)
            .order("jlpt", { ascending: false, nullsFirst: false })
            .order("grade", { ascending: true, nullsFirst: false })
            .order("id", { ascending: true })
            .range(from, from + PAGE_SIZE - 1)

        if (error) {
            console.warn(`  Fetch error at offset ${from}: ${error.message}`)
            break
        }
        if (!data || data.length === 0) break

        all.push(
            ...data.map((row) => ({
                kanji_id: row.id,
                kanji: row.kanji,
                meaning_en: row.meaning_en!,
            }))
        )

        console.log(`  Fetched: ${all.length}`)

        if (data.length < PAGE_SIZE) break
        from += PAGE_SIZE
    }

    return all
}

async function submitBatch(groups: KanjiInput[][], promptPrefix: string): Promise<string> {
    const requests = groups.map((group, i) => ({
        custom_id: `group-${i}`,
        params: {
            model: MODEL as "claude-haiku-4-5-20251001",
            max_tokens: 4096,
            messages: [
                {
                    role: "user" as const,
                    content: `${promptPrefix}\n${JSON.stringify(group)}`,
                },
            ],
        },
    }))

    console.log(`Submitting batch with ${requests.length} request(s)...`)
    const batch = await anthropic.messages.batches.create({ requests })
    console.log(`Batch submitted: ${batch.id}`)
    return batch.id
}

async function pollBatch(batchId: string): Promise<void> {
    let status = await anthropic.messages.batches.retrieve(batchId)

    while (status.processing_status !== "ended") {
        const c = status.request_counts
        console.log(
            `  Status: ${status.processing_status} — processing: ${c.processing}, succeeded: ${c.succeeded}, errored: ${c.errored}`
        )
        await sleep(POLL_INTERVAL_MS)
        status = await anthropic.messages.batches.retrieve(batchId)
    }

    const c = status.request_counts
    console.log(
        `Batch ended — succeeded: ${c.succeeded}, errored: ${c.errored}, canceled: ${c.canceled}, expired: ${c.expired}`
    )
}

async function collectResults(
    batchId: string
): Promise<{ results: KanjiResult[]; failedCount: number }> {
    const results: KanjiResult[] = []
    let failedCount = 0

    for await (const item of await anthropic.messages.batches.results(batchId)) {
        if (item.result.type !== "succeeded") {
            console.error(`Request ${item.custom_id} ${item.result.type}`)
            failedCount++
            continue
        }

        const content = item.result.message.content[0]
        if (content.type !== "text") {
            console.warn(`Unexpected content type for ${item.custom_id}`)
            failedCount++
            continue
        }

        try {
            const parsed = JSON.parse(content.text)
            if (!Array.isArray(parsed)) {
                console.warn(`Non-array response for ${item.custom_id}`)
                failedCount++
                continue
            }

            for (const row of parsed) {
                if (
                    typeof row.kanji_id === "number" &&
                    typeof row.meaning_vi === "string" &&
                    row.meaning_vi.trim()
                ) {
                    results.push({
                        kanji_id: row.kanji_id,
                        meaning_vi: row.meaning_vi.trim(),
                    })
                }
            }
        } catch {
            console.error(`Failed to parse JSON for ${item.custom_id}:`, content.text.slice(0, 200))
            failedCount++
        }
    }

    return { results, failedCount }
}

async function applyResults(results: KanjiResult[]): Promise<number> {
    const BATCH_SIZE = 200
    let updated = 0

    for (const chunk of chunkArray(results, BATCH_SIZE)) {
        await Promise.all(
            chunk.map(async ({ kanji_id, meaning_vi }) => {
                const { error } = await supabase
                    .from("kanjis")
                    .update({ meaning_vi })
                    .eq("id", kanji_id)

                if (error) {
                    console.error(`Failed kanji_id=${kanji_id}: ${error.message}`)
                } else {
                    updated++
                }
            })
        )
    }

    return updated
}

async function main() {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error("Missing ANTHROPIC_API_KEY in .env.local")
    }

    const promptTemplate = fs.readFileSync(PROMPT_PATH, "utf8")
    const markerIndex = promptTemplate.indexOf(PROMPT_MARKER)
    if (markerIndex === -1) throw new Error("Prompt marker not found in kanji-vi.txt")
    const promptPrefix = promptTemplate.slice(0, markerIndex + PROMPT_MARKER.length)

    const kanjis = await fetchPendingKanjis()

    if (kanjis.length === 0) {
        console.log("No pending kanji found.")
        return
    }

    console.log(`Processing ${kanjis.length} kanji`)

    const groups = chunkArray(kanjis, KANJIS_PER_REQUEST)
    const batchChunks = chunkArray(groups, REQUESTS_PER_BATCH)
    console.log(`Grouped into ${groups.length} request(s), split across ${batchChunks.length} Batch API call(s)`)

    fs.mkdirSync(RESULTS_DIR, { recursive: true })

    const allResults: KanjiResult[] = []
    let totalFailed = 0

    for (let i = 0; i < batchChunks.length; i++) {
        const chunk = batchChunks[i]
        console.log(`\n[Batch ${i + 1}/${batchChunks.length}] Submitting ${chunk.length} request(s)...`)

        const batchId = await submitBatch(chunk, promptPrefix)
        await pollBatch(batchId)

        const { results, failedCount } = await collectResults(batchId)
        console.log(`  Collected ${results.length} translated kanji`)

        const outputPath = path.join(RESULTS_DIR, `batch-${batchId}.json`)
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf8")
        console.log(`  Saved → ${outputPath}`)

        if (failedCount > 0) {
            console.warn(`  Failed requests: ${failedCount}`)
            totalFailed += failedCount
        }

        allResults.push(...results)
    }

    console.log(`\nApplying ${allResults.length} results to database...`)
    const updated = await applyResults(allResults)

    console.log("\nDone.")
    console.log(`Processed: ${kanjis.length}`)
    console.log(`Translated: ${allResults.length}`)
    console.log(`Updated in DB: ${updated}`)
    if (totalFailed > 0) console.warn(`Failed request groups: ${totalFailed}`)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
