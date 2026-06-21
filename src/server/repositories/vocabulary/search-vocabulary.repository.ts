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

        const results = await Promise.all(
            keywords.map((searchKeyword) =>
                supabaseServer.rpc("search_vocabularies_rpc", {
                    search_keyword: searchKeyword,
                })
            )
        )

        const firstError = results.find(
            (result) => result.error
        )?.error

        if (firstError) {
            return {
                data: [],
                error: firstError,
            }
        }

        const data = mergeSearchResults(
            results.flatMap((result) => result.data || [])
        )

        return {
            data: data.slice(0, SEARCH_VOCABULARY_LIMIT),
            error: null,
        }
    }

    const escapedValue = escapeLikePattern(value)
    const meaningColumn =
        language === "en" ? "meaning_en" : "meaning_vi"

    const senseResult = await supabaseServer
        .from("vocabulary_senses")
        .select(
            `
            vocabulary_id,
            meaning_en,
            meaning_vi,
            part_of_speech,
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
        .ilike(meaningColumn, `%${escapedValue}%`)
        .not(meaningColumn, "is", null)
        .limit(SEARCH_VOCABULARY_LIMIT)

    if (senseResult.error) {
        return {
            data: [],
            error: senseResult.error,
        }
    }

    const data =
        senseResult.data?.flatMap((item) => {
            const vocabulary = Array.isArray(item.vocabularies)
                ? item.vocabularies[0]
                : item.vocabularies

            if (!vocabulary) {
                return []
            }

            return [
                {
                    id: vocabulary.id,
                    word: vocabulary.primary_word,
                    kana: vocabulary.primary_kana
                        ? [vocabulary.primary_kana]
                        : [],
                    meaning:
                        language === "en"
                            ? item.meaning_en ||
                            item.meaning_vi ||
                            ""
                            : item.meaning_vi ||
                            item.meaning_en ||
                            "",
                    meaning_en: item.meaning_en,
                    meaning_vi: item.meaning_vi,
                    part_of_speech:
                        item.part_of_speech?.join(", ") || null,
                    jlpt: vocabulary.jlpt,
                    verb_group: vocabulary.verb_group,
                    is_common: vocabulary.is_common,
                    priority_score: null,
                },
            ]
        }) || []

    return {
        data,
        error: null,
    }
}