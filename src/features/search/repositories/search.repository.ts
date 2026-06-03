import { supabase } from "@/shared/lib/supabase"

const SEARCH_GRAMMAR_COLUMNS =
    "id, pattern, reading, jlpt_level, meaning_vi, meaning_en, short_meaning_vi"

const SEARCH_KANJI_COLUMNS =
    "id, kanji, meaning_vi, meaning_en, onyomi, kunyomi, stroke_count, jlpt, grade, frequency"

export function searchVocabulariesByKeyword(keyword: string) {
    return supabase.rpc("search_vocabularies_rpc", {
        search_keyword: keyword,
    })
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

function searchGrammarsByMeaning(keyword: string) {
    return supabase
        .from("grammars")
        .select(SEARCH_GRAMMAR_COLUMNS)
        .or(
            [
                `meaning_vi.ilike.%${keyword}%`,
                `meaning_en.ilike.%${keyword}%`,
                `short_meaning_vi.ilike.%${keyword}%`,
            ].join(",")
        )
        .limit(8)
}

export async function searchGrammarsByKeyword(keyword: string) {
    const [
        grammarPatternResult,
        grammarReadingResult,
        grammarMeaningResult,
    ] = await Promise.all([
        searchGrammarsByColumn("pattern", keyword),
        searchGrammarsByColumn("reading", keyword),
        searchGrammarsByMeaning(keyword),
    ])

    return {
        grammarPatternResult,
        grammarReadingResult,
        grammarMeaningResult,
    }
}