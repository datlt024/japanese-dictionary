import { supabaseServer } from "@/server/supabase/server"

const VOCABULARY_COLLOCATION_COLUMNS =
    "id, vocabulary_id, expression_jp, reading, meaning_vi, meaning_en, source, confidence, collocation_type"

const VOCABULARY_COLLOCATION_LIMIT = 20

export function findVocabularyCollocationsByVocabularyId(
    vocabularyId: number
) {
    return supabaseServer
        .from("vocabulary_collocations")
        .select(VOCABULARY_COLLOCATION_COLUMNS)
        .eq("vocabulary_id", vocabularyId)
        .order("confidence", { ascending: false })
        .order("id", { ascending: true })
        .limit(VOCABULARY_COLLOCATION_LIMIT)
}