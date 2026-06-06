import type { Vocabulary } from "@/domain/vocabulary/vocabulary.type"

export function getVocabularyMeaning(vocabulary: Vocabulary) {
    const firstSense = vocabulary.senses[0]

    return (
        firstSense?.meaning_vi ||
        firstSense?.meaning_en ||
        ""
    )
}