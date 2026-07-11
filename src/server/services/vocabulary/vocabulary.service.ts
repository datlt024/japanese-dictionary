import type {
    Vocabulary,
    VocabularyCollocation,
    VocabularyExample,
    VocabularyRelation,
    VocabularyRubyItem,
    VocabularySense,
} from "@/domain/vocabulary"

import {
    findKanjisByCharacters,
    findVocabularyBaseById,
    findVocabularyExamplesByVocabularyId,
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

function toVocabularyRubyItem(value: unknown): VocabularyRubyItem | null {
    if (typeof value !== "object" || value === null) return null

    const item = value as Record<string, unknown>
    const text = typeof item.text === "string" ? item.text
        : typeof item.base === "string" ? item.base
        : null
    const reading = typeof item.reading === "string" ? item.reading : null

    if (!text) return null
    return { text, reading }
}

function normalizeVocabularyRuby(value: unknown): VocabularyRubyItem[] {
    const arr = typeof value === "string"
        ? (() => { try { return JSON.parse(value) } catch { return [] } })()
        : value

    if (!Array.isArray(arr)) return []

    return arr.flatMap((item) => {
        const parsed = toVocabularyRubyItem(item)
        return parsed ? [parsed] : []
    })
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

    const [
        baseResult,
        sensesResult,
        writingsResult,
        readingsResult,
        collocationsResult,
        relationsResult,
        examplesResult,
    ] = await Promise.all([
        findVocabularyBaseById(id),
        findVocabularySensesByVocabularyId(id),
        findVocabularyWritingsByVocabularyId(id),
        findVocabularyReadingsByVocabularyId(id),
        findVocabularyCollocationsByVocabularyId(id),
        findVocabularyRelationsByVocabularyId(id),
        findVocabularyExamplesByVocabularyId(id),
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

    const examples = (examplesResult.data ?? []).map(
        (ex): VocabularyExample => ({
            sense_index: ex.sense_index,
            jp: ex.japanese,
            vi: ex.translation_vi ?? "",
            ruby: normalizeVocabularyRuby(ex.ruby),
        })
    )

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
        examples,
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