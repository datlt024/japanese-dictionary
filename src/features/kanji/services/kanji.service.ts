import { supabase } from "@/lib/supabase"
import { Kanji } from "../types/kanji.types"

export type KanjiRelatedWord = {
    id: number
    word: string
    kana: string | null
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
        .select("id, word, kana, meaning_en, meaning_vi")
        .ilike("word", `%${character}%`)
        .limit(20)

    if (error) {
        console.error(error)
        return []
    }

    return data || []
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
            .select("id, word, kana, meaning_en, meaning_vi")
            .ilike("word", `%${character}%`)
            .ilike("kana", `%${reading.searchReading}%`)
            .limit(5)

        if (error) {
            console.error(error)
            continue
        }

        groups.push({
            reading: reading.displayReading,
            words: data || [],
        })
    }

    readingGroupCache.set(cacheKey, groups)

    return groups
}