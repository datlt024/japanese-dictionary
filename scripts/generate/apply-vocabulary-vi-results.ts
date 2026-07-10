/**
 * Re-apply a saved results file to the database.
 * Usage: tsx scripts/generate/apply-vocabulary-vi-results.ts <results-file.json>
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

const filePath = process.argv[2]

if (!filePath) {
    console.error("Usage: tsx scripts/generate/apply-vocabulary-vi-results.ts <results-file.json>")
    process.exit(1)
}

const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath)

type SenseResult = {
    sense_id: number
    meaning_vi: string
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size))
    }
    return chunks
}

async function main() {
    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`File not found: ${resolvedPath}`)
    }

    const results: SenseResult[] = JSON.parse(fs.readFileSync(resolvedPath, "utf8"))
    console.log(`Loaded ${results.length} results from ${resolvedPath}`)

    let updated = 0
    let failed = 0
    const BATCH_SIZE = 200

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
                    console.error(`Failed sense_id=${sense_id}: ${error.message}`)
                    failed++
                } else {
                    updated++
                }
            })
        )

        if ((updated + failed) % 1000 === 0) {
            console.log(`  Progress: ${updated + failed}/${results.length}`)
        }
    }

    console.log("\nDone.")
    console.log(`Updated: ${updated}`)
    console.log(`Failed: ${failed}`)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
