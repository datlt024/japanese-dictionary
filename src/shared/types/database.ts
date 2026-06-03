import { Tables } from "@/shared/types/database.generated"

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

export type GrammarSearchRow = Pick<
    Tables<"grammars">,
    | "id"
    | "pattern"
    | "reading"
    | "jlpt_level"
    | "meaning_vi"
    | "meaning_en"
    | "short_meaning_vi"
>

export type KanjiRow = Pick<
    Tables<"kanjis">,
    | "id"
    | "kanji"
    | "meaning_vi"
    | "meaning_en"
    | "onyomi"
    | "kunyomi"
    | "stroke_count"
    | "jlpt"
    | "grade"
    | "frequency"
>