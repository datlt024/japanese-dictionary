import { supabaseServer } from "@/server/supabase/server"

import type { DictionaryLanguage } from "@/shared/types/dictionaryLanguage"

const SEARCH_GRAMMAR_LIMIT = 20

const SEARCH_GRAMMAR_COLUMNS = `
    id,
    source_id,
    slug,
    pattern,
    reading,
    jlpt_level,
    meaning_vi,
    meaning_en,
    short_meaning_vi,
    explanation_vi,
    nuance_vi,
    frequency,
    is_common,
    sort_order
`

function createEmptyRepositoryResult<T>() {
    return Promise.resolve({
        data: [] as T[],
        error: null,
    })
}

function escapeLikePattern(value: string) {
    return value.replace(/[%_]/g, "\\$&")
}

export async function searchGrammarsByKeyword(
    keyword: string,
    _language: DictionaryLanguage = "vi"
) {
    const value = escapeLikePattern(keyword.trim())

    if (!value) {
        return createEmptyRepositoryResult()
    }

    return (supabaseServer.from("grammars") as any)
        .select(SEARCH_GRAMMAR_COLUMNS)
        .or(
            [
                `pattern.ilike.%${value}%`,
                `reading.ilike.%${value}%`,
                `slug.ilike.%${value}%`,
                `source_id.ilike.%${value}%`,
                `meaning_vi.ilike.%${value}%`,
                `meaning_en.ilike.%${value}%`,
                `short_meaning_vi.ilike.%${value}%`,
                `explanation_vi.ilike.%${value}%`,
            ].join(",")
        )
        .order("sort_order", { ascending: true })
        .limit(SEARCH_GRAMMAR_LIMIT)
}