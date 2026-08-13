import fs from "fs"
import path from "path"

import type { Json, TablesUpdate } from "../../src/shared/types/database.generated"
import { supabaseAdmin } from "@/server/supabase/admin"

const TRANSLATED_DIR = path.join(process.cwd(), "data", "vocabulary-vi", "translated")
const BATCH_SIZE = 50  // senses updated in parallel per batch

// Optional: pass start/end batch number as args
const startArg = parseInt(process.argv[2] ?? "1", 10)
const endArg = parseInt(process.argv[3] ?? "999999", 10)

type MeaningViGloss = {
    index: number
    meaning: string
    examples: unknown[]
}

type TranslatedSense = {
    sense_id: number
    meaning_vi: string
    confidence?: string
    search_keywords?: string[]
    meaning_vi_glosses: MeaningViGloss[]
}

type TranslatedEntry = {
    vocabulary_id: number
    word: string
    kana: string | null
    senses: TranslatedSense[]
}

function loadEntries(filePath: string): TranslatedEntry[] {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"))
    return Array.isArray(raw) ? raw : (raw.data ?? [])
}

function extractBatchNum(fileName: string): number {
    const m = fileName.match(/(\d+)\.json$/)
    return m ? parseInt(m[1], 10) : 0
}

async function importSenses(senses: Array<{ sense_id: number; data: TablesUpdate<"vocabulary_senses"> }>) {
    await Promise.all(
        senses.map(async ({ sense_id, data }) => {
            const { error } = await supabaseAdmin
                .from("vocabulary_senses")
                .update(data)
                .eq("id", sense_id)
            if (error) {
                console.error(`  [error] sense_id=${sense_id}: ${error.message}`)
            }
        })
    )
}

async function main() {
    const allFiles = fs
        .readdirSync(TRANSLATED_DIR)
        .filter((f) => f.endsWith(".json"))
        .filter((f) => {
            const n = extractBatchNum(f)
            return n >= startArg && n <= endArg
        })
        .sort()

    console.log(`Found ${allFiles.length} translated files to import`)
    console.log(`Range: batch ${startArg} – ${endArg}`)
    console.log()

    let filesProcessed = 0
    let totalSenses = 0
    let totalErrors = 0

    for (const fileName of allFiles) {
        const filePath = path.join(TRANSLATED_DIR, fileName)
        let entries: TranslatedEntry[]

        try {
            entries = loadEntries(filePath)
        } catch (e) {
            console.error(`[skip] ${fileName}: parse error`)
            continue
        }

        const senseBatch: Array<{ sense_id: number; data: TablesUpdate<"vocabulary_senses"> }> = []

        for (const entry of entries) {
            for (const sense of entry.senses ?? []) {
                if (!sense.sense_id || !sense.meaning_vi?.trim()) continue
                senseBatch.push({
                    sense_id: sense.sense_id,
                    data: {
                        meaning_vi: sense.meaning_vi,
                        meaning_vi_glosses: (sense.meaning_vi_glosses ?? []) as Json,
                        meaning_vi_status: "machine",
                        meaning_vi_source: "ai",
                    },
                })
            }
        }

        // Import in parallel chunks
        for (let i = 0; i < senseBatch.length; i += BATCH_SIZE) {
            await importSenses(senseBatch.slice(i, i + BATCH_SIZE))
        }

        totalSenses += senseBatch.length
        filesProcessed++

        if (filesProcessed % 100 === 0) {
            console.log(`  [${filesProcessed}/${allFiles.length}] ${fileName} | senses: ${totalSenses}`)
        }
    }

    console.log()
    console.log("Done.")
    console.log(`Files imported: ${filesProcessed}`)
    console.log(`Senses updated: ${totalSenses}`)
    console.log(`Errors: ${totalErrors}`)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
