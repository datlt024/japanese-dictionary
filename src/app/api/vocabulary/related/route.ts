import { unstable_cache } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

import { getRelatedVocabulariesFromDatabase } from "@/server/services/vocabulary/related-vocabulary.service"
import { serverError } from "@/server/utils/api-error"

const cachedRelatedVocabularies = unstable_cache(
    (keyword: string) => getRelatedVocabulariesFromDatabase(keyword),
    ["related-vocabularies"],
    { revalidate: 3600 }
)

export async function GET(request: NextRequest) {
    const keyword =
        request.nextUrl.searchParams.get("q")?.trim() || ""

    const { results, error } = await cachedRelatedVocabularies(keyword)

    if (error) {
        return serverError(error, "GET /api/vocabulary/related")
    }

    return NextResponse.json(
        { results },
        {
            headers: {
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
            },
        }
    )
}