import type { SearchTab } from "@/shared/constants/search-tabs"
import type { DictionaryLanguage } from "@/shared/types/dictionaryLanguage"

export type SearchApiResponse = {
    vocabularies?: {
        id: number
    }[]
    grammars?: {
        id: number
    }[]
}

export async function fetchSearchResult(
    q: string,
    tab: SearchTab,
    language: DictionaryLanguage
): Promise<SearchApiResponse> {
    try {
        const response = await fetch(
            `/api/search?q=${encodeURIComponent(
                q
            )}&tab=${encodeURIComponent(
                tab
            )}&lang=${encodeURIComponent(language)}`
        )

        if (!response.ok) {
            return {}
        }

        return response.json() as Promise<SearchApiResponse>
    } catch {
        return {}
    }
}