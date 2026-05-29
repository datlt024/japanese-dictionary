export type Kanji = {
    id: number
    kanji: string
    meaning: string
    onyomi: string
    kunyomi: string
    stroke_count: number | null
    jlpt: number | null
    grade: number | null
    frequency: number | null
}