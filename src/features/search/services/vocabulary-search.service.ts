import { supabase } from "@/shared/lib/supabase"

import { Vocabulary } from "../types/vocabulary.types"

type SearchVocabularyRow = {
    id: number
    primary_word: string
    primary_kana: string | null
    jlpt: string | null
    is_common: boolean | null
}

type VocabularySenseRow = {
    vocabulary_id: number
    meaning_en: string | null
    meaning_vi: string | null
}

function getFirstSenseByVocabularyId(
    senses: VocabularySenseRow[]
) {
    const map = new Map<number, VocabularySenseRow>()

    for (const sense of senses) {
        if (!map.has(sense.vocabulary_id)) {
            map.set(sense.vocabulary_id, sense)
        }
    }

    return map
}

export async function searchVocabularies(
    keyword: string
): Promise<Vocabulary[]> {
    const normalizedKeyword = keyword.trim()

    if (!normalizedKeyword) {
        return []
    }

    const { data: vocabularyData, error: vocabularyError } =
        await supabase
            .from("vocabularies")
            .select(
                "id, primary_word, primary_kana, jlpt, is_common"
            )
            .or(
                [
                    `primary_word.ilike.%${normalizedKeyword}%`,
                    `primary_kana.ilike.%${normalizedKeyword}%`,
                ].join(",")
            )
            .limit(50)

    if (vocabularyError) {
        console.log(
            "Search error message:",
            vocabularyError.message
        )
        console.log(
            "Search error details:",
            vocabularyError.details
        )
        return []
    }

    const vocabularyRows =
        (vocabularyData || []) as SearchVocabularyRow[]

    const vocabularyIds = vocabularyRows.map((item) => item.id)

    if (vocabularyIds.length === 0) {
        return []
    }

    const { data: senseData, error: senseError } =
        await supabase
            .from("vocabulary_senses")
            .select(
                "vocabulary_id, meaning_en, meaning_vi"
            )
            .in("vocabulary_id", vocabularyIds)
            .order("sense_index", {
                ascending: true,
            })

    if (senseError) {
        console.log(
            "Sense error message:",
            senseError.message
        )
        console.log(
            "Sense error details:",
            senseError.details
        )
    }

    const senseMap = getFirstSenseByVocabularyId(
        (senseData || []) as VocabularySenseRow[]
    )

    return vocabularyRows.map((item) => {
        const sense = senseMap.get(item.id)

        return {
            id: item.id,
            word: item.primary_word,
            kana: item.primary_kana || "",
            meaning_en: sense?.meaning_en || null,
            meaning_vi: sense?.meaning_vi || null,
            part_of_speech: null,
            jlpt: item.jlpt,
            is_common: item.is_common,
        }
    })
}