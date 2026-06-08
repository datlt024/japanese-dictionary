export type VocabularyCollocationType =
    | "fixed_expression"
    | "special_particle"
    | "idiom"
    | "set_phrase"

export type VocabularyCollocation = {
    id: number
    vocabulary_id: number
    expression_jp: string
    reading: string | null
    meaning_en: string | null
    meaning_vi: string | null
    source: string | null
    confidence: number | null
    collocation_type: VocabularyCollocationType | null
}