import { NextRequest, NextResponse } from "next/server"

import { supabase } from "@/lib/supabase"

type SearchIndexRow = {
    vocabulary_id: number
    priority_score: number | null
}

type VocabularyRow = {
    id: number
    primary_word: string
    primary_kana: string | null
    jlpt: string | null
    verb_group: string | null
    is_common: boolean | null
}

type SenseRow = {
    vocabulary_id: number
    meaning_vi: string | null
    meaning_en: string | null
}

type VocabularyResult = {
    id: number
    word: string
    kana: string[]
    meaning: string
    jlpt: string | null
    verb_group: string | null
    is_common: boolean | null
    priority_score: number | null
}

const GRAMMAR_COLUMNS =
    "id, pattern, reading, jlpt_level, meaning_vi, meaning_en, short_meaning_vi, explanation_vi, explanation_en, nuance_vi, formation, examples, similar_grammar, differences, notes, tags, frequency, is_common"

function uniqueById<T extends { id: number }>(items: T[]) {
    return items.filter(
        (item, index, self) =>
            index === self.findIndex((v) => v.id === item.id)
    )
}

function groupByWord(items: VocabularyResult[]) {
    const map = new Map<string, VocabularyResult>()

    for (const item of items) {
        const existing = map.get(item.word)

        if (!existing) {
            map.set(item.word, { ...item })
            continue
        }

        existing.kana = Array.from(
            new Set([...existing.kana, ...item.kana])
        )

        existing.priority_score = Math.max(
            existing.priority_score || 0,
            item.priority_score || 0
        )

        existing.is_common =
            Boolean(existing.is_common) || Boolean(item.is_common)

        if (!existing.meaning && item.meaning) {
            existing.meaning = item.meaning
        }
    }

    return Array.from(map.values())
}

function getFirstSenseMap(senses: SenseRow[]) {
    const map = new Map<number, SenseRow>()

    for (const sense of senses) {
        if (!map.has(sense.vocabulary_id)) {
            map.set(sense.vocabulary_id, sense)
        }
    }

    return map
}

export async function GET(request: NextRequest) {
    const keyword =
        request.nextUrl.searchParams.get("q")?.trim() || ""

    if (!keyword) {
        return NextResponse.json({
            vocabularies: [],
            kanjis: [],
            grammars: [],
            examples: [],
        })
    }

    const [
        exactWordResult,
        exactKanaResult,
        containsResult,
        kanjiResult,
        grammarPatternResult,
        grammarReadingResult,
        grammarMeaningResult,
    ] = await Promise.all([
        supabase
            .from("vocabulary_search_index")
            .select("vocabulary_id, priority_score")
            .eq("word_text", keyword)
            .order("priority_score", { ascending: false })
            .limit(10),

        supabase
            .from("vocabulary_search_index")
            .select("vocabulary_id, priority_score")
            .eq("kana_text", keyword)
            .order("priority_score", { ascending: false })
            .limit(10),

        supabase
            .from("vocabulary_search_index")
            .select("vocabulary_id, priority_score")
            .ilike("search_text", `%${keyword}%`)
            .order("priority_score", { ascending: false })
            .limit(50),

        supabase
            .from("kanjis")
            .select("*")
            .eq("kanji", keyword)
            .maybeSingle(),

        supabase
            .from("grammars")
            .select(GRAMMAR_COLUMNS)
            .ilike("pattern", `%${keyword}%`)
            .limit(20),

        supabase
            .from("grammars")
            .select(GRAMMAR_COLUMNS)
            .ilike("reading", `%${keyword}%`)
            .limit(20),

        supabase
            .from("grammars")
            .select(GRAMMAR_COLUMNS)
            .or(
                [
                    `meaning_vi.ilike.%${keyword}%`,
                    `meaning_en.ilike.%${keyword}%`,
                    `short_meaning_vi.ilike.%${keyword}%`,
                    `explanation_vi.ilike.%${keyword}%`,
                    `explanation_en.ilike.%${keyword}%`,
                ].join(",")
            )
            .limit(20),
    ])

    const error =
        exactWordResult.error ||
        exactKanaResult.error ||
        containsResult.error ||
        kanjiResult.error ||
        grammarPatternResult.error ||
        grammarReadingResult.error ||
        grammarMeaningResult.error

    if (error) {
        console.error("Search API error:", error)

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }

    const searchRows = [
        ...((exactWordResult.data || []) as SearchIndexRow[]),
        ...((exactKanaResult.data || []) as SearchIndexRow[]),
        ...((containsResult.data || []) as SearchIndexRow[]),
    ]

    const uniqueSearchRows = searchRows.filter(
        (item, index, self) =>
            index ===
            self.findIndex(
                (v) => v.vocabulary_id === item.vocabulary_id
            )
    )

    const vocabularyIds = uniqueSearchRows.map(
        (item) => item.vocabulary_id
    )

    let vocabularies: VocabularyResult[] = []

    if (vocabularyIds.length > 0) {
        const [vocabularyResult, sensesResult] =
            await Promise.all([
                supabase
                    .from("vocabularies")
                    .select(
                        "id, primary_word, primary_kana, jlpt, verb_group, is_common"
                    )
                    .in("id", vocabularyIds),

                supabase
                    .from("vocabulary_senses")
                    .select(
                        "vocabulary_id, meaning_vi, meaning_en"
                    )
                    .in("vocabulary_id", vocabularyIds)
                    .order("sense_index", { ascending: true }),
            ])

        if (vocabularyResult.error) {
            console.error(
                "Vocabulary fetch error:",
                vocabularyResult.error
            )

            return NextResponse.json(
                { error: vocabularyResult.error.message },
                { status: 500 }
            )
        }

        if (sensesResult.error) {
            console.error(
                "Vocabulary senses fetch error:",
                sensesResult.error
            )

            return NextResponse.json(
                { error: sensesResult.error.message },
                { status: 500 }
            )
        }

        const vocabularyRows =
            (vocabularyResult.data || []) as VocabularyRow[]

        const senseMap = getFirstSenseMap(
            (sensesResult.data || []) as SenseRow[]
        )

        const mappedVocabularies = uniqueSearchRows
            .map((searchRow) => {
                const vocabulary = vocabularyRows.find(
                    (item) =>
                        item.id === searchRow.vocabulary_id
                )

                if (!vocabulary) return null

                const sense = senseMap.get(vocabulary.id)

                return {
                    id: vocabulary.id,
                    word: vocabulary.primary_word,
                    kana: vocabulary.primary_kana
                        ? [vocabulary.primary_kana]
                        : [],
                    meaning:
                        sense?.meaning_vi ||
                        sense?.meaning_en ||
                        "",
                    jlpt: vocabulary.jlpt,
                    verb_group: vocabulary.verb_group,
                    is_common: vocabulary.is_common,
                    priority_score: searchRow.priority_score,
                }
            })
            .filter((item): item is VocabularyResult => item !== null)

        vocabularies = groupByWord(mappedVocabularies)
    }

    const grammars = uniqueById([
        ...(grammarPatternResult.data || []),
        ...(grammarReadingResult.data || []),
        ...(grammarMeaningResult.data || []),
    ])

    return new NextResponse(
        JSON.stringify({
            vocabularies,
            kanjis: kanjiResult.data ? [kanjiResult.data] : [],
            grammars,
            examples: [],
        }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
        }
    )
}