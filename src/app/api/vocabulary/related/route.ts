import { NextRequest, NextResponse } from "next/server"

import { supabase } from "@/shared/lib/supabase"

type SearchRow = {
    vocabulary_id: number
    priority_score: number | null
}

type VocabularyRow = {
    id: number
    primary_word: string
    primary_kana: string | null
}

type SenseRow = {
    vocabulary_id: number
    meaning_vi: string | null
    meaning_en: string | null
}

export async function GET(request: NextRequest) {
    const keyword =
        request.nextUrl.searchParams.get("q")?.trim() || ""

    if (!keyword) {
        return NextResponse.json({ results: [] })
    }

    const { data: searchData, error: searchError } =
        await supabase
            .from("vocabulary_search_index")
            .select("vocabulary_id, priority_score")
            .eq("word_text", keyword)
            .order("priority_score", { ascending: false })
            .limit(20)

    if (searchError) {
        return NextResponse.json(
            { error: searchError.message },
            { status: 500 }
        )
    }

    const searchRows = (searchData || []) as SearchRow[]
    const vocabularyIds = searchRows.map(
        (item) => item.vocabulary_id
    )

    if (vocabularyIds.length === 0) {
        return NextResponse.json({ results: [] })
    }

    const [
        vocabularyResult,
        sensesResult,
    ] = await Promise.all([
        supabase
            .from("vocabularies")
            .select("id, primary_word, primary_kana")
            .in("id", vocabularyIds),

        supabase
            .from("vocabulary_senses")
            .select("vocabulary_id, meaning_vi, meaning_en")
            .in("vocabulary_id", vocabularyIds)
            .order("sense_index", { ascending: true }),
    ])

    if (vocabularyResult.error) {
        return NextResponse.json(
            { error: vocabularyResult.error.message },
            { status: 500 }
        )
    }

    if (sensesResult.error) {
        return NextResponse.json(
            { error: sensesResult.error.message },
            { status: 500 }
        )
    }

    const vocabularyRows =
        (vocabularyResult.data || []) as VocabularyRow[]

    const senseRows = (sensesResult.data || []) as SenseRow[]

    const results = searchRows
        .map((searchRow) => {
            const vocabulary = vocabularyRows.find(
                (item) => item.id === searchRow.vocabulary_id
            )

            if (!vocabulary) return null

            const sense = senseRows.find(
                (item) => item.vocabulary_id === vocabulary.id
            )

            return {
                id: vocabulary.id,
                word: vocabulary.primary_word,
                kana: vocabulary.primary_kana,
                meaning:
                    sense?.meaning_vi ||
                    sense?.meaning_en ||
                    "",
                priority_score: searchRow.priority_score,
            }
        })
        .filter(Boolean)

    return new NextResponse(
        JSON.stringify({ results }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
        }
    )
}