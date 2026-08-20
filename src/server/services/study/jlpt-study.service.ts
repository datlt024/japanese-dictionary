import "server-only"
import { unstable_cache } from "next/cache"

import { supabaseServer } from "@/server/supabase/server"
import { logger } from "@/server/utils/logger"
import { getGrammarsByJlptLevel } from "@/server/repositories/grammar/search-grammar.repository"
import { getKanjisByJlptLevelPaginated } from "@/server/repositories/kanji/search-kanji.repository"

import type { JlptStudyItem, JlptLevel } from "@/domain/study"
import { JLPT_LEVELS } from "@/domain/study"
import type { GrammarSearchItem, KanjiSearchItem } from "@/domain/search"

export type { JlptStudyItem, JlptLevel }
export { JLPT_LEVELS }

export function isValidJlptLevel(value: string): value is JlptLevel {
    return JLPT_LEVELS.includes(value as JlptLevel)
}

export const getJlptVocabCount = unstable_cache(
    async (level: JlptLevel): Promise<number> => {
        const { count } = await supabaseServer
            .from("vocabularies")
            .select("id", { count: "exact", head: true })
            .eq("jlpt", level)
        return count ?? 0
    },
    ["jlpt-vocab-count-v2"],
    { revalidate: 86400 }
)

export const getJlptVocabItems = unstable_cache(
    async (level: JlptLevel, from: number, to: number) => {
        const { data, error } = await supabaseServer.rpc(
            "get_jlpt_vocab_page",
            { p_level: level, p_from: from, p_to: to }
        )

        if (error) {
            logger.error("jlpt-study.service", "getJlptVocabItems failed", { message: error.message, code: error.code })
            return []
        }

        return (data ?? []).map((v) => ({
            id: v.id,
            word: v.primary_word,
            kana: v.primary_kana && v.primary_kana !== v.primary_word ? v.primary_kana : null,
            meaning: v.meaning_vi ?? null,
        }))
    },
    ["jlpt-vocab-items-v1"],
    { revalidate: 86400 }
)

export async function getJlptStudyBatch(level: JlptLevel, limit = 50): Promise<JlptStudyItem[]> {
    // Both getJlptVocabCount and getJlptVocabItems are wrapped in unstable_cache,
    // so this function is fast after the first request for any given chunk.
    const total = await getJlptVocabCount(level)
    if (!total) return []

    // Pick a random chunk from the cached pages so users see variety over time.
    const numChunks = Math.max(1, Math.ceil(total / limit))
    const chunkIndex = Math.floor(Math.random() * numChunks)
    const from = chunkIndex * limit

    const items = await getJlptVocabItems(level, from, from + limit - 1)
    return shuffleItems(items)
}

export function shuffleItems<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

export const getAllJlptCounts = unstable_cache(
    async (): Promise<Record<JlptLevel, number>> => {
        const results = await Promise.all(
            JLPT_LEVELS.map(async (level) => [level, await getJlptVocabCount(level)] as const)
        )
        return Object.fromEntries(results) as Record<JlptLevel, number>
    },
    ["jlpt-all-counts"],
    { revalidate: 86400 }
)

export const getJlptGrammarCount = unstable_cache(
    async (level: JlptLevel): Promise<number> => {
        const { count } = await supabaseServer
            .from("grammars")
            .select("id", { count: "exact", head: true })
            .eq("jlpt_level", level)
        return count ?? 0
    },
    ["jlpt-grammar-count"],
    { revalidate: 86400 }
)

// KANJIDIC2 uses old 4-level JLPT (1=hardest, 4=easiest). Map new levels to old:
// N5→4, N4→3, N3→2, N2→1, N1→1 (N1 and N2 share old level 1)
const JLPT_KANJIDIC_LEVEL: Record<string, number> = {
    N1: 1, N2: 1, N3: 2, N4: 3, N5: 4,
}

export const getJlptKanjiCount = unstable_cache(
    async (level: JlptLevel): Promise<number> => {
        const jlptNum = JLPT_KANJIDIC_LEVEL[level] ?? parseInt(level.replace(/^N/i, ""), 10)
        const { count } = await supabaseServer
            .from("kanjis")
            .select("id", { count: "exact", head: true })
            .eq("jlpt", jlptNum)
        return count ?? 0
    },
    ["jlpt-kanji-count-v3"],
    { revalidate: 86400 }
)

export const getAllStudyCounts = unstable_cache(
    async (): Promise<{
        vocab: Record<JlptLevel, number>
        grammar: Record<JlptLevel, number>
        kanji: Record<JlptLevel, number>
    }> => {
        const [vocabRows, grammarRows, kanjiRows] = await Promise.all([
            Promise.all(JLPT_LEVELS.map(async (l) => [l, await getJlptVocabCount(l)] as const)),
            Promise.all(JLPT_LEVELS.map(async (l) => [l, await getJlptGrammarCount(l)] as const)),
            Promise.all(JLPT_LEVELS.map(async (l) => [l, await getJlptKanjiCount(l)] as const)),
        ])
        return {
            vocab:   Object.fromEntries(vocabRows)   as Record<JlptLevel, number>,
            grammar: Object.fromEntries(grammarRows) as Record<JlptLevel, number>,
            kanji:   Object.fromEntries(kanjiRows)   as Record<JlptLevel, number>,
        }
    },
    ["jlpt-all-study-counts-v4"],
    { revalidate: 86400 }
)

export const getJlptGrammarItems = unstable_cache(
    async (level: string, from: number, to: number) => {
        const { data, error } = await getGrammarsByJlptLevel(level, from, to)
        if (error) {
            logger.error("jlpt-study.service", "getJlptGrammarItems failed", { message: String((error as { message?: unknown }).message) })
            return []
        }
        return (data ?? []) as GrammarSearchItem[]
    },
    ["study-grammar-items-v1"],
    { revalidate: 86400 }
)

export const getJlptKanjiItems = unstable_cache(
    async (level: string, from: number, to: number) => {
        const { data, error } = await getKanjisByJlptLevelPaginated(level, from, to)
        if (error) {
            logger.error("jlpt-study.service", "getJlptKanjiItems failed", { message: String((error as { message?: unknown }).message) })
            return []
        }
        return (data ?? []) as KanjiSearchItem[]
    },
    ["study-kanji-items-v1"],
    { revalidate: 86400 }
)
