import { Tables } from "@/shared/types/database.generated"

export type VocabularySense = Pick<
    Tables<"vocabulary_senses">,
    | "id"
    | "sense_index"
    | "meaning_en"
    | "meaning_vi"
    | "meaning_vi_glosses"
    | "part_of_speech"
>

export type VocabularyWriting = Pick<
    Tables<"vocabulary_writings">,
    | "id"
    | "writing"
    | "is_primary"
    | "priority"
    | "info"
>

export type VocabularyReading = Pick<
    Tables<"vocabulary_readings">,
    | "id"
    | "reading"
    | "romaji"
    | "is_primary"
    | "priority"
    | "info"
>

export type Vocabulary = {
    id: number
    jmdict_id: string | null
    word: string
    kana: string | null
    jlpt: string | null
    verb_group: string | null
    is_common: boolean | null
    senses: VocabularySense[]
    writings: VocabularyWriting[]
    readings: VocabularyReading[]
}