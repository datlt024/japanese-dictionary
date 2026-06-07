import { NextRequest, NextResponse } from "next/server"

import {
    getVocabularyById,
    getVocabularyKanjis,
} from "@/server/services/vocabulary/vocabulary.service"

import { getRelatedVocabulariesFromDatabase } from "@/server/services/vocabulary/related-vocabulary.service"

import {
    getKanjiByCharacter,
    getWordsByReadingGroups,
} from "@/features/dictionary/kanji/services/kanji.service"

import { extractKanjis } from "@/features/dictionary/kanji/utils"
import { uniqueArray } from "@/shared/utils/uniqueArray"

type SearchApiResponse = {
    vocabularies?: {
        id: number
    }[]
}

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
        getWordsByReadingGroups(kanjiCharacter, kanji.kunyomi),
        getWordsByReadingGroups(kanjiCharacter, kanji.onyomi),
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

async function getVocabularyTarget(
    keyword: string,
    requestUrl: string
) {
    const searchResponse = await fetch(
        new URL(
            `/api/search?q=${encodeURIComponent(
                keyword
            )}&tab=vocabulary&lang=vi`,
            requestUrl
        )
    )

    if (!searchResponse.ok) {
        return null
    }

    const searchData =
        (await searchResponse.json()) as SearchApiResponse

    const firstVocabulary = searchData.vocabularies?.[0]

    if (!firstVocabulary) {
        return null
    }

    const vocabulary = await getVocabularyById(firstVocabulary.id)

    if (!vocabulary) {
        return null
    }

    const relatedResult =
        await getRelatedVocabulariesFromDatabase(vocabulary.word)

    const [kanjiDetails, kanjiTargets] = await Promise.all([
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

    return createKanjiTarget(
        firstKanji,
        keyword,
        kanjiOptions
    )
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

    const vocabularyTarget = await getVocabularyTarget(
        keyword,
        request.url
    )

    if (vocabularyTarget) {
        return NextResponse.json(vocabularyTarget)
    }

    const kanjiTarget = await getKanjiTarget(keyword)

    if (kanjiTarget) {
        return NextResponse.json(kanjiTarget)
    }

    return NextResponse.json({
        type: "not_found",
        title: keyword,
    })
}