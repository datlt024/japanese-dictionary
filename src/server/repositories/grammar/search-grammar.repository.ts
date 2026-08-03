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

const JLPT_LEVEL_RE = /^N[1-5]$/i

export async function searchGrammarsByKeyword(keyword: string) {
    const trimmed = keyword.trim()
    if (!trimmed) return { data: [], error: null }

    // When keyword is a JLPT level code (N1–N5), filter by level instead of text search
    if (JLPT_LEVEL_RE.test(trimmed)) {
        return supabaseServer
            .from("grammars")
            .select(SEARCH_GRAMMAR_COLUMNS)
            .eq("jlpt_level", trimmed.toUpperCase())
            .order("sort_order", { ascending: true })
            .limit(100)
    }

    const value = escapeLikePattern(trimmed)
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
