import { supabaseServer } from "@/server/supabase/server"

const VOCABULARY_RELATION_COLUMNS =
    `
    id,
    vocabulary_id,
    related_vocabulary_id,
    relation_type,
    note_vi,
    source,
    status,
    confidence,
    related_vocabulary:vocabularies!vocabulary_relations_related_vocabulary_id_fkey (
        id,
        primary_word,
        primary_kana,
        jlpt,
        is_common
    )
    `

export function findVocabularyRelationsByVocabularyId(
    vocabularyId: number
) {
    return supabaseServer
        .from("vocabulary_relations")
        .select(VOCABULARY_RELATION_COLUMNS)
        .eq("vocabulary_id", vocabularyId)
        .order("confidence", { ascending: false })
        .order("id", { ascending: true })
        .limit(50)
}