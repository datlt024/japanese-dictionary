import type { GrammarPoint } from "../types"

import {
    findGrammarPointById,
    searchGrammarPointsByKeyword,
} from "../repositories/grammar.repository"

export async function searchGrammarPoints(
    keyword: string
): Promise<GrammarPoint[]> {
    const value = keyword.trim()

    if (!value) {
        return []
    }

    const { data, error } =
        await searchGrammarPointsByKeyword(value)

    if (error) {
        console.error("Supabase grammar search error:", error)
        return []
    }

    return (data ?? []) as GrammarPoint[]
}

export async function getGrammarPointById(
    id: string
): Promise<GrammarPoint | null> {
    const grammarId = Number(id)

    if (Number.isNaN(grammarId)) {
        return null
    }

    const { data, error } =
        await findGrammarPointById(grammarId)

    if (error) {
        console.error("Supabase grammar detail error:", error)
        return null
    }

    return data as GrammarPoint | null
}