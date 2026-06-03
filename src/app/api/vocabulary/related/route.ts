import { NextRequest, NextResponse } from "next/server"

import { supabase } from "@/shared/lib/supabase"

type RelatedVocabularyRow = {
    id: number
    word: string
    kana: string | null
    meaning: string
    priority_score: number | null
}

export async function GET(request: NextRequest) {
    const keyword =
        request.nextUrl.searchParams.get("q")?.trim() || ""

    if (!keyword) {
        return NextResponse.json({
            results: [],
        })
    }

    const { data, error } = await supabase.rpc(
        "get_related_vocabularies_rpc",
        {
            search_keyword: keyword,
        }
    )

    if (error) {
        return NextResponse.json(
            {
                error: error.message,
            },
            {
                status: 500,
            }
        )
    }

    return NextResponse.json({
        results: (data || []) as RelatedVocabularyRow[],
    })
}