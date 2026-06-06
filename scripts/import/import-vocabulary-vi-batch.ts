import dotenv from "dotenv"
import fs from "fs"
import path from "path"

import type {
    Json,
    TablesUpdate,
} from "../../src/shared/types/database.generated"
import { supabaseAdmin } from "@/server/supabase/admin"

dotenv.config({
    path: ".env.local",
})

const batchFileName = process.argv[2] || "batch-00001.json"

const INPUT_FILE = path.join(
    process.cwd(),
    "data",
    "vocabulary-vi",
    "translated",
    batchFileName
)

type MeaningViGloss = {
    index: number
    meaning: string
    examples: []
}

type TranslatedSense = {
    sense_id: number
    meaning_vi: string
    confidence?: "high" | "medium" | "low"
    search_keywords?: string[]
    meaning_vi_glosses: MeaningViGloss[]
}

type TranslatedEntry = {
    vocabulary_id: number
    word: string
    kana: string | null
    senses: TranslatedSense[]
}

function validateEntry(entry: TranslatedEntry) {
    if (!entry.vocabulary_id) {
        throw new Error("Missing vocabulary_id")
    }

    if (!Array.isArray(entry.senses)) {
        throw new Error(
            `Invalid senses for vocabulary_id=${entry.vocabulary_id}`
        )
    }

    for (const sense of entry.senses) {
        if (!sense.sense_id) {
            throw new Error(
                `Missing sense_id in vocabulary_id=${entry.vocabulary_id}`
            )
        }

        if (!sense.meaning_vi?.trim()) {
            throw new Error(
                `Missing meaning_vi for sense_id=${sense.sense_id}`
            )
        }

        if (!Array.isArray(sense.meaning_vi_glosses)) {
            throw new Error(
                `Invalid meaning_vi_glosses for sense_id=${sense.sense_id}`
            )
        }
    }
}

async function importBatch() {
    if (!fs.existsSync(INPUT_FILE)) {
        throw new Error(`File not found: ${INPUT_FILE}`)
    }

    const rawData = fs.readFileSync(INPUT_FILE, "utf8")
    const entries = JSON.parse(rawData) as TranslatedEntry[]

    console.log(`Import file: ${INPUT_FILE}`)
    console.log(`Entries: ${entries.length}`)

    let totalSenses = 0

    for (const entry of entries) {
        validateEntry(entry)

        for (const sense of entry.senses) {
            const updateData: TablesUpdate<"vocabulary_senses"> = {
                meaning_vi: sense.meaning_vi,
                meaning_vi_glosses:
                    sense.meaning_vi_glosses as Json,
                meaning_vi_status: "machine",
                meaning_vi_source: "ai",
            }

            const { error } = await supabaseAdmin
                .from("vocabulary_senses")
                .update(updateData)
                .eq("id", sense.sense_id)

            if (error) {
                throw new Error(
                    `Failed to update sense_id=${sense.sense_id}: ${error.message}`
                )
            }

            totalSenses += 1
        }
    }

    console.log(`Imported senses: ${totalSenses}`)
    console.log("Done.")
}

importBatch().catch((error) => {
    console.error(error)
    process.exit(1)
})