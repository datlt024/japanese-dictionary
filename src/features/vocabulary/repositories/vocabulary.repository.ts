import { supabase } from "@/shared/lib/supabase"

export async function findVocabularyBaseById(id: number) {
    return supabase
        .from("vocabularies")
        .select(
            "id, jmdict_id, primary_word, primary_kana, jlpt, verb_group, is_common"
        )
        .eq("id", id)
        .maybeSingle()
}

export async function findVocabularySensesByVocabularyId(
    vocabularyId: number
) {
    return supabase
        .from("vocabulary_senses")
        .select(
            "id, sense_index, meaning_en, meaning_vi, meaning_vi_glosses, part_of_speech"
        )
        .eq("vocabulary_id", vocabularyId)
        .order("sense_index", { ascending: true })
}

export async function findVocabularyWritingsByVocabularyId(
    vocabularyId: number
) {
    return supabase
        .from("vocabulary_writings")
        .select("id, writing, is_primary, priority, info")
        .eq("vocabulary_id", vocabularyId)
        .order("priority", { ascending: true })
}

export async function findVocabularyReadingsByVocabularyId(
    vocabularyId: number
) {
    return supabase
        .from("vocabulary_readings")
        .select("id, reading, romaji, is_primary, priority, info")
        .eq("vocabulary_id", vocabularyId)
        .order("priority", { ascending: true })
}