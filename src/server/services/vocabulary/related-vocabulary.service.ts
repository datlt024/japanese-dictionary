import "server-only"
import { findRelatedVocabulariesByKeyword } from "@/server/repositories/vocabulary/related-vocabulary.repository"
import { logger } from "@/server/utils/logger"

import type {
    RelatedVocabulary,
} from "@/domain/vocabulary/related-vocabulary.type"

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
        logger.error("vocabulary.service", "related-vocabulary failed", { error })

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