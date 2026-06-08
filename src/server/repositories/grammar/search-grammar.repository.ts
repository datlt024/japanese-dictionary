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

export function searchGrammarsByKeyword(
    keyword: string,
    language: DictionaryLanguage = "vi"
) {
    const value = escapeLikePattern(
        normalizeKeyword(keyword)
    )

    if (!value) {
        return createEmptyRepositoryResult()
    }

    const meaningColumns =
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

    const filters = [
        `pattern.ilike.%${value}%`,
        `reading.ilike.%${value}%`,
        ...meaningColumns,
    ]

    return supabaseServer
        .from("grammars")
        .select(SEARCH_GRAMMAR_COLUMNS)
        .or(filters.join(","))
        .limit(SEARCH_GRAMMAR_LIMIT)
}