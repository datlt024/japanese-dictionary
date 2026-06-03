import { NextRequest, NextResponse } from "next/server"

import { supabase } from "@/shared/lib/supabase"

import {
    GrammarSearchRow,
    KanjiRow,
    VocabularyResult,
} from "@/shared/types/database"

const GRAMMAR_COLUMNS =
    "id, pattern, reading, jlpt_level, meaning_vi, meaning_en, short_meaning_vi"

function uniqueById<T extends { id: number }>(items: T[]) {
    return items.filter(
        (item, index, self) =>
            index === self.findIndex((v) => v.id === item.id)
    )
}



export async function GET(request: NextRequest) {
    const keyword =
        request.nextUrl.searchParams
            .get("q")
            ?.trim() || ""

    const tab =
        request.nextUrl.searchParams
            .get("tab") || "all"

    if (!keyword) {
        return NextResponse.json({
            vocabularies: [],
            kanjis: [],
            grammars: [],
            examples: [],
        })
    }

    let vocabularies: VocabularyResult[] = []
    let grammars: GrammarSearchRow[] = []
    let kanjis: KanjiRow[] = []

    if (tab === "vocabulary" || tab === "all") {
        const { data, error } = await supabase.rpc(
            "search_vocabularies_rpc",
            {
                search_keyword: keyword,
            }
        )

        if (error) {
            console.error("Vocabulary search error:", error)
        }

        vocabularies = (data || []) as VocabularyResult[]
    }

    if (tab === "kanji" || tab === "all") {
        const { data } = await supabase
            .from("kanjis")
            .select(
                "id, kanji, meaning_vi, meaning_en, onyomi, kunyomi, stroke_count, jlpt, grade, frequency"
            )
            .eq("kanji", keyword)
            .maybeSingle()

        kanjis = data ? ([data] as KanjiRow[]) : []
    }

    if (tab === "grammar" || tab === "all") {
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

        grammars = uniqueById([
            ...((grammarPatternResult.data || []) as GrammarSearchRow[]),
            ...((grammarReadingResult.data || []) as GrammarSearchRow[]),
            ...((grammarMeaningResult.data || []) as GrammarSearchRow[]),
        ])
    }

    return NextResponse.json({
        vocabularies,
        kanjis,
        grammars,
        examples: [],
    })
}