import { supabaseServer } from "@/server/supabase/server"

const GRAMMAR_COLUMNS = `
    id,
    pattern,
    reading,
    jlpt_level,
    meaning_vi,
    meaning_en,
    short_meaning_vi,
    explanation_vi,
    explanation_en,
    nuance_vi,
    formation,
    examples,
    differences,
    similar_grammar,
    notes,
    tags,
    frequency,
    is_common,
    created_at,
    updated_at
`

const SEARCH_LIMIT = 20

function normalizeKeyword(keyword: string) {
    return keyword.trim()
}

function escapeLikePattern(keyword: string) {
    return keyword.replace(/[%_]/g, "\\$&")
}

export function searchGrammarPointsByKeyword(keyword: string) {
    const value = escapeLikePattern(normalizeKeyword(keyword))

    return supabaseServer
        .from("grammars")
        .select(GRAMMAR_COLUMNS)
        .or(
            [
                `pattern.ilike.%${value}%`,
                `reading.ilike.%${value}%`,
                `meaning_vi.ilike.%${value}%`,
                `meaning_en.ilike.%${value}%`,
                `short_meaning_vi.ilike.%${value}%`,
                `explanation_vi.ilike.%${value}%`,
                `explanation_en.ilike.%${value}%`,
            ].join(",")
        )
        .order("id", {
            ascending: true,
        })
        .limit(SEARCH_LIMIT)
}

export function findGrammarPointById(id: number) {
    return supabaseServer
        .from("grammars")
        .select(GRAMMAR_COLUMNS)
        .eq("id", id)
        .maybeSingle()
}