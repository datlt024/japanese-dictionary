import type { GrammarPoint } from "@/domain/grammar"
import type { GrammarSearchItem } from "@/domain/search"

import { findGrammarPointById } from "@/server/repositories/grammar/grammar.repository"
import { searchGrammarsByKeyword } from "@/server/repositories/grammar/search-grammar.repository"

export async function searchGrammarPoints(
    keyword: string
): Promise<GrammarSearchItem[]> {
    const value = keyword.trim()

    if (!value) {
        return []
    }

    const { data, error } = await searchGrammarsByKeyword(value)

    if (error) {
        console.error("Supabase grammar search error:", error)
        return []
    }

    return (data ?? []) as GrammarSearchItem[]
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