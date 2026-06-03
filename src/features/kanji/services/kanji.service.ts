import { Database } from "@/shared/types/database.generated"

import { Kanji } from "../types/kanji.types"
import {
    findKanjiByCharacter,
    findKanjiLinks,
    findReadingWords,
    findVocabulariesByIds,
    findVocabularySenses,
} from "../repositories/kanji.repository"
import type {
    KanjiRelatedWord,
    KanjiReadingGroup,
} from "../types"

type VocabularySummary = Pick<
    Database["public"]["Tables"]["vocabularies"]["Row"],
    "id" | "primary_word" | "primary_kana"
>

type VocabularySense = {
    vocabulary_id: number
    meaning_en: string | null
    meaning_vi: string | null
}

type KanjiVocabularyLink = {
    vocabulary_id: number
    priority: number | null
}

const kanjiCache = new Map<string, Kanji | null>()
const readingGroupCache =
    new Map<string, KanjiReadingGroup[]>()

const meaningCache = new Map<
    number,
    {
        meaning_en: string | null
        meaning_vi: string | null
    }
>()

function getFirstSenseByVocabularyId(
    senses: VocabularySense[]
) {
    const map = new Map<number, VocabularySense>()

    for (const sense of senses) {
        if (!map.has(sense.vocabulary_id)) {
            map.set(sense.vocabulary_id, sense)
        }
    }

    return map
}

async function attachMeanings(
    vocabularies: VocabularySummary[]
): Promise<KanjiRelatedWord[]> {
    const ids = vocabularies
        .map((item) => item.id)
        .filter((id) => !meaningCache.has(id))

    if (ids.length > 0) {
        const { data: senses, error } =
            await findVocabularySenses(ids)

        if (error) {
            console.error(error)
        } else {
            const validSenses = (senses || [])
                .filter(
                    (sense): sense is VocabularySense =>
                        sense.vocabulary_id !== null
                )
                .map((sense) => ({
                    vocabulary_id: sense.vocabulary_id,
                    meaning_en: sense.meaning_en,
                    meaning_vi: sense.meaning_vi,
                }))

            const senseMap =
                getFirstSenseByVocabularyId(validSenses)

            for (const id of ids) {
                const sense = senseMap.get(id)

                meaningCache.set(id, {
                    meaning_en:
                        sense?.meaning_en || null,
                    meaning_vi:
                        sense?.meaning_vi || null,
                })
            }
        }
    }

    return vocabularies.map((item) => {
        const meaning = meaningCache.get(item.id)

        return {
            id: item.id,
            word: item.primary_word,
            kana: item.primary_kana,
            meaning_en:
                meaning?.meaning_en || null,
            meaning_vi:
                meaning?.meaning_vi || null,
        }
    })
}

async function getVocabularyIdsByKanji(
    character: string,
    limit = 20
): Promise<KanjiVocabularyLink[]> {
    const {
        data: kanji,
        error: kanjiError,
    } = await findKanjiByCharacter(character)

    if (kanjiError) {
        console.error(kanjiError)
        return []
    }

    if (!kanji) {
        return []
    }

    const { data, error } =
        await findKanjiLinks(Number(kanji.id), limit)

    if (error) {
        console.error(error)
        return []
    }

    return (data || [])
        .filter(
            (
                item
            ): item is KanjiVocabularyLink =>
                item.vocabulary_id !== null
        )
        .map((item) => ({
            vocabulary_id: item.vocabulary_id,
            priority: item.priority,
        }))
}

async function getVocabulariesByIds(
    vocabularyIds: number[]
): Promise<VocabularySummary[]> {
    if (vocabularyIds.length === 0) {
        return []
    }

    const { data, error } =
        await findVocabulariesByIds(vocabularyIds)

    if (error) {
        console.error(error)
        return []
    }

    return data || []
}

function sortWordsByLinkOrder(
    words: KanjiRelatedWord[],
    links: KanjiVocabularyLink[]
) {
    const orderMap = new Map(
        links.map((item, index) => [
            item.vocabulary_id,
            index,
        ])
    )

    return words.sort(
        (a, b) =>
            (orderMap.get(a.id) ?? 9999) -
            (orderMap.get(b.id) ?? 9999)
    )
}

export async function getKanjiByCharacter(
    character: string
): Promise<Kanji | null> {
    const cacheKey = `kanji:${character}`

    if (kanjiCache.has(cacheKey)) {
        return kanjiCache.get(cacheKey) || null
    }

    const { data, error } =
        await findKanjiByCharacter(character)

    if (error) {
        console.error(error)
        kanjiCache.set(cacheKey, null)
        return null
    }

    kanjiCache.set(cacheKey, data)

    return data
}

export async function getWordsByKanji(
    character: string
): Promise<KanjiRelatedWord[]> {
    const links = await getVocabularyIdsByKanji(
        character,
        20
    )

    const vocabularyIds = links.map(
        (item) => item.vocabulary_id
    )

    const vocabularyRows =
        await getVocabulariesByIds(vocabularyIds)

    const words = await attachMeanings(vocabularyRows)

    return sortWordsByLinkOrder(words, links)
}


function katakanaToHiragana(text: string) {
    return text.replace(
        /[\u30a1-\u30f6]/g,
        (char) =>
            String.fromCharCode(
                char.charCodeAt(0) - 0x60
            )
    )
}

function cleanReading(reading: string) {
    return katakanaToHiragana(
        reading
            .replace(/\./g, "")
            .replace(/-/g, "")
            .trim()
    )
}

export async function getWordsByReadingGroups(
    character: string,
    readingsText: string | null
): Promise<KanjiReadingGroup[]> {
    if (!readingsText) {
        return []
    }

    const cacheKey = `reading:${character}:${readingsText}`

    if (readingGroupCache.has(cacheKey)) {
        return readingGroupCache.get(cacheKey) || []
    }

    const readings = readingsText
        .split(";")
        .map((item) => {
            const displayReading = item.trim()
            const searchReading =
                cleanReading(displayReading)

            return {
                displayReading,
                searchReading,
            }
        })
        .filter(
            (item) =>
                item.displayReading &&
                item.searchReading
        )
        .slice(0, 5)

    const results = await Promise.all(
        readings.map(async (reading) => {
            const { data, error } =
                await findReadingWords(
                    character,
                    reading.searchReading
                )

            if (error) {
                console.error(error)
                return null
            }

            const words = await attachMeanings(data || [])

            if (words.length === 0) {
                return null
            }

            return {
                reading:
                    reading.displayReading,
                words,
            }
        })
    )

    const groups = results.filter(
        (
            item
        ): item is KanjiReadingGroup =>
            item !== null
    )

    readingGroupCache.set(cacheKey, groups)

    return groups
}