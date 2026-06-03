import { supabase } from "@/shared/lib/supabase"

const GRAMMAR_COLUMNS = "*"

export function searchGrammarPointsByKeyword(
    keyword: string
) {
    return supabase
        .from("grammars")
        .select(GRAMMAR_COLUMNS)
        .or(
            [
                `pattern.ilike.%${keyword}%`,
                `reading.ilike.%${keyword}%`,
                `meaning_vi.ilike.%${keyword}%`,
                `meaning_en.ilike.%${keyword}%`,
                `short_meaning_vi.ilike.%${keyword}%`,
                `explanation_vi.ilike.%${keyword}%`,
                `explanation_en.ilike.%${keyword}%`,
            ].join(",")
        )
        .order("id", { ascending: true })
        .limit(20)
}

export function findGrammarPointById(id: number) {
    return supabase
        .from("grammars")
        .select(GRAMMAR_COLUMNS)
        .eq("id", id)
        .maybeSingle()
}