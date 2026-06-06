import type {
    RelatedVocabulary,
} from "@/domain/vocabulary/related-vocabulary.type"

type RelatedVocabularyResponse = {
    results?: RelatedVocabulary[]
    error?: string
}

export async function getRelatedVocabularies(
    keyword: string
): Promise<RelatedVocabulary[]> {
    const normalizedKeyword = keyword.trim()

    if (!normalizedKeyword) {
        return []
    }

    try {
        const response = await fetch(
            `/api/vocabulary/related?q=${encodeURIComponent(
                normalizedKeyword
            )}`
        )

        if (!response.ok) {
            console.error(
                "Fetch related vocabularies failed:",
                response.status
            )

            return []
        }

        const result =
            (await response.json()) as RelatedVocabularyResponse

        return result.results || []
    } catch (error) {
        console.error(
            "Fetch related vocabularies error:",
            error
        )

        return []
    }
}