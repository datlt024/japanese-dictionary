import { supabase } from "@/lib/supabase"
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

export type KanjiReadingGroup = {
    reading: string
    words: KanjiRelatedWord[]
}

const kanjiCache = new Map<string, Kanji | null>()
const readingGroupCache =
    new Map<string, KanjiReadingGroup[]>()

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
    const ids = vocabularies.map((item) => item.id)

    if (ids.length === 0) {
        return []
    }

    const { data: senses, error } = await supabase
        .from("vocabulary_senses")
        .select("vocabulary_id, meaning_en, meaning_vi")
        .in("vocabulary_id", ids)
        .order("sense_index", { ascending: true })

    if (error) {
        console.error(error)

        return vocabularies.map((item) => ({
            id: item.id,
            word: item.primary_word,
            kana: item.primary_kana,
            meaning_en: null,
            meaning_vi: null,
        }))
    }

    const senseMap = getFirstSenseByVocabularyId(
        (senses || []) as VocabularySenseRow[]
    )

    return vocabularies.map((item) => {
        const sense = senseMap.get(item.id)

        return {
            id: item.id,
            word: item.primary_word,
            kana: item.primary_kana,
            meaning_en: sense?.meaning_en || null,
            meaning_vi: sense?.meaning_vi || null,
        }
    })
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
    const { data, error } = await supabase
        .from("vocabularies")
        .select("id, primary_word, primary_kana")
        .ilike("primary_word", `%${character}%`)
        .limit(20)

    if (error) {
        console.error(error)
        return []
    }

    return attachMeanings((data || []) as VocabularyRow[])
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
        .slice(0, 3)

    const groups: KanjiReadingGroup[] = []

    for (const reading of readings) {
        const { data, error } = await supabase
            .from("vocabularies")
            .select("id, primary_word, primary_kana")
            .ilike("primary_word", `%${character}%`)
            .ilike("primary_kana", `%${reading.searchReading}%`)
            .limit(5)

        if (error) {
            console.error(error)
            continue
        }

        const words = await attachMeanings(
            (data || []) as VocabularyRow[]
        )

        groups.push({
            reading: reading.displayReading,
            words,
        })
    }

    readingGroupCache.set(cacheKey, groups)

    return groups
}