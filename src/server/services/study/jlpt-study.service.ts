import { unstable_cache } from "next/cache"

import { supabaseServer } from "@/server/supabase/server"

import type { JlptStudyItem, JlptLevel } from "@/domain/study"
import { JLPT_LEVELS } from "@/domain/study"

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
    ["jlpt-vocab-count"],
    { revalidate: 86400 }
)

export async function getJlptStudyBatch(level: JlptLevel, limit = 20): Promise<JlptStudyItem[]> {
    // Query a fresh count (not cached) to avoid stale offset miscalculation
    const { count: freshCount } = await supabaseServer
        .from("vocabularies")
        .select("id", { count: "exact", head: true })
        .eq("jlpt", level)

    const total = freshCount ?? 0
    if (!total) return []

    const maxOffset = Math.max(0, total - limit)
    const offset = Math.floor(Math.random() * (maxOffset + 1))

    const { data } = await supabaseServer
        .from("vocabularies")
        .select("id, primary_word, primary_kana, vocabulary_senses(meaning_vi, sense_index)")
        .eq("jlpt", level)
        .range(offset, offset + limit - 1)
        .order("id")

    // Fallback to offset 0 if random offset returned nothing (edge case)
    const rows = (data && data.length > 0) ? data : await supabaseServer
        .from("vocabularies")
        .select("id, primary_word, primary_kana, vocabulary_senses(meaning_vi, sense_index)")
        .eq("jlpt", level)
        .range(0, limit - 1)
        .order("id")
        .then((r) => r.data ?? [])

    return rows.map((v) => {
        const senses = (v.vocabulary_senses as { meaning_vi: string | null; sense_index: number }[]) ?? []
        const meaning = senses
            .sort((a, b) => a.sense_index - b.sense_index)
            .find((s) => s.meaning_vi)?.meaning_vi ?? null

        const kana = v.primary_kana && v.primary_kana !== v.primary_word ? v.primary_kana : null

        return { id: v.id, word: v.primary_word, kana, meaning }
    })
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

export const getJlptKanjiCount = unstable_cache(
    async (level: JlptLevel): Promise<number> => {
        // kanjis.jlpt is integer: N5→5, N4→4, N3→3, N2→2, N1→1
        const jlptNum = parseInt(level.replace(/^N/i, ""), 10)
        const { count } = await supabaseServer
            .from("kanjis")
            .select("id", { count: "exact", head: true })
            .eq("jlpt", jlptNum)
        return count ?? 0
    },
    ["jlpt-kanji-count-v2"],
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
    ["jlpt-all-study-counts-v2"],
    { revalidate: 86400 }
)
