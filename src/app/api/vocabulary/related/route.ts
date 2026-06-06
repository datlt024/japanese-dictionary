import { NextRequest, NextResponse } from "next/server"

import { getRelatedVocabulariesFromDatabase } from "@/server/services/vocabulary/related-vocabulary.service"

export async function GET(request: NextRequest) {
    const keyword =
        request.nextUrl.searchParams.get("q")?.trim() || ""

    const { results, error } =
        await getRelatedVocabulariesFromDatabase(keyword)

    if (error) {
        return NextResponse.json(
            {
                error,
            },
            {
                status: 500,
            }
        )
    }

    return NextResponse.json({
        results,
    })
}