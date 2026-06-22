import { unstable_cache } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

import { searchDictionary } from "@/features/dictionary/search/services/search.service"

import {
    normalizeSearchTab,
} from "@/shared/constants/search-tabs"

import {
    normalizeDictionaryLanguage,
} from "@/shared/types/dictionaryLanguage"

const cachedSearchDictionary = unstable_cache(
    searchDictionary,
    ["dictionary-search"],
    { revalidate: 300 }
)

export async function GET(request: NextRequest) {
    const keyword =
        request.nextUrl.searchParams
            .get("q")
            ?.trim() || ""

    const tab = normalizeSearchTab(
        request.nextUrl.searchParams.get("tab")
    )

    const language = normalizeDictionaryLanguage(
        request.nextUrl.searchParams.get("lang")
    )

    if (!keyword) {
        return NextResponse.json({
            vocabularies: [],
            kanjis: [],
            grammars: [],
            examples: [],
        })
    }

    const result = await cachedSearchDictionary(keyword, tab, language)

    return NextResponse.json(result, {
        headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
    })
}
