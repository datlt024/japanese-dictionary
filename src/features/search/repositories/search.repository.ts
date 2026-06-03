import { supabase } from "@/shared/lib/supabase"

const GRAMMAR_COLUMNS =
    "id, pattern, reading, jlpt_level, meaning_vi, meaning_en, short_meaning_vi"

export function searchVocabulariesByKeyword(keyword: string) {
    return supabase.rpc("search_vocabularies_rpc", {
        search_keyword: keyword,
    })
}

export function searchKanjiByKeyword(keyword: string) {
    return supabase
        .from("kanjis")
        .select(
            "id, kanji, meaning_vi, meaning_en, onyomi, kunyomi, stroke_count, jlpt, grade, frequency"
        )
        .eq("kanji", keyword)
        .maybeSingle()
}

export async function searchGrammarsByKeyword(keyword: string) {
    const [
        grammarPatternResult,
        grammarReadingResult,
        grammarMeaningResult,
    ] = await Promise.all([
        supabase
            .from("grammars")
            .select(GRAMMAR_COLUMNS)
            .ilike("pattern", `%${keyword}%`)
            .limit(8),

        supabase
            .from("grammars")
            .select(GRAMMAR_COLUMNS)
            .ilike("reading", `%${keyword}%`)
            .limit(8),

        supabase
            .from("grammars")
            .select(GRAMMAR_COLUMNS)
            .or(
                [
                    `meaning_vi.ilike.%${keyword}%`,
                    `meaning_en.ilike.%${keyword}%`,
                    `short_meaning_vi.ilike.%${keyword}%`,
                ].join(",")
            )
            .limit(8),
    ])

    return {
        grammarPatternResult,
        grammarReadingResult,
        grammarMeaningResult,
    }
}