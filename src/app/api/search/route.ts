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

function uniqueVocabularies(
    items: VocabularyRow[]
) {
    return items.filter(
        (item, index, self) =>
            index ===
            self.findIndex((v) => v.id === item.id)
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
    ])

    const vocabularyError =
        exactVocabularyResult.error ||
        prefixVocabularyResult.error ||
        containsVocabularyResult.error

    if (vocabularyError) {
        return NextResponse.json(
            { error: vocabularyError.message },
            { status: 500 }
        )
    }

    if (kanjiResult.error) {
        return NextResponse.json(
            { error: kanjiResult.error.message },
            { status: 500 }
        )
    }

    const vocabularies = uniqueVocabularies([
        ...(exactVocabularyResult.data || []),
        ...(prefixVocabularyResult.data || []),
        ...(containsVocabularyResult.data || []),
    ] as VocabularyRow[])

    return NextResponse.json({
        vocabularies,
        kanjis: kanjiResult.data ? [kanjiResult.data] : [],
        grammars: [],
        examples: [],
    })
}