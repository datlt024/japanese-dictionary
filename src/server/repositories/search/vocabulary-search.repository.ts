import { supabaseServer } from "@/server/supabase/server"

import type { DictionaryLanguage } from "@/shared/types/dictionaryLanguage"

import {
    SEARCH_VOCABULARY_LIMIT,
} from "@/features/dictionary/search/constants/search.constants"

import {
    normalizeKeyword,
    escapeLikePattern,
} from "@/shared/utils/string"

import {
    isJapaneseKeyword,
} from "@/shared/utils/japanese"

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
        const startedAt = performance.now()

        const { data, error } = await supabaseServer.rpc(
            "search_vocabularies_rpc",
            {
                search_keyword: value,
            }
        )

        console.log(
            "[search_vocabularies_rpc]",
            Math.round(performance.now() - startedAt),
            "ms",
            {
                keyword: value,
                count: data?.length || 0,
            }
        )

        return {
            data: data || [],
            error,
        }
    }

    const escapedValue = escapeLikePattern(value)
    const meaningColumn =
        language === "en" ? "meaning_en" : "meaning_vi"

    const startedAt = performance.now()

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

    console.log(
        "[search_vocabulary_meaning]",
        Math.round(performance.now() - startedAt),
        "ms",
        {
            keyword: value,
            language,
            count: senseResult.data?.length || 0,
        }
    )

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