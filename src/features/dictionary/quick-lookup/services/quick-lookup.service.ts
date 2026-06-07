import type { DictionaryLanguage } from "@/shared/types/dictionaryLanguage"

export type QuickLookupTarget = {
    title: string
    url: string
}

type SearchApiResponse = {
    vocabularies?: {
        id: number
    }[]
}

export async function getQuickLookupTarget(
    text: string,
    language: DictionaryLanguage
): Promise<QuickLookupTarget> {
    const q = text.trim()

    const fallbackUrl =
        `/search?q=${encodeURIComponent(q)}` +
        `&tab=vocabulary&lang=${encodeURIComponent(language)}` +
        `&embedded=1`

    try {
        const response = await fetch(
            `/api/search?q=${encodeURIComponent(q)}` +
            `&tab=vocabulary` +
            `&lang=${encodeURIComponent(language)}`
        )

        if (!response.ok) {
            return {
                title: q,
                url: fallbackUrl,
            }
        }

        const data = (await response.json()) as SearchApiResponse
        const firstVocabulary = data.vocabularies?.[0]

        if (!firstVocabulary) {
            return {
                title: q,
                url: fallbackUrl,
            }
        }

        return {
            title: q,
            url:
                `/vocabulary/${firstVocabulary.id}` +
                `?lang=${encodeURIComponent(language)}` +
                `&embedded=1`,
        }
    } catch {
        return {
            title: q,
            url: fallbackUrl,
        }
    }
}