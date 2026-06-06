import { supabaseServer as supabase } from "@/shared/lib/supabase/server"

const VOCABULARY_BASE_COLUMNS =
    "id, jmdict_id, primary_word, primary_kana, jlpt, verb_group, is_common"

const VOCABULARY_SENSE_COLUMNS =
    "id, sense_index, meaning_en, meaning_vi, meaning_vi_glosses, part_of_speech"

const VOCABULARY_WRITING_COLUMNS =
    "id, writing, is_primary, priority, info"

const VOCABULARY_READING_COLUMNS =
    "id, reading, romaji, is_primary, priority, info"
const VOCABULARY_KANJI_COLUMNS =
    "id, kanji, meaning_vi, meaning_en, onyomi, kunyomi, stroke_count, jlpt, grade, frequency"

const VOCABULARY_CHILD_LIMIT = 100

export async function findVocabularyBaseById(id: number) {
    return supabase
        .from("vocabularies")
        .select(VOCABULARY_BASE_COLUMNS)
        .eq("id", id)
        .maybeSingle()
}

export async function findVocabularySensesByVocabularyId(
    vocabularyId: number
) {
    return supabase
        .from("vocabulary_senses")
        .select(VOCABULARY_SENSE_COLUMNS)
        .eq("vocabulary_id", vocabularyId)
        .order("sense_index", { ascending: true })
        .limit(VOCABULARY_CHILD_LIMIT)
}

export async function findVocabularyWritingsByVocabularyId(
    vocabularyId: number
) {
    return supabase
        .from("vocabulary_writings")
        .select(VOCABULARY_WRITING_COLUMNS)
        .eq("vocabulary_id", vocabularyId)
        .order("priority", { ascending: true })
        .limit(VOCABULARY_CHILD_LIMIT)
}

export async function findVocabularyReadingsByVocabularyId(
    vocabularyId: number
) {
    return supabase
        .from("vocabulary_readings")
        .select(VOCABULARY_READING_COLUMNS)
        .eq("vocabulary_id", vocabularyId)
        .order("priority", { ascending: true })
        .limit(VOCABULARY_CHILD_LIMIT)
}

export function findKanjisByCharacters(kanjis: string[]) {
    return supabase
        .from("kanjis")
        .select(VOCABULARY_KANJI_COLUMNS)
        .in("kanji", kanjis)
}