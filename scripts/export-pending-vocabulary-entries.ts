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

const OUTPUT_DIR = path.join(
    process.cwd(),
    "data",
    "vocabulary-vi"
)

const OUTPUT_FILE = path.join(
    OUTPUT_DIR,
    "pending-vocabulary-entries.jsonl"
)

const PAGE_SIZE = 1000

type VocabularyRow = {
    id: number
    primary_word: string
    primary_kana: string | null
    romaji: string | null
    jlpt: string | null
    is_common: boolean | null
    verb_group: string | null
}

type SenseRow = {
    id: number
    vocabulary_id: number | null
    sense_index: number
    meaning_en: string | null
    meaning_vi: string | null
    part_of_speech: string[] | null
    field: string[] | null
    misc: string[] | null
    info: string[] | null
}

async function getAllPendingVocabularyIds() {
    const ids = new Set<number>()

    let from = 0

    while (true) {
        const to = from + PAGE_SIZE - 1

        const { data, error } = await supabase
            .from("vocabulary_senses")
            .select("vocabulary_id")
            .or("meaning_vi.is.null,meaning_vi.eq.")
            .not("vocabulary_id", "is", null)
            .order("vocabulary_id", { ascending: true })
            .range(from, to)

        if (error) {
            throw error
        }

        if (!data || data.length === 0) {
            break
        }

        for (const item of data) {
            if (typeof item.vocabulary_id === "number") {
                ids.add(item.vocabulary_id)
            }
        }

        console.log(
            `Scanned pending senses: ${from + data.length}, unique vocabulary ids: ${ids.size}`
        )

        if (data.length < PAGE_SIZE) {
            break
        }

        from += PAGE_SIZE
    }

    return Array.from(ids).sort((a, b) => a - b)
}

function chunkArray<T>(items: T[], size: number) {
    const chunks: T[][] = []

    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size))
    }

    return chunks
}

async function getVocabularies(ids: number[]) {
    const { data, error } = await supabase
        .from("vocabularies")
        .select(
            "id, primary_word, primary_kana, romaji, jlpt, is_common, verb_group"
        )
        .in("id", ids)

    if (error) {
        throw error
    }

    return (data || []) as VocabularyRow[]
}

async function getSenses(ids: number[]) {
    const { data, error } = await supabase
        .from("vocabulary_senses")
        .select(
            "id, vocabulary_id, sense_index, meaning_en, meaning_vi, part_of_speech, field, misc, info"
        )
        .in("vocabulary_id", ids)
        .order("vocabulary_id", { ascending: true })
        .order("sense_index", { ascending: true })

    if (error) {
        throw error
    }

    return (data || []) as SenseRow[]
}

async function exportPendingVocabularyEntries() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })

    const pendingVocabularyIds =
        await getAllPendingVocabularyIds()

    console.log(
        `Total unique pending vocabulary ids: ${pendingVocabularyIds.length}`
    )

    const stream = fs.createWriteStream(OUTPUT_FILE, {
        flags: "w",
    })

    let totalEntries = 0
    let totalPendingSenses = 0
    let maxSenses = 0

    const chunks = chunkArray(pendingVocabularyIds, PAGE_SIZE)

    for (const [chunkIndex, ids] of chunks.entries()) {
        const [vocabularies, senses] =
            await Promise.all([
                getVocabularies(ids),
                getSenses(ids),
            ])

        const vocabularyMap = new Map<number, VocabularyRow>()

        for (const vocabulary of vocabularies) {
            vocabularyMap.set(vocabulary.id, vocabulary)
        }

        const senseMap = new Map<number, SenseRow[]>()

        for (const sense of senses) {
            if (!sense.vocabulary_id) continue

            const list =
                senseMap.get(sense.vocabulary_id) || []

            list.push(sense)
            senseMap.set(sense.vocabulary_id, list)
        }

        for (const id of ids) {
            const vocabulary = vocabularyMap.get(id)

            if (!vocabulary) {
                continue
            }

            const allSenses =
                senseMap.get(id) || []

            const pendingSenses = allSenses.filter(
                (sense) =>
                    !sense.meaning_vi ||
                    sense.meaning_vi.trim() === ""
            )

            if (pendingSenses.length === 0) {
                continue
            }

            maxSenses = Math.max(
                maxSenses,
                pendingSenses.length
            )

            stream.write(
                JSON.stringify({
                    vocabulary_id: vocabulary.id,
                    word: vocabulary.primary_word,
                    kana: vocabulary.primary_kana,
                    romaji: vocabulary.romaji,
                    jlpt: vocabulary.jlpt,
                    is_common: vocabulary.is_common,
                    verb_group: vocabulary.verb_group,
                    senses: pendingSenses.map((sense) => ({
                        sense_id: sense.id,
                        sense_index: sense.sense_index,
                        meaning_en: sense.meaning_en,
                        part_of_speech: sense.part_of_speech,
                        field: sense.field,
                        misc: sense.misc,
                        info: sense.info,
                    })),
                }) + "\n"
            )

            totalEntries += 1
            totalPendingSenses += pendingSenses.length
        }

        console.log(
            `Chunk ${chunkIndex + 1}/${chunks.length}: entries=${totalEntries}, pending senses=${totalPendingSenses}, max senses=${maxSenses}`
        )
    }

    stream.close()

    console.log("Done.")
    console.log(`Entries: ${totalEntries}`)
    console.log(`Pending senses: ${totalPendingSenses}`)
    console.log(`Max senses per entry: ${maxSenses}`)
    console.log(`Output: ${OUTPUT_FILE}`)
}

exportPendingVocabularyEntries().catch((error) => {
    console.error(error)
    process.exit(1)
})