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

const FETCH_LIMIT = parseInt(process.argv[2] ?? "20", 10)
const GROUP_SIZE = 10
const POLL_INTERVAL_MS = 60_000
const PROMPT_PATH = path.join(process.cwd(), "prompts/grammar-enrich.txt")
const RESULTS_DIR = path.join(process.cwd(), "data/generated/grammar-results")
const PROMPT_MARKER = "Bây giờ hãy enrich batch input sau:"

type GrammarInput = {
    id: number
    pattern: string
    jlpt_level: string
    meaning_en: string | null
    explanation_en: string | null
    formation: unknown
    examples: unknown
}

function buildRequestMessage(grammars: GrammarInput[], promptPrefix: string): string {
    return `${promptPrefix}\n${JSON.stringify(grammars, null, 2)}`
}

function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

async function main() {
    const promptTemplate = fs.readFileSync(PROMPT_PATH, "utf8")

    const markerIndex = promptTemplate.indexOf(PROMPT_MARKER)
    if (markerIndex === -1) {
        throw new Error(`Prompt marker not found in ${PROMPT_PATH}`)
    }

    const promptPrefix = promptTemplate.slice(0, markerIndex + PROMPT_MARKER.length)

    const { data: grammars, error } = await supabase
        .from("grammars")
        .select("id, pattern, jlpt_level, meaning_en, explanation_en, formation, examples")
        .eq("ai_status", "pending")
        .order("sort_order")
        .limit(FETCH_LIMIT)

    if (error) throw error

    if (!grammars?.length) {
        console.log("No pending grammars found")
        return
    }

    console.log(`Fetched ${grammars.length} pending grammars`)

    const grammarIds: number[] = grammars.map((g: GrammarInput) => g.id)

    const { error: updateError } = await supabase
        .from("grammars")
        .update({ ai_status: "processing" })
        .in("id", grammarIds)

    if (updateError) throw updateError

    const groups: GrammarInput[][] = []
    for (let i = 0; i < grammars.length; i += GROUP_SIZE) {
        groups.push(grammars.slice(i, i + GROUP_SIZE))
    }

    console.log(`Grouped into ${groups.length} request(s) of up to ${GROUP_SIZE}`)

    const requests = groups.map((group, i) => ({
        custom_id: `group-${i}`,
        params: {
            model: "claude-opus-4-8" as const,
            max_tokens: 16384,
            messages: [
                {
                    role: "user" as const,
                    content: buildRequestMessage(group, promptPrefix),
                },
            ],
        },
    }))

    console.log("Submitting batch...")
    const batch = await anthropic.messages.batches.create({ requests })
    console.log(`Batch submitted: ${batch.id}`)

    let batchStatus = batch
    while (batchStatus.processing_status !== "ended") {
        const counts = batchStatus.request_counts
        console.log(
            `Status: ${batchStatus.processing_status} — processing: ${counts.processing}, succeeded: ${counts.succeeded}, errored: ${counts.errored}`
        )
        await sleep(POLL_INTERVAL_MS)
        batchStatus = await anthropic.messages.batches.retrieve(batch.id)
    }

    const counts = batchStatus.request_counts
    console.log(
        `Batch ended — succeeded: ${counts.succeeded}, errored: ${counts.errored}, canceled: ${counts.canceled}, expired: ${counts.expired}`
    )

    const allResults: unknown[] = []
    const failedGroupIds: string[] = []

    for await (const item of await anthropic.messages.batches.results(batch.id)) {
        if (item.result.type === "succeeded") {
            const content = item.result.message.content[0]
            if (content.type === "text") {
                try {
                    const parsed = JSON.parse(content.text)
                    if (Array.isArray(parsed.results)) {
                        allResults.push(...parsed.results)
                    } else {
                        console.warn(`Unexpected response shape for ${item.custom_id}`)
                    }
                } catch {
                    console.error(`Failed to parse JSON for ${item.custom_id}:`, content.text.slice(0, 200))
                }
            }
        } else {
            failedGroupIds.push(item.custom_id)
            console.error(`Request ${item.custom_id} ${item.result.type}`)
        }
    }

    fs.mkdirSync(RESULTS_DIR, { recursive: true })

    const outputPath = path.join(RESULTS_DIR, `batch-${batch.id}.json`)
    fs.writeFileSync(
        outputPath,
        JSON.stringify({ batch_id: batch.id, results: allResults }, null, 2),
        "utf8"
    )

    console.log(`Saved ${allResults.length} results → ${outputPath}`)

    if (failedGroupIds.length > 0) {
        const failedIds = grammarIds.filter((_, i) => {
            const groupIndex = Math.floor(i / GROUP_SIZE)
            return failedGroupIds.includes(`group-${groupIndex}`)
        })

        if (failedIds.length > 0) {
            await supabase
                .from("grammars")
                .update({ ai_status: "pending" })
                .in("id", failedIds)

            console.warn(`Reset ${failedIds.length} grammar(s) to pending due to batch errors`)
        }
    }
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
