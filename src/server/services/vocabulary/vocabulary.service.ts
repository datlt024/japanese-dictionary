import type {
    Vocabulary,
    VocabularyCollocation,
    VocabularyRelation,
    VocabularyRubyItem,
    VocabularySense,
} from "@/domain/vocabulary"

import {
    findKanjisByCharacters,
    findVocabularyBaseById,
    findVocabularyReadingsByVocabularyId,
    findVocabularySensesByVocabularyId,
    findVocabularyWritingsByVocabularyId,
} from "@/server/repositories/vocabulary/vocabulary.repository"

import {
    findVocabularyCollocationsByVocabularyId,
} from "@/server/repositories/vocabulary/vocabulary-collocation.repository"

import {
    findVocabularyRelationsByVocabularyId,
} from "@/server/repositories/vocabulary/vocabulary-relation.repository"

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

function isVocabularyRubyItem(
    value: unknown
): value is VocabularyRubyItem {
    if (
        typeof value !== "object" ||
        value === null ||
        !("text" in value) ||
        !("reading" in value)
    ) {
        return false
    }

    const item = value as {
        text: unknown
        reading: unknown
    }

    return (
        typeof item.text === "string" &&
        (typeof item.reading === "string" ||
            item.reading === null)
    )
}

function normalizeVocabularyRuby(
    value: unknown
): VocabularyRubyItem[] {
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value)

            if (Array.isArray(parsed)) {
                return parsed.filter(isVocabularyRubyItem)
            }
        } catch {
            return []
        }

        return []
    }

    if (!Array.isArray(value)) {
        return []
    }

    return value.filter(isVocabularyRubyItem)
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

    // All 6 queries use only `id` — run fully in parallel, zero sequential steps
    const [
        baseResult,
        sensesResult,
        writingsResult,
        readingsResult,
        collocationsResult,
        relationsResult,
    ] = await Promise.all([
        findVocabularyBaseById(id),
        findVocabularySensesByVocabularyId(id),
        findVocabularyWritingsByVocabularyId(id),
        findVocabularyReadingsByVocabularyId(id),
        findVocabularyCollocationsByVocabularyId(id),
        findVocabularyRelationsByVocabularyId(id),
    ])

    if (baseResult.error) {
        console.error("Get vocabulary error:", baseResult.error)
        return null
    }

    const vocabulary = baseResult.data
    if (!vocabulary) return null

    if (sensesResult.error) {
        console.error("Get vocabulary senses error:", sensesResult.error)
        return null
    }

    if (writingsResult.error) {
        console.error("Get vocabulary writings error:", writingsResult.error)
        return null
    }

    if (readingsResult.error) {
        console.error("Get vocabulary readings error:", readingsResult.error)
        return null
    }

    if (collocationsResult.error) {
        console.error("Get vocabulary collocations error:", collocationsResult.error)
    }

    if (relationsResult.error) {
        console.error("Get vocabulary relations error:", relationsResult.error)
    }

    return {
        id: vocabulary.id,
        jmdict_id: vocabulary.jmdict_id,
        word: vocabulary.primary_word,
        kana: vocabulary.primary_kana,
        ruby: normalizeVocabularyRuby(vocabulary.ruby),
        jlpt: vocabulary.jlpt,
        verb_group: vocabulary.verb_group,
        is_common: vocabulary.is_common,
        senses: (sensesResult.data as VocabularySense[]) || [],
        writings: writingsResult.data || [],
        readings: readingsResult.data || [],
        collocations: collocationsResult.error
            ? []
            : (collocationsResult.data as VocabularyCollocation[]) || [],
        relations: relationsResult.error
            ? []
            : (relationsResult.data as VocabularyRelation[]) || [],
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