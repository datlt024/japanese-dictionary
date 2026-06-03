import { supabase } from "@/shared/lib/supabase"

export async function findKanjiByCharacter(
    character: string
) {
    return supabase
        .from("kanjis")
        .select("*")
        .eq("kanji", character)
        .maybeSingle()
}

export async function findKanjiLinks(
    kanjiId: number,
    limit = 20
) {
    return supabase
        .from("kanji_vocabulary_links")
        .select("vocabulary_id, priority")
        .eq("kanji_id", kanjiId)
        .order("priority", {
            ascending: false,
        })
        .limit(limit)
}

export async function findVocabulariesByIds(
    vocabularyIds: number[]
) {
    return supabase
        .from("vocabularies")
        .select("id, primary_word, primary_kana")
        .in("id", vocabularyIds)
}

export async function findVocabularySenses(
    vocabularyIds: number[]
) {
    return supabase
        .from("vocabulary_senses")
        .select("vocabulary_id, meaning_en, meaning_vi")
        .in("vocabulary_id", vocabularyIds)
        .order("sense_index", {
            ascending: true,
        })
}

export async function findReadingWords(
    character: string,
    reading: string
) {
    return supabase
        .from("vocabularies")
        .select("id, primary_word, primary_kana")
        .ilike("primary_word", `%${character}%`)
        .ilike("primary_kana", `%${reading}%`)
        .limit(5)
}