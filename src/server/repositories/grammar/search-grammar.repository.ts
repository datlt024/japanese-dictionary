import { supabaseServer } from "@/server/supabase/server"
import { escapeLikePattern } from "@/shared/utils/string"

const SEARCH_GRAMMAR_LIMIT = 20

const SEARCH_GRAMMAR_COLUMNS = `
    id,
    pattern,
    display_pattern,
    reading,
    jlpt_level,
    meaning_vi,
    meaning_en,
    short_meaning_vi,
    explanation_vi
`

export async function searchGrammarsByKeyword(keyword: string) {
    const value = escapeLikePattern(keyword.trim())

    if (!value) {
        return { data: [], error: null }
    }

    return supabaseServer
        .from("grammars")
        .select(SEARCH_GRAMMAR_COLUMNS)
        .or(
            [
                `pattern.ilike.%${value}%`,
                `reading.ilike.%${value}%`,
                `slug.ilike.%${value}%`,
                `meaning_vi.ilike.%${value}%`,
                `short_meaning_vi.ilike.%${value}%`,
            ].join(",")
        )
        .order("sort_order", { ascending: true })
        .limit(SEARCH_GRAMMAR_LIMIT)
}
