export type VocabularyRelationType =
    | "synonym"
    | "antonym"
    | "related"

export type RelatedVocabularySummary = {
    id: number
    primary_word: string | null
    primary_kana: string | null
    jlpt: string | null
    is_common: boolean | null
}

export type VocabularyRelation = {
    id: number
    vocabulary_id: number
    related_vocabulary_id: number

    relation_type: VocabularyRelationType

    note_vi: string | null
    source: string | null
    status: string | null
    confidence: number | null

    related_vocabulary:
    | RelatedVocabularySummary
    | null
}