import { NextRequest, NextResponse } from "next/server"

import {
    SearchTab,
    searchDictionary,
} from "@/features/search/services/search.service"

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

export async function GET(request: NextRequest) {
    const keyword =
        request.nextUrl.searchParams
            .get("q")
            ?.trim() || ""

    const tab = normalizeSearchTab(
        request.nextUrl.searchParams.get("tab")
    )

    const result = await searchDictionary(keyword, tab)

    return NextResponse.json(result)
}