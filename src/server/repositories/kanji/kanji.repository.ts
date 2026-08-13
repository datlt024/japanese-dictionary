import { supabaseServer } from "@/server/supabase/server"

const KANJI_DETAIL_COLUMNS = `
id,
kanji,
meaning_vi,
meaning_en,
onyomi,
kunyomi,
han_viet,
radical,
radical_number,
radical_name_vi,
radical_name_ja,
stroke_count,
memory_tip,
jlpt,
grade,
frequency,
unicode,
created_at,
updated_at
` as const

const KANJI_LINK_COLUMNS = `
vocabulary_id,
priority
` as const

const VOCABULARY_SUMMARY_COLUMNS = `
id,
primary_word,
primary_kana
` as const

const VOCABULARY_SENSE_COLUMNS = `
vocabulary_id,
meaning_en,
meaning_vi,
is_hidden
` as const

export async function findKanjiByCharacter(character: string) {
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
        .eq("is_hidden", false)
        .order("sense_index", {
            ascending: true,
        })
}

export async function findReadingExamples(
    kanji: string,
    reading: string,
    readingType: "onyomi" | "kunyomi"
) {
    return supabaseServer.rpc("get_kanji_reading_examples_rpc", {
        search_kanji: kanji,
        search_reading: reading,
        search_reading_type: readingType,
    })
}