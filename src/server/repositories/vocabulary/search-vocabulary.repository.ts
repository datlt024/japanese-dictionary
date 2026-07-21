import { supabaseServer } from "@/server/supabase/server"

import type { DictionaryLanguage } from "@/shared/types/dictionaryLanguage"

import {
    SEARCH_VOCABULARY_LIMIT,
} from "@/shared/constants/search.constants"

import {
    normalizeKeyword,
    escapeLikePattern,
} from "@/shared/utils/string"

import {
    isJapaneseKeyword,
} from "@/shared/utils/japanese"

type VocabularySearchRow = {
    id: number
}

function getJapaneseSearchKeywords(value: string) {
    const keywords = [value]

    if (value.endsWith("する") && value.length > 2) {
        keywords.push(value.slice(0, -2))
    }

    return Array.from(new Set(keywords))
}

function mergeSearchResults<T extends VocabularySearchRow>(
    results: T[]
) {
    const map = new Map<number, T>()

    for (const item of results) {
        if (!map.has(item.id)) {
            map.set(item.id, item)
        }
    }

    return Array.from(map.values())
}

export async function searchVocabulariesByKeyword(
    keyword: string,
    language: DictionaryLanguage = "vi"
) {
    const value = normalizeKeyword(keyword)

    if (!value) {
        return {
            data: [],
            error: null,
        }
    }

    if (isJapaneseKeyword(value)) {
        const keywords = getJapaneseSearchKeywords(value)

        let results
        try {
            results = await Promise.all(
                keywords.map((searchKeyword) =>
                    supabaseServer.rpc("search_vocabularies_rpc", {
                        search_keyword: searchKeyword,
                    })
                )
            )
        } catch (err) {
            return { data: [], error: err as Error }
        }

        const firstError = results.find(
            (result) => result.error
        )?.error

        if (firstError) {
            return {
                data: [],
                error: firstError,
            }
        }

        const merged = mergeSearchResults(
            results.flatMap((result) => result.data || [])
        )

        const data = merged.sort(
            (a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0)
        )

        return {
            data: data.slice(0, SEARCH_VOCABULARY_LIMIT),
            error: null,
        }
    }

    const escapedValue = escapeLikePattern(value)
    const meaningColumn =
        language === "en" ? "meaning_en" : "meaning_vi"

    // Step 1a+b: run exact-match and ILIKE in parallel
    const [exactResult, likeResult] = await Promise.all([
        supabaseServer
            .from("vocabulary_senses")
            .select("vocabulary_id, meaning_en, meaning_vi, part_of_speech")
            .eq(meaningColumn, value)
            .not(meaningColumn, "is", null)
            .limit(200),
        supabaseServer
            .from("vocabulary_senses")
            .select("vocabulary_id, meaning_en, meaning_vi, part_of_speech")
            .ilike(meaningColumn, `%${escapedValue}%`)
            .not(meaningColumn, "is", null)
            .limit(100),
    ])

    const senseError = exactResult.error ?? likeResult.error
    if (senseError) {
        return {
            data: [],
            error: senseError,
        }
    }

    const allSenses = [...(exactResult.data ?? []), ...(likeResult.data ?? [])]

    // Keep the sense whose meaning most closely matches the keyword
    const senseByVocabId = new Map<
        number,
        (typeof allSenses)[number] & { matchScore: number }
    >()
    for (const s of allSenses) {
        if (s.vocabulary_id == null) continue
        const m = (s[meaningColumn] ?? "").toLowerCase().trim()
        const kw = value.toLowerCase()
        const matchScore =
            m === kw ? 3 :
            m.startsWith(kw) ? 2 :
            1
        const existing = senseByVocabId.get(s.vocabulary_id)
        if (!existing || matchScore > existing.matchScore) {
            senseByVocabId.set(s.vocabulary_id, { ...s, matchScore })
        }
    }

    const vocabIds = Array.from(senseByVocabId.keys())
    if (vocabIds.length === 0) {
        return { data: [], error: null }
    }

    // Step 2: fetch priority_score + vocabulary data for all matched vocab_ids
    const indexResult = await supabaseServer
        .from("vocabulary_search_index")
        .select(
            `
            vocabulary_id,
            priority_score,
            vocabularies (
                id,
                primary_word,
                primary_kana,
                jlpt,
                verb_group,
                is_common
            )
        `
        )
        .in("vocabulary_id", vocabIds)

    if (indexResult.error) {
        return {
            data: [],
            error: indexResult.error,
        }
    }

    const jlptRank: Record<string, number> = {
        N5: 5,
        N4: 4,
        N3: 3,
        N2: 2,
        N1: 1,
    }

    type RankedEntry = {
        rank: number
        entry: {
            id: number
            word: string
            kana: string[]
            meaning: string
            meaning_en: string | null
            meaning_vi: string | null
            part_of_speech: string | null
            jlpt: string | null
            verb_group: string | null
            is_common: boolean | null
            priority_score: number | null
        }
    }

    const ranked = (indexResult.data ?? []).flatMap<RankedEntry>((item) => {
        const vocabulary = Array.isArray(item.vocabularies)
            ? item.vocabularies[0]
            : item.vocabularies

        if (!vocabulary) return []

        const sense = senseByVocabId.get(item.vocabulary_id)
        if (!sense) return []

        const rank =
            (item.priority_score ?? 0) * 1_000_000 +
            sense.matchScore * 10_000 +
            (jlptRank[vocabulary.jlpt ?? ""] ?? 0) * 100 -
            (item.vocabulary_id % 100)

        return [
            {
                rank,
                entry: {
                    id: vocabulary.id,
                    word: vocabulary.primary_word,
                    kana: vocabulary.primary_kana
                        ? [vocabulary.primary_kana]
                        : [],
                    meaning:
                        language === "en"
                            ? sense.meaning_en || sense.meaning_vi || ""
                            : sense.meaning_vi || sense.meaning_en || "",
                    meaning_en: sense.meaning_en,
                    meaning_vi: sense.meaning_vi,
                    part_of_speech:
                        sense.part_of_speech?.join(", ") || null,
                    jlpt: vocabulary.jlpt,
                    verb_group: vocabulary.verb_group,
                    is_common: vocabulary.is_common,
                    priority_score: item.priority_score,
                },
            },
        ]
    })

    const data = ranked
        .sort((a, b) => b.rank - a.rank)
        .slice(0, SEARCH_VOCABULARY_LIMIT)
        .map((r) => r.entry)

    return {
        data,
        error: null,
    }
}