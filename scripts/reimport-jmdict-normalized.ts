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

const FILE_PATH = path.join(
    process.cwd(),
    "data-import",
    "jmdict-eng-3.6.2.json"
)

const CHUNK_SIZE = 300

type JmdictKanji = {
    text: string
    common?: boolean
    tags?: string[]
}

type JmdictKana = {
    text: string
    common?: boolean
    tags?: string[]
    appliesToKanji?: string[]
}

type JmdictGloss = {
    lang: string
    text: string
    gender?: string | null
    type?: string | null
}

type JmdictSense = {
    partOfSpeech?: string[]
    appliesToKanji?: string[]
    appliesToKana?: string[]
    related?: unknown[]
    antonym?: unknown[]
    field?: string[]
    dialect?: string[]
    misc?: string[]
    info?: string[]
    languageSource?: unknown[]
    gloss?: JmdictGloss[]
}

type JmdictWord = {
    id: string
    kanji: JmdictKanji[]
    kana: JmdictKana[]
    sense: JmdictSense[]
}

type VocabularyWritingInsert = {
    vocabulary_id: number
    writing: string
    is_primary: boolean
    priority: number
    info: string[] | null
}

type VocabularyReadingInsert = {
    vocabulary_id: number
    reading: string
    romaji: string | null
    is_primary: boolean
    priority: number
    info: string[] | null
}

type VocabularySenseInsert = {
    vocabulary_id: number
    sense_index: number
    meaning_en: string
    meaning_vi: string | null
    meaning_vi_glosses: unknown | null
    meaning_vi_status: string
    meaning_vi_source: string | null
    part_of_speech: string[] | null
    field: string[] | null
    misc: string[] | null
    info: string[] | null
}

function getPrimaryWord(item: JmdictWord) {
    const commonKanji = item.kanji.find((kanji) => kanji.common)
    const firstKanji = item.kanji[0]

    const commonKana = item.kana.find((kana) => kana.common)
    const firstKana = item.kana[0]

    return (
        commonKanji?.text ||
        firstKanji?.text ||
        commonKana?.text ||
        firstKana?.text ||
        ""
    )
}

function getPrimaryKana(item: JmdictWord) {
    const commonKana = item.kana.find((kana) => kana.common)
    const firstKana = item.kana[0]

    return commonKana?.text || firstKana?.text || null
}

function getIsCommon(item: JmdictWord) {
    return (
        item.kanji.some((kanji) => kanji.common) ||
        item.kana.some((kana) => kana.common)
    )
}

function getSenseMeaningEn(sense: JmdictSense) {
    const glosses =
        sense.gloss
            ?.filter((gloss) => gloss.lang === "eng")
            .map((gloss) => gloss.text)
            .filter(Boolean) || []

    return Array.from(new Set(glosses)).join("; ")
}

function chunkArray<T>(items: T[], size: number) {
    const chunks: T[][] = []

    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size))
    }

    return chunks
}

async function deleteVocabularyChildren(
    vocabularyIds: number[]
) {
    if (vocabularyIds.length === 0) {
        return
    }

    const childTables = [
        "vocabulary_senses",
        "vocabulary_writings",
        "vocabulary_readings",
    ] as const

    for (const table of childTables) {
        const { error } = await supabase
            .from(table)
            .delete()
            .in("vocabulary_id", vocabularyIds)

        if (error) {
            throw error
        }
    }
}

