import { NextRequest, NextResponse } from "next/server"

import { searchDictionary } from "@/features/search/services/search.service"

import type { SearchTab } from "@/features/search/types"
import type { DictionaryLanguage } from "@/shared/types/dictionaryLanguage"

function normalizeSearchTab(tab: string | null): SearchTab {
    if (
        tab === "vocabulary" ||
        tab === "kanji" ||
        tab === "grammar" ||
        tab === "example" ||
        tab === "jpjp" ||
        tab === "all"
    ) {
        return tab
    }

    return "all"
}

function normalizeDictionaryLanguage(
    lang: string | null
): DictionaryLanguage {
    if (lang === "en" || lang === "vi") {
        return lang
    }

    return "vi"
}

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