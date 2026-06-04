import { supabase } from "@/shared/lib/supabase"

import type { DictionaryLanguage } from "@/shared/types/dictionaryLanguage"

const SEARCH_GRAMMAR_COLUMNS =
    "id, pattern, reading, jlpt_level, meaning_vi, meaning_en, short_meaning_vi"

const SEARCH_KANJI_COLUMNS =
    "id, kanji, meaning_vi, meaning_en, onyomi, kunyomi, stroke_count, jlpt, grade, frequency"

const SEARCH_VOCABULARY_LIMIT = 20

function normalizeKeyword(keyword: string) {
    return keyword.trim()
}

function isJapaneseKeyword(keyword: string) {
    return /[\u3040-\u30ff\u4e00-\u9faf]/.test(keyword)
}

function escapeLikePattern(keyword: string) {
    return keyword.replace(/[%_]/g, "\\$&")
}

export async function searchVocabulariesByKeyword(
    keyword: string,
    language: DictionaryLanguage = "vi"
) {
    const value = normalizeKeyword(keyword)

    if (!value) {
        return {
            data: [],
            error: null,
        }
    }

    const escapedValue = escapeLikePattern(value)

    if (isJapaneseKeyword(value)) {
        const { data, error } = await supabase.rpc(
            "search_vocabularies_rpc",
            {
                search_keyword: value,
            }
        )

        return {
            data: data || [],
            error,
        }
    }

    const meaningColumn =
        language === "en" ? "meaning_en" : "meaning_vi"

    const senseResult = await supabase
        .from("vocabulary_senses")
        .select(
            `
            vocabulary_id,
            meaning_en,
            meaning_vi,
            part_of_speech,
            vocabularies (
                id,
                primary_word,
                primary_kana,
                jlpt,
                verb_group,
                is_common
            )
        `
        )
        .ilike(meaningColumn, `%${escapedValue}%`)
        .not(meaningColumn, "is", null)
        .limit(SEARCH_VOCABULARY_LIMIT)

    if (senseResult.error) {
        return {
            data: [],
            error: senseResult.error,
        }
    }

    const data =
        senseResult.data?.flatMap((item) => {
            const vocabulary = Array.isArray(item.vocabularies)
                ? item.vocabularies[0]
                : item.vocabularies

            if (!vocabulary) {
                return []
            }

            return [
                {
                    id: vocabulary.id,
                    word: vocabulary.primary_word,
                    kana: vocabulary.primary_kana
                        ? [vocabulary.primary_kana]
                        : [],
                    meaning:
                        language === "en"
                            ? item.meaning_en || item.meaning_vi || ""
                            : item.meaning_vi || item.meaning_en || "",
                    meaning_en: item.meaning_en,
                    meaning_vi: item.meaning_vi,
                    part_of_speech:
                        item.part_of_speech?.join(", ") || null,
                    jlpt: vocabulary.jlpt,
                    verb_group: vocabulary.verb_group,
                    is_common: vocabulary.is_common,
                    priority_score: null,
                },
            ]
        }) || []

    return {
        data,
        error: null,
    }
}

export function searchKanjiByKeyword(keyword: string) {
    return supabase
        .from("kanjis")
        .select(SEARCH_KANJI_COLUMNS)
        .eq("kanji", keyword)
        .maybeSingle()
}

function searchGrammarsByColumn(
    column: "pattern" | "reading",
    keyword: string
) {
    return supabase
        .from("grammars")
        .select(SEARCH_GRAMMAR_COLUMNS)
        .ilike(column, `%${keyword}%`)
        .limit(8)
}

function searchGrammarsByMeaning(
    keyword: string,
    language: DictionaryLanguage = "vi"
) {
    const columns =
        language === "en"
            ? [
                `meaning_en.ilike.%${keyword}%`,
                `meaning_vi.ilike.%${keyword}%`,
                `short_meaning_vi.ilike.%${keyword}%`,
            ]
            : [
                `meaning_vi.ilike.%${keyword}%`,
                `short_meaning_vi.ilike.%${keyword}%`,
                `meaning_en.ilike.%${keyword}%`,
            ]

    return supabase
        .from("grammars")
        .select(SEARCH_GRAMMAR_COLUMNS)
        .or(columns.join(","))
        .limit(8)
}

export async function searchGrammarsByKeyword(
    keyword: string,
    language: DictionaryLanguage = "vi"
) {
    const [
        grammarPatternResult,
        grammarReadingResult,
        grammarMeaningResult,
    ] = await Promise.all([
        searchGrammarsByColumn("pattern", keyword),
        searchGrammarsByColumn("reading", keyword),
        searchGrammarsByMeaning(keyword, language),
    ])

    return {
        grammarPatternResult,
        grammarReadingResult,
        grammarMeaningResult,
    }
}