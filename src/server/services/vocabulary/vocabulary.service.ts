import "server-only"
import { cache } from "react"
import { unstable_cache } from "next/cache"

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
    findVocabularyIdsByPrimaryWords,
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

import type { VocabularyKanjiDetail } from "@/domain/vocabulary"
export type { VocabularyKanjiDetail }

import { logger } from "@/server/utils/logger"

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

export const getVocabularyById = cache(async (
    id: number
): Promise<Vocabulary | null> => {
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
        logger.error("vocabulary.service", "getVocabularyById base failed", { error: baseResult.error })
        return null
    }

    const vocabulary = baseResult.data
    if (!vocabulary) return null

    if (sensesResult.error) {
        logger.error("vocabulary.service", "getVocabularyById senses failed", { error: sensesResult.error })
        return null
    }

    if (writingsResult.error) {
        logger.error("vocabulary.service", "getVocabularyById writings failed", { error: writingsResult.error })
        return null
    }

    if (readingsResult.error) {
        logger.error("vocabulary.service", "getVocabularyById readings failed", { error: readingsResult.error })
        return null
    }

    if (collocationsResult.error) {
        logger.error("vocabulary.service", "getVocabularyById collocations failed", { error: collocationsResult.error })
    }

    if (relationsResult.error) {
        logger.error("vocabulary.service", "getVocabularyById relations failed", { error: relationsResult.error })
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
})

export async function getVocabularyKanjis(
    word: string
): Promise<VocabularyKanjiDetail[]> {
    const kanjis = extractUniqueKanjis(word)

    if (kanjis.length === 0) {
        return []
    }

    const { data, error } = await findKanjisByCharacters(kanjis)

    if (error) {
        logger.error("vocabulary.service", "getVocabularyKanjis failed", { error })
        return []
    }

    const rows = (data || []) as VocabularyKanjiDetail[]

    return kanjis
        .map((kanji) =>
            rows.find((item) => item.kanji === kanji)
        )
        .filter(Boolean) as VocabularyKanjiDetail[]
}

export const getDailyVocabularyIds = unstable_cache(
    async (words: string[]) => {
        const { data } = await findVocabularyIdsByPrimaryWords(words)
        return data
    },
    ["daily-vocabulary-ids-v3"],
    { revalidate: 86400 }
)