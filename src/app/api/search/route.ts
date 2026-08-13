import { unstable_cache } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

import { searchDictionary } from "@/server/services/search/search.service"
import { checkRateLimit, getClientIp } from "@/shared/utils/rate-limit"

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
    const ip = getClientIp(request)
    const { ok, remaining, resetAt } = checkRateLimit(`search:${ip}`, 60, 60_000)

    if (!ok) {
        return NextResponse.json(
            { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
            {
                status: 429,
                headers: {
                    "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
                    "X-RateLimit-Limit": "60",
                    "X-RateLimit-Remaining": String(remaining),
                },
            }
        )
    }

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

    if (!keyword || keyword.length > 200) {
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
