import type { Vocabulary, VocabularySense } from "../types/vocabulary.type"

import {
    findVocabularyBaseById,
    findVocabularyReadingsByVocabularyId,
    findVocabularySensesByVocabularyId,
    findVocabularyWritingsByVocabularyId,
} from "../repositories/vocabulary.repository"

export async function getVocabularyById(
    id: number
): Promise<Vocabulary | null> {
    if (!Number.isFinite(id)) {
        return null
    }

    const { data: vocabulary, error: vocabularyError } =
        await findVocabularyBaseById(id)

    if (vocabularyError) {
        console.error("Get vocabulary error:", vocabularyError)
        return null
    }

    if (!vocabulary) {
        return null
    }

    const [
        sensesResult,
        writingsResult,
        readingsResult,
    ] = await Promise.all([
        findVocabularySensesByVocabularyId(id),
        findVocabularyWritingsByVocabularyId(id),
        findVocabularyReadingsByVocabularyId(id),
    ])

    if (sensesResult.error) {
        console.error(
            "Get vocabulary senses error:",
            sensesResult.error
        )
        return null
    }

    if (writingsResult.error) {
        console.error(
            "Get vocabulary writings error:",
            writingsResult.error
        )
        return null
    }

    if (readingsResult.error) {
        console.error(
            "Get vocabulary readings error:",
            readingsResult.error
        )
        return null
    }

    return {
        id: vocabulary.id,
        jmdict_id: vocabulary.jmdict_id,
        word: vocabulary.primary_word,
        kana: vocabulary.primary_kana,
        jlpt: vocabulary.jlpt,
        verb_group: vocabulary.verb_group,
        is_common: vocabulary.is_common,
        senses:
            (sensesResult.data as VocabularySense[]) || [],
        writings: writingsResult.data || [],
        readings: readingsResult.data || [],
    }
}