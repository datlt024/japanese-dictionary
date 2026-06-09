import type { Vocabulary } from "@/domain/vocabulary/vocabulary.type"

export type VocabularySense = Vocabulary["senses"][number]

export function hasPartOfSpeech(
    sense: VocabularySense,
    partOfSpeech: string
) {
    return sense.part_of_speech?.some((item) => item === partOfSpeech)
}