import type { Vocabulary } from "../types/vocabulary.type"

export function getVocabularyPartOfSpeech(
    vocabulary: Vocabulary
) {
    const partOfSpeechList = vocabulary.senses
        .flatMap((sense) => sense.part_of_speech || [])
        .filter(Boolean)

    return Array.from(new Set(partOfSpeechList)).join(", ")
}