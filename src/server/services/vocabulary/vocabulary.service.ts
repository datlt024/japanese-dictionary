import type {
    Vocabulary,
    VocabularySense,
} from "@/domain/vocabulary/vocabulary.type"

import {
    findKanjisByCharacters,
    findVocabularyBaseById,
    findVocabularyReadingsByVocabularyId,
    findVocabularySensesByVocabularyId,
    findVocabularyWritingsByVocabularyId,
} from "@/server/repositories/vocabulary/vocabulary.repository"

export type VocabularyKanjiDetail = {
    id: number
    kanji: string
    meaning_vi: string | null
    meaning_en: string | null
    onyomi: string | null
    kunyomi: string | null
    stroke_count: number | null
    jlpt: number | null
    grade: number | null
    frequency: number | null
}

function extractUniqueKanjis(text: string) {
    return Array.from(
        new Set(
            Array.from(text).filter((char) =>
                /[\u4e00-\u9faf]/.test(char)
            )
        )
    )
}

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

export async function getVocabularyKanjis(
    word: string
): Promise<VocabularyKanjiDetail[]> {
    const kanjis = extractUniqueKanjis(word)

    if (kanjis.length === 0) {
        return []
    }

    const { data, error } = await findKanjisByCharacters(kanjis)

    if (error) {
        console.error("Get vocabulary kanjis error:", error)
        return []
    }

    const rows = (data || []) as VocabularyKanjiDetail[]

    return kanjis
        .map((kanji) =>
            rows.find((item) => item.kanji === kanji)
        )
        .filter(Boolean) as VocabularyKanjiDetail[]
}