import { supabaseServer } from "@/server/supabase/server"

const VOCABULARY_BASE_COLUMNS = `
id,
jmdict_id,
primary_word,
primary_kana,
ruby,
jlpt,
verb_group,
is_common
` as const

const VOCABULARY_SENSE_COLUMNS = `
id,
sense_index,
meaning_en,
meaning_vi,
meaning_vi_glosses,
part_of_speech
` as const

const VOCABULARY_WRITING_COLUMNS = `
id,
writing,
is_primary,
priority,
info
` as const

const VOCABULARY_READING_COLUMNS = `
id,
reading,
romaji,
is_primary,
priority,
info,
pitch
` as const

const VOCABULARY_KANJI_COLUMNS = `
id,
kanji,
meaning_vi,
meaning_en,
onyomi,
kunyomi,
stroke_count,
jlpt,
grade,
frequency
` as const

const VOCABULARY_CHILD_LIMIT = 100

export async function findVocabularyBaseById(id: number) {
    return supabaseServer
        .from("vocabularies")
        .select(VOCABULARY_BASE_COLUMNS)
        .eq("id", id)
        .maybeSingle()
}

export async function findVocabularySensesByVocabularyId(
    vocabularyId: number
) {
    return supabaseServer
        .from("vocabulary_senses")
        .select(VOCABULARY_SENSE_COLUMNS)
        .eq("vocabulary_id", vocabularyId)
        .order("sense_index", { ascending: true })
        .limit(VOCABULARY_CHILD_LIMIT)
}

export async function findVocabularyWritingsByVocabularyId(
    vocabularyId: number
) {
    return supabaseServer
        .from("vocabulary_writings")
        .select(VOCABULARY_WRITING_COLUMNS)
        .eq("vocabulary_id", vocabularyId)
        .order("priority", { ascending: true })
        .limit(VOCABULARY_CHILD_LIMIT)
}

export async function findVocabularyReadingsByVocabularyId(
    vocabularyId: number
) {
    return supabaseServer
        .from("vocabulary_readings")
        .select(VOCABULARY_READING_COLUMNS)
        .eq("vocabulary_id", vocabularyId)
        .order("priority", { ascending: true })
        .limit(VOCABULARY_CHILD_LIMIT)
}

export function findKanjisByCharacters(kanjis: string[]) {
    return supabaseServer
        .from("kanjis")
        .select(VOCABULARY_KANJI_COLUMNS)
        .in("kanji", kanjis)
}

export function findVocabularyIdsByPrimaryWords(words: string[]) {
    return supabaseServer
        .from("vocabularies")
        .select("id, primary_word, primary_kana, jlpt")
        .in("primary_word", words)
        .limit(words.length * 3)
}

const VOCABULARY_EXAMPLE_COLUMNS = `
id,
vocabulary_id,
sense_index,
japanese,
translation_vi,
example_order,
ruby
` as const

export async function findVocabularyExamplesByVocabularyId(
    vocabularyId: number
) {
    return supabaseServer
        .from("vocabulary_examples")
        .select(VOCABULARY_EXAMPLE_COLUMNS)
        .eq("vocabulary_id", vocabularyId)
        .order("example_order", { ascending: true })
        .limit(50)
}