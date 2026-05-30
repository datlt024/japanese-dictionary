import { supabase } from "./supabase"

export type Vocabulary = {
    id: number
    jmdict_id: string | null
    word: string
    kana: string | null
    meaning_en: string | null
    meaning_vi: string | null
    part_of_speech: string | null
    is_common: boolean | null
}

export async function getVocabularyById(
    id: number
): Promise<Vocabulary | null> {
    const { data, error } = await supabase
        .from("vocabularies")
        .select(
            "id, jmdict_id, word, kana, meaning_en, meaning_vi, part_of_speech, is_common"
        )
        .eq("id", id)
        .maybeSingle()

    if (error) {
        console.error("Get vocabulary error:", error)
        return null
    }

    return data
}

export function getVocabularyMeaning(
    vocabulary: Vocabulary
) {
    return (
        vocabulary.meaning_vi ||
        vocabulary.meaning_en ||
        ""
    )
}