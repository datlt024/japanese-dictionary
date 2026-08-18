import { cache } from "react"

import type { Database } from "@/shared/types/database.generated"
import { cleanReading } from "@/shared/utils/japanese"
import { katakanaToHiragana } from "@/shared/utils/string"

import {
    findKanjiByCharacter,
    findKanjiLinks,
    findReadingExamples,
    findVocabulariesByIds,
    findVocabularySenses,
} from "@/server/repositories/kanji/kanji.repository"

import type { Kanji } from "@/domain/kanji/kanji.type"
import { logger } from "@/server/utils/logger"
import type { KanjiRelatedWord } from "@/domain/kanji/kanji-related-word.type"
import type { KanjiReadingGroup } from "@/domain/kanji/kanji-reading-group.type"

type VocabularySummary = Pick<
    Database["public"]["Tables"]["vocabularies"]["Row"],
    "id" | "primary_word" | "primary_kana"
>

type VocabularySense = Pick<
    Database["public"]["Tables"]["vocabulary_senses"]["Row"],
    "vocabulary_id" | "meaning_en" | "meaning_vi"
>

type KanjiVocabularyLink = Pick<
    Database["public"]["Tables"]["kanji_vocabulary_links"]["Row"],
    "vocabulary_id" | "priority"
>

function getFirstSenseByVocabularyId(senses: VocabularySense[]) {
    const map = new Map<number, VocabularySense>()

    for (const sense of senses) {
        if (sense.vocabulary_id === null) {
            continue
        }

        if (!map.has(sense.vocabulary_id)) {
            map.set(sense.vocabulary_id, sense)
        }
    }

    return map
}

async function attachMeanings(
    vocabularies: VocabularySummary[]
): Promise<KanjiRelatedWord[]> {
    const ids = vocabularies.map((item) => item.id)

    const meaningMap = new Map<number, { meaning_en: string | null; meaning_vi: string | null }>()

    if (ids.length > 0) {
        const { data: senses, error } = await findVocabularySenses(ids)

        if (error) {
            logger.error("kanji.service", "findVocabularySenses failed", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            })
        } else {
            const senseMap = getFirstSenseByVocabularyId(senses || [])

            for (const id of ids) {
                const sense = senseMap.get(id)

                meaningMap.set(id, {
                    meaning_en: sense?.meaning_en || null,
                    meaning_vi: sense?.meaning_vi || null,
                })
            }
        }
    }

    return vocabularies.map((item) => {
        const meaning = meaningMap.get(item.id)

        return {
            id: item.id,
            word: item.primary_word,
            kana: item.primary_kana,
            meaning_en: meaning?.meaning_en || null,
            meaning_vi: meaning?.meaning_vi || null,
        }
    })
}

async function getVocabularyIdsByKanji(
    character: string,
    limit = 20
): Promise<KanjiVocabularyLink[]> {
    const { data: kanji, error: kanjiError } =
        await findKanjiByCharacter(character)

    if (kanjiError) {
        logger.error("kanji.service", "findKanjiByCharacter failed", {
            message: kanjiError.message,
            details: kanjiError.details,
            hint: kanjiError.hint,
            code: kanjiError.code,
        })

        return []
    }

    if (!kanji) {
        return []
    }

    const { data, error } = await findKanjiLinks(kanji.id, limit)

    if (error) {
        logger.error("kanji.service", "findKanjiLinks failed", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        })

        return []
    }

    return data || []
}

async function getVocabulariesByIds(
    vocabularyIds: number[]
): Promise<VocabularySummary[]> {
    if (vocabularyIds.length === 0) {
        return []
    }

    const { data, error } = await findVocabulariesByIds(vocabularyIds)

    if (error) {
        logger.error("kanji.service", "findVocabulariesByIds failed", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        })

        return []
    }

    return data || []
}

function sortWordsByLinkOrder(
    words: KanjiRelatedWord[],
    links: KanjiVocabularyLink[]
) {
    const orderMap = new Map(
        links.map((item, index) => [item.vocabulary_id, index])
    )

    return words.sort(
        (a, b) =>
            (orderMap.get(a.id) ?? 9999) -
            (orderMap.get(b.id) ?? 9999)
    )
}

export const getKanjiByCharacter = cache(async (
    character: string
): Promise<Kanji | null> => {
    const { data, error } = await findKanjiByCharacter(character)

    if (error) {
        logger.error("kanji.service", "findKanjiByCharacter failed", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        })

        return null
    }

    return data
})

export async function getWordsByKanji(
    character: string
): Promise<KanjiRelatedWord[]> {
    const links = await getVocabularyIdsByKanji(character, 20)
    const vocabularyIds = links.map((item) => item.vocabulary_id)
    const vocabularyRows = await getVocabulariesByIds(vocabularyIds)
    const words = await attachMeanings(vocabularyRows)

    return sortWordsByLinkOrder(words, links)
}

function mapRpcItem(item: {
    id: number
    word: string
    kana: string
    meaning_en: string
    meaning_vi: string
}): KanjiRelatedWord {
    return {
        id: item.id,
        word: item.word,
        kana: item.kana,
        meaning_en: item.meaning_en,
        meaning_vi: item.meaning_vi,
    }
}

async function buildReadingGroupsFromVocabulary(
    character: string,
    readings: { displayReading: string; searchReading: string }[]
): Promise<KanjiReadingGroup[]> {
    const links = await getVocabularyIdsByKanji(character, 150)
    if (links.length === 0) return []

    const vocabularyIds = links
        .map((l) => l.vocabulary_id)
        .filter((id): id is number => id !== null)

    const vocabularies = await getVocabulariesByIds(vocabularyIds)
    const words = await attachMeanings(vocabularies)

    const groups: KanjiReadingGroup[] = []

    for (const reading of readings) {
        const matched = words.filter(
            (w) => w.kana && katakanaToHiragana(w.kana).includes(reading.searchReading)
        )
        if (matched.length > 0) {
            groups.push({ reading: reading.displayReading, words: matched.slice(0, 5) })
        }
    }

    return groups
}

export async function getWordsByReadingGroups(
    character: string,
    readingsText: string | null,
    readingType: "onyomi" | "kunyomi"
): Promise<KanjiReadingGroup[]> {
    if (!readingsText) return []

    const readings = readingsText
        .split(";")
        .map((item) => {
            const displayReading = item.trim()
            const searchReading = cleanReading(displayReading)
            return { displayReading, searchReading }
        })
        .filter((item) => item.displayReading && item.searchReading)
        .slice(0, 5)

    if (readings.length === 0) {
        return []
    }

    // Try RPC for all readings in parallel
    const rpcResults = await Promise.all(
        readings.map(async (reading): Promise<KanjiReadingGroup | null> => {
            const { data, error } = await findReadingExamples(
                character,
                reading.searchReading,
                readingType
            )

            // Table doesn't exist — signal fallback needed
            if (error?.code === "42P01") return null

            if (error) {
                logger.error("kanji.service", "findReadingExamples failed", { message: error.message, code: error.code })
                return null
            }

            if (!data?.length) return null

            return { reading: reading.displayReading, words: data.slice(0, 5).map(mapRpcItem) }
        })
    )

    const rpcGroups = rpcResults.filter(
        (item): item is KanjiReadingGroup => item !== null
    )

    // If RPC returned results, use them
    if (rpcGroups.length > 0) {
        return rpcGroups
    }

    // RPC returned nothing (table missing or empty) — fall back to vocabulary data
    return buildReadingGroupsFromVocabulary(character, readings)
}
