import { NextRequest, NextResponse } from "next/server"

import { searchDictionary } from "@/features/dictionary/search/services/search.service"

import {
    normalizeSearchTab,
} from "@/shared/constants/search-tabs"

import {
    normalizeDictionaryLanguage,
} from "@/shared/types/dictionaryLanguage"

const SEARCH_CACHE_TTL = 1000 * 60 * 5

type SearchResult = Awaited<
    ReturnType<typeof searchDictionary>
>

const searchCache = new Map<
    string,
    {
        expiresAt: number
        data: SearchResult
    }
>()

export async function GET(request: NextRequest) {
    const startedAt = performance.now()

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

    const cacheKey =
        `${keyword}:${tab}:${language}`

    const cached = searchCache.get(cacheKey)

    if (
        cached &&
        cached.expiresAt > Date.now()
    ) {
        console.log("[api/search cache hit]", {
            keyword,
            tab,
            language,
        })

        return NextResponse.json(cached.data)
    }

    const searchStartedAt = performance.now()

    const result = await searchDictionary(
        keyword,
        tab,
        language
    )

    const searchMs = Math.round(
        performance.now() - searchStartedAt
    )

    const totalMs = Math.round(
        performance.now() - startedAt
    )

    searchCache.set(cacheKey, {
        expiresAt:
            Date.now() + SEARCH_CACHE_TTL,
        data: result,
    })
    return NextResponse.json(result)
}