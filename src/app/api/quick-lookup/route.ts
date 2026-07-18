import { unstable_cache } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

import { checkRateLimit, getClientIp } from "@/shared/utils/rate-limit"

import {
    getVocabularyById,
    getVocabularyKanjis,
} from "@/server/services/vocabulary/vocabulary.service"

import { getRelatedVocabulariesFromDatabase } from "@/server/services/vocabulary/related-vocabulary.service"

import {
    getKanjiByCharacter,
    getWordsByReadingGroups,
} from "@/features/dictionary/kanji/services/kanji.service"

import { searchVocabulariesByKeyword } from "@/server/repositories/vocabulary/search-vocabulary.repository"
import { extractKanjis } from "@/features/dictionary/kanji/utils"
import { uniqueArray } from "@/shared/utils/array"

// Direct function call with cache — avoids internal HTTP round-trip to /api/search
const cachedSearchVocabularies = unstable_cache(
    (keyword: string) => searchVocabulariesByKeyword(keyword, "vi"),
    ["quick-lookup-vocab-search"],
    { revalidate: 300 }
)

async function createKanjiTarget(
    kanjiCharacter: string,
    searchKeyword: string,
    kanjiOptions: string[]
) {
    const kanji = await getKanjiByCharacter(kanjiCharacter)

    if (!kanji) {
        return null
    }

    const [kunyomiGroups, onyomiGroups] = await Promise.all([
        getWordsByReadingGroups(kanjiCharacter, kanji.kunyomi, "kunyomi"),
        getWordsByReadingGroups(kanjiCharacter, kanji.onyomi, "onyomi"),
    ])

    return {
        type: "kanji" as const,
        title: kanji.kanji,
        kanji,
        kunyomiGroups,
        onyomiGroups,
        currentKanji: kanjiCharacter,
        kanjiOptions,
        searchKeyword,
    }
}

async function createKanjiTargets(keyword: string) {
    const kanjiOptions = uniqueArray(extractKanjis(keyword))

    if (kanjiOptions.length === 0) {
        return []
    }

    const targets = await Promise.all(
        kanjiOptions.map((kanjiCharacter) =>
            createKanjiTarget(
                kanjiCharacter,
                keyword,
                kanjiOptions
            )
        )
    )

    return targets.filter((target): target is NonNullable<typeof target> =>
        Boolean(target)
    )
}

async function getVocabularyTarget(keyword: string) {
    const { data, error } = await cachedSearchVocabularies(keyword)

    if (error || !data?.length) return null

    const firstVocabulary = data[0]
    const vocabulary = await getVocabularyById(firstVocabulary.id)

    if (!vocabulary) return null

    // Run all three in parallel — they only need vocabulary.word
    const [relatedResult, kanjiDetails, kanjiTargets] = await Promise.all([
        getRelatedVocabulariesFromDatabase(vocabulary.word),
        getVocabularyKanjis(vocabulary.word),
        createKanjiTargets(vocabulary.word),
    ])

    return {
        type: "vocabulary" as const,
        title: vocabulary.word,
        vocabulary,
        relatedVocabularies: relatedResult.results,
        kanjiDetails,
        kanjiTargets,
    }
}

async function getKanjiTarget(keyword: string) {
    const kanjiOptions = uniqueArray(extractKanjis(keyword))
    const firstKanji = kanjiOptions[0]

    if (!firstKanji) {
        return null
    }

    return createKanjiTarget(firstKanji, keyword, kanjiOptions)
}

// Cache the full lookup result to make repeated lookups instant
const cachedQuickLookup = unstable_cache(
    async (keyword: string) => {
        // Run vocabulary and kanji lookups in parallel — for kanji-only searches
        // this saves the full vocabulary search latency instead of running sequentially
        const [vocabularyTarget, kanjiTarget] = await Promise.all([
            getVocabularyTarget(keyword),
            getKanjiTarget(keyword),
        ])

        if (vocabularyTarget) return vocabularyTarget
        if (kanjiTarget) return kanjiTarget
        return { type: "not_found" as const, title: keyword }
    },
    ["quick-lookup-result"],
    { revalidate: 3600 }
)

export async function GET(request: NextRequest) {
    const ip = getClientIp(request)
    const { ok, resetAt } = checkRateLimit(`ql:${ip}`, 60, 60_000)

    if (!ok) {
        return NextResponse.json(
            { type: "not_found", title: "", error: "Quá nhiều yêu cầu." },
            {
                status: 429,
                headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) },
            }
        )
    }

    const keyword =
        request.nextUrl.searchParams.get("q")?.trim() || ""

    if (!keyword || keyword.length > 200) {
        return NextResponse.json({
            type: "not_found",
            title: "",
        })
    }

    const result = await cachedQuickLookup(keyword)

    return NextResponse.json(result, {
        headers: {
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
    })
}
