import { supabase } from "@/shared/lib/supabase"

import { Vocabulary } from "../types/vocabulary.types"

export async function searchVocabularies(
    keyword: string
): Promise<Vocabulary[]> {
    const normalizedKeyword = keyword.trim()

    if (!normalizedKeyword) {
        return []
    }

    const { data, error } = await supabase
        .from("vocabularies")
        .select(
            "id, word, kana, meaning_en, meaning_vi, part_of_speech, jlpt, is_common"
        )
        .or(
            [
                `word.ilike.%${normalizedKeyword}%`,
                `kana.ilike.%${normalizedKeyword}%`,
                `meaning_en.ilike.%${normalizedKeyword}%`,
                `meaning_vi.ilike.%${normalizedKeyword}%`,
            ].join(",")
        )
        .limit(50)

    if (error) {
        console.log("Search error message:", error.message)
        console.log("Search error details:", error.details)
        return []
    }

    return data || []
}