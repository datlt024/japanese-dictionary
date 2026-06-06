export type VocabularySearchItem = {
    id: number
    word: string
    kana: string | null
    meaning_vi: string | null
    meaning_en: string | null
    part_of_speech: string | null
    jlpt: string | null
    is_common: boolean | null
}

export type Vocabulary = VocabularySearchItem