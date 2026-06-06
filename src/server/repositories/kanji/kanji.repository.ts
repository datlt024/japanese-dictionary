import { supabaseServer } from "@/server/supabase/server"

const KANJI_DETAIL_COLUMNS =
    "id, kanji, meaning_vi, meaning_en, onyomi, kunyomi, stroke_count, jlpt, grade, frequency"

const KANJI_LINK_COLUMNS =
    "vocabulary_id, priority"

const VOCABULARY_SUMMARY_COLUMNS =
    "id, primary_word, primary_kana"

const VOCABULARY_SENSE_COLUMNS =
    "vocabulary_id, meaning_en, meaning_vi"

const READING_WORD_LIMIT = 5

function escapeLikePattern(keyword: string) {
    return keyword.replace(/[%_]/g, "\\$&")
}

export async function findKanjiByCharacter(
    character: string
) {
    return supabaseServer
        .from("kanjis")
        .select(KANJI_DETAIL_COLUMNS)
        .eq("kanji", character)
        .maybeSingle()
}

export async function findKanjiLinks(
    kanjiId: number,
    limit = 20
) {
    return supabaseServer
        .from("kanji_vocabulary_links")
        .select(KANJI_LINK_COLUMNS)
        .eq("kanji_id", kanjiId)
        .order("priority", {
            ascending: false,
        })
        .limit(limit)
}

export async function findVocabulariesByIds(
    vocabularyIds: number[]
) {
    if (vocabularyIds.length === 0) {
        return Promise.resolve({
            data: [],
            error: null,
        })
    }

    return supabaseServer
        .from("vocabularies")
        .select(VOCABULARY_SUMMARY_COLUMNS)
        .in("id", vocabularyIds)
}

export async function findVocabularySenses(
    vocabularyIds: number[]
) {
    if (vocabularyIds.length === 0) {
        return Promise.resolve({
            data: [],
            error: null,
        })
    }

    return supabaseServer
        .from("vocabulary_senses")
        .select(VOCABULARY_SENSE_COLUMNS)
        .in("vocabulary_id", vocabularyIds)
        .order("sense_index", {
            ascending: true,
        })
}

export async function findReadingWords(
    character: string,
    reading: string
) {
    const escapedCharacter = escapeLikePattern(character)
    const escapedReading = escapeLikePattern(reading)

    return supabaseServer
        .from("vocabularies")
        .select(VOCABULARY_SUMMARY_COLUMNS)
        .ilike("primary_word", `%${escapedCharacter}%`)
        .ilike("primary_kana", `%${escapedReading}%`)
        .limit(READING_WORD_LIMIT)
}