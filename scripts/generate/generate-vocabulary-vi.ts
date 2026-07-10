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

const FETCH_LIMIT = parseInt(process.argv[2] ?? "10000", 10)
const SENSES_PER_REQUEST = 100
const REQUESTS_PER_BATCH = 100  // max groups per Batch API call (~1MB payload)
const MODEL = "claude-haiku-4-5-20251001"
const POLL_INTERVAL_MS = 30_000
const PROMPT_PATH = path.join(process.cwd(), "prompts/vocabulary-vi.txt")
const RESULTS_DIR = path.join(process.cwd(), "data/vocabulary-vi/results")
const PROMPT_MARKER = "Bây giờ hãy dịch batch sau:"

type SenseRow = {
    id: number
    vocabulary_id: number
    meaning_en: string | null
    part_of_speech: string[] | null
    vocabularies: {
        primary_word: string
        primary_kana: string | null
        is_common: boolean | null
        jlpt: string | null
    } | null
}

type SenseInput = {
    sense_id: number
    word: string
    kana: string | null
    meaning_en: string
    pos: string[]
}

type SenseResult = {
    sense_id: number
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

async function fetchPendingSenses(limit: number): Promise<SenseRow[]> {
    const PAGE_SIZE = 1000
    const allSenses: SenseRow[] = []
    let from = 0

    console.log(`Fetching up to ${limit} pending senses...`)

    while (allSenses.length < limit) {
        const remaining = limit - allSenses.length
        const pageSize = Math.min(PAGE_SIZE, remaining)

        const { data, error } = await supabase
            .from("vocabulary_senses")
            .select(`
                id,
                vocabulary_id,
                meaning_en,
                part_of_speech,
                vocabularies!inner (
                    primary_word,
                    primary_kana,
                    is_common,
                    jlpt
                )
            `)
            .eq("meaning_vi_status", "pending")
            .not("meaning_en", "is", null)
            .order("is_common", { referencedTable: "vocabularies", ascending: false })
            .order("jlpt", { referencedTable: "vocabularies", ascending: false, nullsFirst: false })
            .order("id", { ascending: true })
            .range(from, from + pageSize - 1)

        if (error) {
            console.warn(`  Fetch timeout at offset ${from} (fetched ${allSenses.length} so far): ${error.message}`)
            break
        }
        if (!data || data.length === 0) break

        allSenses.push(...(data as unknown as SenseRow[]))
        console.log(`  Fetched: ${allSenses.length}`)

        if (data.length < pageSize) break
        from += pageSize
    }

    return allSenses
}

async function submitBatch(
    groups: SenseInput[][],
    promptPrefix: string
): Promise<string> {
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
    batchId: string,
    groups: SenseInput[][]
): Promise<{ results: SenseResult[]; failedGroupIndexes: number[] }> {
    const results: SenseResult[] = []
    const failedGroupIndexes: number[] = []

    for await (const item of await anthropic.messages.batches.results(batchId)) {
        const groupIndex = parseInt(item.custom_id.replace("group-", ""), 10)

        if (item.result.type !== "succeeded") {
            console.error(`Request ${item.custom_id} ${item.result.type}`)
            failedGroupIndexes.push(groupIndex)
            continue
        }

        const content = item.result.message.content[0]
        if (content.type !== "text") {
            console.warn(`Unexpected content type for ${item.custom_id}`)
            failedGroupIndexes.push(groupIndex)
            continue
        }

        try {
            const parsed = JSON.parse(content.text)
            if (!Array.isArray(parsed)) {
                console.warn(`Non-array response for ${item.custom_id}`)
                failedGroupIndexes.push(groupIndex)
                continue
            }

            for (const item of parsed) {
                if (
                    typeof item.sense_id === "number" &&
                    typeof item.meaning_vi === "string" &&
                    item.meaning_vi.trim()
                ) {
                    results.push({
                        sense_id: item.sense_id,
                        meaning_vi: item.meaning_vi.trim(),
                    })
                }
            }
        } catch {
            console.error(`Failed to parse JSON for ${item.custom_id}:`, content.text.slice(0, 200))
            failedGroupIndexes.push(groupIndex)
        }
    }

    return { results, failedGroupIndexes }
}

async function applyResults(results: SenseResult[]): Promise<number> {
    const BATCH_SIZE = 200
    let updated = 0

    for (const chunk of chunkArray(results, BATCH_SIZE)) {
        await Promise.all(
            chunk.map(async ({ sense_id, meaning_vi }) => {
                const { error } = await supabase
                    .from("vocabulary_senses")
                    .update({
                        meaning_vi,
                        meaning_vi_status: "machine",
                        meaning_vi_source: "ai",
                    })
                    .eq("id", sense_id)

                if (error) {
                    console.error(`Failed to update sense_id=${sense_id}: ${error.message}`)
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
    if (markerIndex === -1) throw new Error("Prompt marker not found")
    const promptPrefix = promptTemplate.slice(0, markerIndex + PROMPT_MARKER.length)

    // 1. Fetch pending senses
    const senses = await fetchPendingSenses(FETCH_LIMIT)

    if (senses.length === 0) {
        console.log("No pending senses found.")
        return
    }

    console.log(`Processing ${senses.length} senses`)

    // 2. Build input groups
    const inputs: SenseInput[] = senses
        .filter((s) => s.meaning_en && s.vocabularies)
        .map((s) => ({
            sense_id: s.id,
            word: s.vocabularies!.primary_word,
            kana: s.vocabularies!.primary_kana,
            meaning_en: s.meaning_en!,
            pos: s.part_of_speech ?? [],
        }))

    const groups = chunkArray(inputs, SENSES_PER_REQUEST)
    const batchChunks = chunkArray(groups, REQUESTS_PER_BATCH)
    console.log(`Grouped into ${groups.length} request(s), split across ${batchChunks.length} Batch API call(s)`)

    fs.mkdirSync(RESULTS_DIR, { recursive: true })

    const allResults: SenseResult[] = []
    let totalFailed = 0

    // 3. Submit, poll, collect each batch chunk sequentially
    for (let i = 0; i < batchChunks.length; i++) {
        const chunk = batchChunks[i]
        console.log(`\n[Batch ${i + 1}/${batchChunks.length}] Submitting ${chunk.length} request(s)...`)

        const batchId = await submitBatch(chunk, promptPrefix)
        await pollBatch(batchId)

        const { results, failedGroupIndexes } = await collectResults(batchId, chunk)
        console.log(`  Collected ${results.length} translated senses`)

        const outputPath = path.join(RESULTS_DIR, `batch-${batchId}.json`)
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf8")
        console.log(`  Saved → ${outputPath}`)

        if (failedGroupIndexes.length > 0) {
            console.warn(`  Failed groups in this batch: ${failedGroupIndexes.length}`)
            totalFailed += failedGroupIndexes.length
        }

        allResults.push(...results)
    }

    // 4. Apply to DB
    console.log(`\nApplying ${allResults.length} results to database...`)
    const updated = await applyResults(allResults)

    console.log("\nDone.")
    console.log(`Processed: ${senses.length}`)
    console.log(`Translated: ${allResults.length}`)
    console.log(`Updated in DB: ${updated}`)
    if (totalFailed > 0) console.warn(`Failed request groups: ${totalFailed}`)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
