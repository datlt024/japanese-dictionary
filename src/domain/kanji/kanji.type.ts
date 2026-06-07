export type Kanji = {
    id: number
    kanji: string

    meaning_en: string | null
    meaning_vi: string | null

    onyomi: string | null
    kunyomi: string | null

    stroke_count: number | null
    jlpt: number | null
    grade: number | null
    frequency: number | null

    radical_id?: number | null
    unicode?: string | null

    created_at?: string | null
    updated_at?: string | null
}