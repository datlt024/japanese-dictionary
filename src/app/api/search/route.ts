import { NextRequest, NextResponse } from "next/server"

import { supabase } from "@/lib/supabase"

type VocabularyRow = {
    id: number
    word: string
    kana: string | null
    meaning_en: string | null
    meaning_vi: string | null
    part_of_speech: string | null
    is_common: boolean | null
}

const VOCABULARY_COLUMNS =
    "id, word, kana, meaning_en, meaning_vi, part_of_speech, is_common"

const GRAMMAR_COLUMNS =
    "id, pattern, reading, jlpt_level, meaning_vi, meaning_en, short_meaning_vi, explanation_vi, explanation_en, nuance_vi, formation, examples, similar_grammar, differences, notes, tags, frequency, is_common"

function uniqueById<T extends { id: number }>(items: T[]) {
    return items.filter(
        (item, index, self) =>
            index === self.findIndex((v) => v.id === item.id)
    )
}

export async function GET(request: NextRequest) {
    const keyword =
        request.nextUrl.searchParams.get("q")?.trim() || ""

    if (!keyword) {
        return NextResponse.json({
            vocabularies: [],
            kanjis: [],
            grammars: [],
            examples: [],
        })
    }

    const [
        exactVocabularyResult,
        prefixVocabularyResult,
        containsVocabularyResult,
        kanjiResult,
        grammarPatternResult,
        grammarReadingResult,
        grammarMeaningResult,
    ] = await Promise.all([
        supabase
            .from("vocabularies")
            .select(VOCABULARY_COLUMNS)
            .or(`word.eq.${keyword},kana.eq.${keyword}`)
            .limit(10),

        supabase
            .from("vocabularies")
            .select(VOCABULARY_COLUMNS)
            .or(`word.ilike.${keyword}%,kana.ilike.${keyword}%`)
            .limit(20),

        supabase
            .from("vocabularies")
            .select(VOCABULARY_COLUMNS)
            .or(
                [
                    `word.ilike.%${keyword}%`,
                    `kana.ilike.%${keyword}%`,
                    `meaning_en.ilike.%${keyword}%`,
                    `meaning_vi.ilike.%${keyword}%`,
                ].join(",")
            )
            .limit(30),

        supabase
            .from("kanjis")
            .select("*")
            .eq("kanji", keyword)
            .maybeSingle(),

        supabase
            .from("grammars")
            .select(GRAMMAR_COLUMNS)
            .ilike("pattern", `%${keyword}%`)
            .limit(20),

        supabase
            .from("grammars")
            .select(GRAMMAR_COLUMNS)
            .ilike("reading", `%${keyword}%`)
            .limit(20),

        supabase
            .from("grammars")
            .select(GRAMMAR_COLUMNS)
            .or(
                [
                    `meaning_vi.ilike.%${keyword}%`,
                    `meaning_en.ilike.%${keyword}%`,
                    `short_meaning_vi.ilike.%${keyword}%`,
                    `explanation_vi.ilike.%${keyword}%`,
                    `explanation_en.ilike.%${keyword}%`,
                ].join(",")
            )
            .limit(20),
    ])

    const error =
        exactVocabularyResult.error ||
        prefixVocabularyResult.error ||
        containsVocabularyResult.error ||
        kanjiResult.error ||
        grammarPatternResult.error ||
        grammarReadingResult.error ||
        grammarMeaningResult.error

    if (error) {
        console.error("Search API error:", error)

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }

    const vocabularies = uniqueById([
        ...(exactVocabularyResult.data || []),
        ...(prefixVocabularyResult.data || []),
        ...(containsVocabularyResult.data || []),
    ] as VocabularyRow[])

    const grammars = uniqueById([
        ...(grammarPatternResult.data || []),
        ...(grammarReadingResult.data || []),
        ...(grammarMeaningResult.data || []),
    ])

    return NextResponse.json({
        vocabularies,
        kanjis: kanjiResult.data ? [kanjiResult.data] : [],
        grammars,
        examples: [],
    })
}