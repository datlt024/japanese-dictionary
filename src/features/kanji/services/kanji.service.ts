import { supabase } from "@/shared/lib/supabase"
import { Kanji } from "../types/kanji.types"

export type KanjiRelatedWord = {
    id: number
    word: string
    kana: string | null
    meaning_en: string | null
    meaning_vi: string | null
}

type VocabularyRow = {
    id: number
    primary_word: string
    primary_kana: string | null
}

type VocabularySenseRow = {
    vocabulary_id: number
    meaning_en: string | null
    meaning_vi: string | null
}

type KanjiVocabularyLinkRow = {
    vocabulary_id: number
    priority: number
}

export type KanjiReadingGroup = {
    reading: string
    words: KanjiRelatedWord[]
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
    senses: VocabularySenseRow[]
) {
    const map = new Map<number, VocabularySenseRow>()

    for (const sense of senses) {
        if (!map.has(sense.vocabulary_id)) {
            map.set(sense.vocabulary_id, sense)
        }
    }

    return map
}

async function attachMeanings(
    vocabularies: VocabularyRow[]
): Promise<KanjiRelatedWord[]> {
    const ids = vocabularies
        .map((item) => item.id)
        .filter((id) => !meaningCache.has(id))

    if (ids.length > 0) {
        const { data: senses, error } = await supabase
            .from("vocabulary_senses")
            .select(
                "vocabulary_id, meaning_en, meaning_vi"
            )
            .in("vocabulary_id", ids)
            .order("sense_index", {
                ascending: true,
            })

        if (error) {
            console.error(error)
        } else {
            const senseMap = getFirstSenseByVocabularyId(
                (senses || []) as VocabularySenseRow[]
            )

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
        const meaning =
            meaningCache.get(item.id)

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
) {
    const { data: kanji, error: kanjiError } = await supabase
        .from("kanjis")
        .select("id")
        .eq("kanji", character)
        .maybeSingle()

    if (kanjiError) {
        console.error(kanjiError)
        return []
    }

    if (!kanji) {
        return []
    }

    const { data, error } = await supabase
        .from("kanji_vocabulary_links")
        .select("vocabulary_id, priority")
        .eq("kanji_id", kanji.id)
        .order("priority", {
            ascending: false,
        })
        .limit(limit)

    if (error) {
        console.error(error)
        return []
    }

    return (data || []) as KanjiVocabularyLinkRow[]
}

async function getVocabulariesByIds(
    vocabularyIds: number[]
) {
    if (vocabularyIds.length === 0) {
        return []
    }

    const { data, error } = await supabase
        .from("vocabularies")
        .select("id, primary_word, primary_kana")
        .in("id", vocabularyIds)

    if (error) {
        console.error(error)
        return []
    }

    return (data || []) as VocabularyRow[]
}

function sortWordsByLinkOrder(
    words: KanjiRelatedWord[],
    links: KanjiVocabularyLinkRow[]
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

    const { data, error } = await supabase
        .from("kanjis")
        .select("*")
        .eq("kanji", character)
        .maybeSingle()

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

export function getRelatedWordMeaning(
    word: KanjiRelatedWord
) {
    return word.meaning_vi || word.meaning_en || ""
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
            const { data, error } = await supabase
                .from("vocabularies")
                .select("id, primary_word, primary_kana")
                .ilike(
                    "primary_word",
                    `%${character}%`
                )
                .ilike(
                    "primary_kana",
                    `%${reading.searchReading}%`
                )
                .limit(5)

            if (error) {
                console.error(error)
                return null
            }

            const words = await attachMeanings(
                (data || []) as VocabularyRow[]
            )

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