async function reimportJmdictNormalized() {
    console.log("Reading JMdict file...")

    const rawData = fs.readFileSync(FILE_PATH, "utf8")
    const jsonData = JSON.parse(rawData)

    const words = jsonData.words as JmdictWord[]

    const validWords = words.filter((item) => {
        return getPrimaryWord(item) && item.sense.length > 0
    })

    console.log(`Total JMdict entries: ${words.length}`)
    console.log(`Valid entries: ${validWords.length}`)

    const chunks = chunkArray(validWords, CHUNK_SIZE)

    let totalProcessed = 0
    let totalInsertedSenses = 0

    for (const [chunkIndex, chunk] of chunks.entries()) {
        const vocabularyRows = chunk.map((item) => ({
            jmdict_id: item.id,
            primary_word: getPrimaryWord(item),
            primary_kana: getPrimaryKana(item),
            is_common: getIsCommon(item),
            source: "jmdict",
            updated_at: new Date().toISOString(),
        }))

        const {
            data: upsertedVocabularies,
            error: vocabularyError,
        } = await supabase
            .from("vocabularies")
            .upsert(vocabularyRows, {
                onConflict: "jmdict_id",
            })
            .select("id, jmdict_id")

        if (vocabularyError) {
            throw vocabularyError
        }

        const vocabularyIdMap = new Map<string, number>()

        for (const vocabulary of upsertedVocabularies || []) {
            if (vocabulary.jmdict_id) {
                vocabularyIdMap.set(
                    vocabulary.jmdict_id,
                    Number(vocabulary.id)
                )
            }
        }

        const vocabularyIds = Array.from(vocabularyIdMap.values())

        await deleteVocabularyChildren(vocabularyIds)

        const writingRows: VocabularyWritingInsert[] = []
        const readingRows: VocabularyReadingInsert[] = []
        const senseRows: VocabularySenseInsert[] = []

        for (const item of chunk) {
            const vocabularyId = vocabularyIdMap.get(item.id)

            if (!vocabularyId) {
                continue
            }

            const primaryWord = getPrimaryWord(item)
            const primaryKana = getPrimaryKana(item)

            const writings =
                item.kanji.length > 0
                    ? item.kanji
                    : [
                        {
                            text: primaryWord,
                            common: true,
                            tags: [],
                        },
                    ]

            writings.forEach((writing, index) => {
                writingRows.push({
                    vocabulary_id: vocabularyId,
                    writing: writing.text,
                    is_primary: writing.text === primaryWord,
                    priority: index + 1,
                    info:
                        writing.tags && writing.tags.length > 0
                            ? writing.tags
                            : null,
                })
            })

            item.kana.forEach((reading, index) => {
                readingRows.push({
                    vocabulary_id: vocabularyId,
                    reading: reading.text,
                    romaji: null,
                    is_primary: reading.text === primaryKana,
                    priority: index + 1,
                    info:
                        reading.tags && reading.tags.length > 0
                            ? reading.tags
                            : null,
                })
            })

            item.sense.forEach((sense, index) => {
                const meaningEn = getSenseMeaningEn(sense)

                if (!meaningEn) {
                    return
                }

                senseRows.push({
                    vocabulary_id: vocabularyId,
                    sense_index: index + 1,
                    meaning_en: meaningEn,
                    meaning_vi: null,
                    meaning_vi_glosses: null,
                    meaning_vi_status: "pending",
                    meaning_vi_source: null,
                    part_of_speech:
                        sense.partOfSpeech &&
                            sense.partOfSpeech.length > 0
                            ? sense.partOfSpeech
                            : null,
                    field:
                        sense.field && sense.field.length > 0
                            ? sense.field
                            : null,
                    misc:
                        sense.misc && sense.misc.length > 0
                            ? sense.misc
                            : null,
                    info:
                        sense.info && sense.info.length > 0
                            ? sense.info
                            : null,
                })
            })
        }

        if (writingRows.length > 0) {
            const { error } = await supabase
                .from("vocabulary_writings")
                .insert(writingRows)

            if (error) {
                throw error
            }
        }

        if (readingRows.length > 0) {
            const { error } = await supabase
                .from("vocabulary_readings")
                .insert(readingRows)

            if (error) {
                throw error
            }
        }

        if (senseRows.length > 0) {
            const { error } = await supabase
                .from("vocabulary_senses")
                .insert(senseRows)

            if (error) {
                throw error
            }
        }

        totalProcessed += chunk.length
        totalInsertedSenses += senseRows.length

        console.log(
            `Chunk ${chunkIndex + 1}/${chunks.length}: processed=${totalProcessed}, senses=${totalInsertedSenses}`
        )
    }

    console.log("Done.")
    console.log(`Processed entries: ${totalProcessed}`)
    console.log(`Inserted senses: ${totalInsertedSenses}`)
}

reimportJmdictNormalized().catch((error) => {
    console.error(error)
    process.exit(1)
})