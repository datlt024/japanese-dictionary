import { supabaseServer } from "@/server/supabase/server"

import type { JlptStudyItem, JlptLevel } from "@/domain/study"
import { JLPT_LEVELS } from "@/domain/study"

export type { JlptStudyItem, JlptLevel }
export { JLPT_LEVELS }

export function isValidJlptLevel(value: string): value is JlptLevel {
    return JLPT_LEVELS.includes(value as JlptLevel)
}

export async function getJlptVocabCount(level: JlptLevel): Promise<number> {
    const { count } = await supabaseServer
        .from("vocabularies")
        .select("id", { count: "exact", head: true })
        .eq("jlpt", level)
    return count ?? 0
}

export async function getJlptStudyBatch(level: JlptLevel, limit = 20): Promise<JlptStudyItem[]> {
    const count = await getJlptVocabCount(level)
    if (!count) return []

    const maxOffset = Math.max(0, count - limit)
    const offset = Math.floor(Math.random() * (maxOffset + 1))

    const { data } = await supabaseServer
        .from("vocabularies")
        .select("id, primary_word, primary_kana, vocabulary_senses(meaning_vi, sense_index)")
        .eq("jlpt", level)
        .range(offset, offset + limit - 1)
        .order("id")

    if (!data) return []

    return data.map((v) => {
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

export async function getAllJlptCounts(): Promise<Record<JlptLevel, number>> {
    const results = await Promise.all(
        JLPT_LEVELS.map(async (level) => [level, await getJlptVocabCount(level)] as const)
    )
    return Object.fromEntries(results) as Record<JlptLevel, number>
}
