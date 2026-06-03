import dotenv from "dotenv"

dotenv.config({
    path: ".env.local",
})
import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"

import type { Database } from "../src/shared/types/database.generated"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
}

if (!supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
}

const supabase = createClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey
)

type PendingVocabularySense = {
    sense_id: number
    vocabulary_id: number | null
    word: string
    kana: string | null
    sense_index: number
    meaning_en: string | null
    part_of_speech: string[] | null
    field: string[] | null
    misc: string[] | null
    info: string[] | null
}

const OUTPUT_DIR = path.join(
    process.cwd(),
    "data",
    "vocabulary-vi"
)

const OUTPUT_FILE = path.join(
    OUTPUT_DIR,
    "pending-vocabulary-senses.jsonl"
)

const BATCH_SIZE = 1000

async function exportPendingVocabularySenses() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })

    const stream = fs.createWriteStream(OUTPUT_FILE, {
        flags: "w",
    })

    let from = 0
    let total = 0

    while (true) {
        const to = from + BATCH_SIZE - 1

        const { data, error } = await supabase
            .from("vocabulary_senses")
            .select(
                `
                id,
                vocabulary_id,
                sense_index,
                meaning_en,
                meaning_vi,
                part_of_speech,
                field,
                misc,
                info,
                vocabularies (
                    primary_word,
                    primary_kana,
                    is_common
                )
            `
            )
            .or("meaning_vi.is.null,meaning_vi.eq.")
            .order("vocabulary_id", { ascending: true })
            .order("sense_index", { ascending: true })
            .range(from, to)

        if (error) {
            stream.close()
            throw error
        }

        if (!data || data.length === 0) {
            break
        }

        for (const row of data) {
            const vocabulary = Array.isArray(row.vocabularies)
                ? row.vocabularies[0]
                : row.vocabularies

            const item: PendingVocabularySense = {
                sense_id: Number(row.id),
                vocabulary_id: row.vocabulary_id,
                word: vocabulary?.primary_word || "",
                kana: vocabulary?.primary_kana || null,
                sense_index: row.sense_index,
                meaning_en: row.meaning_en,
                part_of_speech: row.part_of_speech,
                field: row.field,
                misc: row.misc,
                info: row.info,
            }

            stream.write(JSON.stringify(item) + "\n")
            total += 1
        }

        console.log(`Exported ${total} rows...`)

        if (data.length < BATCH_SIZE) {
            break
        }

        from += BATCH_SIZE
    }

    stream.close()

    console.log(`Done. Total exported: ${total}`)
    console.log(`Output: ${OUTPUT_FILE}`)
}

exportPendingVocabularySenses().catch((error) => {
    console.error(error)
    process.exit(1)
})