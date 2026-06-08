import type { SearchTab } from "@/shared/constants/search-tabs"
import type { DictionaryLanguage } from "@/shared/types/dictionaryLanguage"

import { extractKanjis } from "@/shared/utils/japanese"

import { fetchSearchResult } from "./fetchSearchResult"

function createUrlWithLanguage(
    path: string,
    language: DictionaryLanguage
) {
    const separator = path.includes("?") ? "&" : "?"

    return `${path}${separator}lang=${encodeURIComponent(language)}`
}

export async function getSearchTargetUrl(
    tab: SearchTab,
    q: string,
    language: DictionaryLanguage
) {
    if (!q) {
        return null
    }

    if (tab === "kanji") {
        const kanjis = extractKanjis(q)

        if (kanjis.length > 0) {
            return createUrlWithLanguage(
                `/kanji/${encodeURIComponent(
                    kanjis[0]
                )}?q=${encodeURIComponent(q)}`,
                language
            )
        }

        return createUrlWithLanguage(
            `/search?q=${encodeURIComponent(q)}&tab=kanji`,
            language
        )
    }

    if (tab === "vocabulary") {
        const data = await fetchSearchResult(q, tab, language)
        const firstVocabulary = data.vocabularies?.[0]

        if (firstVocabulary) {
            return createUrlWithLanguage(
                `/vocabulary/${firstVocabulary.id}`,
                language
            )
        }

        return createUrlWithLanguage(
            `/search?q=${encodeURIComponent(
                q
            )}&tab=vocabulary`,
            language
        )
    }

    if (tab === "grammar") {
        const data = await fetchSearchResult(q, tab, language)
        const firstGrammar = data.grammars?.[0]

        if (firstGrammar) {
            return createUrlWithLanguage(
                `/grammar/${firstGrammar.id}?q=${encodeURIComponent(
                    q
                )}`,
                language
            )
        }

        return createUrlWithLanguage(
            `/search?q=${encodeURIComponent(
                q
            )}&tab=grammar`,
            language
        )
    }

    return createUrlWithLanguage(
        `/search?q=${encodeURIComponent(
            q
        )}&tab=${encodeURIComponent(tab)}`,
        language
    )
}