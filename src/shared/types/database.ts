export type VocabularyResult = {
    id: number
    word: string
    kana: string[]
    meaning: string
    jlpt: string | null
    verb_group: string | null
    is_common: boolean | null
    priority_score: number | null
}

export type GrammarSearchRow = {
    id: number
    pattern: string
    reading: string | null
    jlpt_level: string | null
    meaning_vi: string | null
    meaning_en: string | null
    short_meaning_vi: string | null
}

export type KanjiRow = {
    id: number
    kanji: string
    meaning: string | null
    onyomi: string | null
    kunyomi: string | null
    stroke_count: number | null
    jlpt: number | null
    grade: number | null
    frequency: number | null
}