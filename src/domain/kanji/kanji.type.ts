export type Kanji = {
    id: number
    kanji: string

    meaning_en: string | null
    meaning_vi: string | null

    onyomi: string | null
    kunyomi: string | null
    han_viet: string | null

    radical: string | null
    radical_number: number | null
    radical_name_vi: string | null
    radical_name_ja: string | null

    stroke_count: number | null
    memory_tip: string | null
    jlpt: number | null
    grade: number | null
    frequency: number | null

    unicode?: string | null

    created_at?: string | null
    updated_at?: string | null
}