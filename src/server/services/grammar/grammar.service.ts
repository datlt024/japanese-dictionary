import { cache } from "react"

import type { GrammarPoint } from "@/domain/grammar"
import type { GrammarSearchItem } from "@/domain/search"

import { findGrammarPointById } from "@/server/repositories/grammar/grammar.repository"
import { searchGrammarsByKeyword } from "@/server/repositories/grammar/search-grammar.repository"
import { logger } from "@/server/utils/logger"

export async function searchGrammarPoints(
    keyword: string
): Promise<GrammarSearchItem[]> {
    const value = keyword.trim()

    if (!value) {
        return []
    }

    const { data, error } = await searchGrammarsByKeyword(value)

    if (error) {
        logger.error("grammar.service", "searchGrammarPoints failed", { error })
        return []
    }

    return (data ?? []) as GrammarSearchItem[]
}

export const getGrammarPointById = cache(async (
    id: string
): Promise<GrammarPoint | null> => {
    const grammarId = Number(id)

    if (Number.isNaN(grammarId)) {
        return null
    }

    const { data, error } =
        await findGrammarPointById(grammarId)

    if (error) {
        logger.error("grammar.service", "getGrammarPointById failed", { error })
        return null
    }

    return data as GrammarPoint | null
})
