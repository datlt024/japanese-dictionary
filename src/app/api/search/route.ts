import { NextRequest, NextResponse } from "next/server"

import { searchDictionary } from "@/features/dictionary/search/services/search.service"

import {
    normalizeSearchTab,
} from "@/shared/constants/search-tabs"

import {
    normalizeDictionaryLanguage,
} from "@/shared/types/dictionaryLanguage"

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

    const result = await searchDictionary(
        keyword,
        tab,
        language
    )

    return NextResponse.json(result)
}