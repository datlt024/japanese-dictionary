import { findRelatedVocabulariesByKeyword } from "@/server/repositories/vocabulary/related-vocabulary.repository"

import type {
    RelatedVocabulary,
} from "../types/related-vocabulary.type"

export async function getRelatedVocabulariesFromDatabase(
    keyword: string
): Promise<{
    results: RelatedVocabulary[]
    error: string | null
}> {
    const normalizedKeyword = keyword.trim()

    if (!normalizedKeyword) {
        return {
            results: [],
            error: null,
        }
    }

    const { data, error } =
        await findRelatedVocabulariesByKeyword(
            normalizedKeyword
        )

    if (error) {
        console.error(
            "Get related vocabularies error:",
            error
        )

        return {
            results: [],
            error: error.message,
        }
    }

    return {
        results: (data || []) as RelatedVocabulary[],
        error: null,
    }
}