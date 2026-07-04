import { Tables } from "@/shared/types/database.generated"

import { VocabularyCollocation } from "./vocabulary-collocation.type"
import { VocabularyRelation } from "./vocabulary-relation.type"

export type MeaningGloss = {
    index: number
    meaning: string
    examples: string[]
}

export type VocabularyRubyItem = {
    text: string
    reading: string | null
}

export type VocabularySense =
    Omit<
        Pick<
            Tables<"vocabulary_senses">,
            | "id"
            | "sense_index"
            | "meaning_en"
            | "meaning_vi"
            | "part_of_speech"
        >,
        never
    > & {
        meaning_vi_glosses: MeaningGloss[] | null
    }

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
    | "pitch"
>

export type Vocabulary = {
    id: number
    jmdict_id: string | null
    word: string
    kana: string | null
    ruby: VocabularyRubyItem[]
    jlpt: string | null
    verb_group: string | null
    is_common: boolean | null
    senses: VocabularySense[]
    writings: VocabularyWriting[]
    readings: VocabularyReading[]
    collocations: VocabularyCollocation[]
    relations: VocabularyRelation[]
}