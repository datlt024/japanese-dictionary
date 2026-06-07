import { NextRequest, NextResponse } from "next/server"

import {
    getVocabularyById,
    getVocabularyKanjis,
} from "@/server/services/vocabulary/vocabulary.service"

import { getRelatedVocabulariesFromDatabase } from "@/server/services/vocabulary/related-vocabulary.service"

type SearchApiResponse = {
    vocabularies?: {
        id: number
    }[]
}

export async function GET(request: NextRequest) {
    const keyword =
        request.nextUrl.searchParams.get("q")?.trim() || ""

    if (!keyword) {
        return NextResponse.json({
            type: "not_found",
            title: "",
        })
    }

    const searchResponse = await fetch(
        new URL(
            `/api/search?q=${encodeURIComponent(keyword)}&tab=vocabulary&lang=vi`,
            request.url
        )
    )

    const searchData =
        (await searchResponse.json()) as SearchApiResponse

    const firstVocabulary = searchData.vocabularies?.[0]

    if (!firstVocabulary) {
        return NextResponse.json({
            type: "not_found",
            title: keyword,
        })
    }

    const vocabulary = await getVocabularyById(firstVocabulary.id)

    if (!vocabulary) {
        return NextResponse.json({
            type: "not_found",
            title: keyword,
        })
    }

    const relatedResult =
        await getRelatedVocabulariesFromDatabase(vocabulary.word)

    const kanjiDetails = await getVocabularyKanjis(vocabulary.word)

    return NextResponse.json({
        type: "vocabulary",
        title: vocabulary.word,
        vocabulary,
        relatedVocabularies: relatedResult.results,
        kanjiDetails,
    })
}