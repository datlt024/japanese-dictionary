import { supabaseServer } from "@/server/supabase/server"

import { Vocabulary } from "@/domain/search"

const SEARCH_LIMIT = 50

type VocabularySense = {
    vocabulary_id: number
    meaning_en: string | null
    meaning_vi: string | null
    part_of_speech: string[] | null
}

function normalizeKeyword(keyword: string) {
    return keyword.trim()
}

function escapeLikePattern(keyword: string) {
    return keyword.replace(/[%_]/g, "\\$&")
}

function getFirstSenseByVocabularyId(
    senses: VocabularySense[]
) {
    const map = new Map<number, VocabularySense>()

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
    const normalizedKeyword = normalizeKeyword(keyword)

    if (!normalizedKeyword) {
        return []
    }

    const escapedKeyword = escapeLikePattern(normalizedKeyword)

    const { data: vocabularyRows, error: vocabularyError } =
        await supabaseServer
            .from("vocabularies")
            .select(
                "id, primary_word, primary_kana, jlpt, is_common"
            )
            .or(
                [
                    `primary_word.ilike.%${escapedKeyword}%`,
                    `primary_kana.ilike.%${escapedKeyword}%`,
                ].join(",")
            )
            .limit(SEARCH_LIMIT)

    if (vocabularyError) {
        console.error("Vocabulary search error:", vocabularyError)
        return []
    }

    const vocabularyIds = vocabularyRows.map((item) => item.id)

    if (vocabularyIds.length === 0) {
        return []
    }

    const { data: senseData, error: senseError } =
        await supabaseServer
            .from("vocabulary_senses")
            .select(
                "vocabulary_id, meaning_en, meaning_vi, part_of_speech"
            )
            .in("vocabulary_id", vocabularyIds)
            .order("sense_index", {
                ascending: true,
            })

    if (senseError) {
        console.error("Vocabulary sense search error:", senseError)
    }

    const validSenses = (senseData || [])
        .filter(
            (sense): sense is VocabularySense =>
                sense.vocabulary_id !== null
        )
        .map((sense) => ({
            vocabulary_id: sense.vocabulary_id,
            meaning_en: sense.meaning_en,
            meaning_vi: sense.meaning_vi,
            part_of_speech: sense.part_of_speech,
        }))

    const senseMap = getFirstSenseByVocabularyId(validSenses)

    return vocabularyRows.map((item) => {
        const sense = senseMap.get(item.id)

        return {
            id: item.id,
            word: item.primary_word,
            kana: item.primary_kana || "",
            meaning_en: sense?.meaning_en || null,
            meaning_vi: sense?.meaning_vi || null,
            part_of_speech:
                sense?.part_of_speech?.join(", ") || null,
            jlpt: item.jlpt,
            is_common: item.is_common,
        }
    })
}