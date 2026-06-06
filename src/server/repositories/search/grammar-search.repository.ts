import { supabaseServer } from "@/server/supabase/server"

import type { DictionaryLanguage } from "@/shared/types/dictionaryLanguage"

import {
    SEARCH_GRAMMAR_COLUMNS,
    SEARCH_GRAMMAR_LIMIT,
} from "@/features/dictionary/search/constants/search.constants"

import {
    normalizeKeyword,
    escapeLikePattern,
} from "@/shared/utils/string"

function createEmptyRepositoryResult<T>() {
    return Promise.resolve({
        data: [] as T[],
        error: null,
    })
}

function searchGrammarsByColumn(
    column: "pattern" | "reading",
    keyword: string
) {
    const value = escapeLikePattern(
        normalizeKeyword(keyword)
    )

    if (!value) {
        return createEmptyRepositoryResult()
    }

    return supabaseServer
        .from("grammars")
        .select(SEARCH_GRAMMAR_COLUMNS)
        .ilike(column, `%${value}%`)
        .limit(SEARCH_GRAMMAR_LIMIT)
}

function searchGrammarsByMeaning(
    keyword: string,
    language: DictionaryLanguage = "vi"
) {
    const value = escapeLikePattern(
        normalizeKeyword(keyword)
    )

    if (!value) {
        return createEmptyRepositoryResult()
    }

    const columns =
        language === "en"
            ? [
                `meaning_en.ilike.%${value}%`,
                `meaning_vi.ilike.%${value}%`,
                `short_meaning_vi.ilike.%${value}%`,
            ]
            : [
                `meaning_vi.ilike.%${value}%`,
                `short_meaning_vi.ilike.%${value}%`,
                `meaning_en.ilike.%${value}%`,
            ]

    return supabaseServer
        .from("grammars")
        .select(SEARCH_GRAMMAR_COLUMNS)
        .or(columns.join(","))
        .limit(SEARCH_GRAMMAR_LIMIT)
}

export async function searchGrammarsByKeyword(
    keyword: string,
    language: DictionaryLanguage = "vi"
) {
    const value = normalizeKeyword(keyword)

    const [
        grammarPatternResult,
        grammarReadingResult,
        grammarMeaningResult,
    ] = await Promise.all([
        searchGrammarsByColumn("pattern", value),
        searchGrammarsByColumn("reading", value),
        searchGrammarsByMeaning(value, language),
    ])

    return {
        grammarPatternResult,
        grammarReadingResult,
        grammarMeaningResult,
    }
}