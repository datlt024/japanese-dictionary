import { useEffect, useMemo, useState } from "react"

export type SearchTab =
    | "vocabulary"
    | "kanji"
    | "grammar"
    | "example"
    | "jpjp"

export type SearchVocabulary = {
    id: number
    word: string
    kana: string | string[] | null
    meaning: string | null
    meaning_en?: string | null
    meaning_vi?: string | null
    part_of_speech?: string | null
    is_common: boolean | null
}

export type SearchKanji = {
    id: number
    kanji: string
    meaning: string | null
    onyomi: string | null
    kunyomi: string | null
    stroke_count: number | null
    jlpt: number | null
    grade: number | null
    frequency: number | null
}

export type SearchGrammar = {
    id: number
    pattern: string
    reading?: string | null
    jlpt_level: string | null
    meaning_vi: string | null
    meaning_en: string | null
    short_meaning_vi?: string | null
    structure?: string | null
    explanation_vi?: string | null
    explanation_en?: string | null
    example_jp?: string | null
    example_vi?: string | null
    source?: string | null
}

export type SearchHubResult = {
    vocabularies: SearchVocabulary[]
    kanjis: SearchKanji[]
    grammars: SearchGrammar[]
    examples: unknown[]
}

const emptyResult: SearchHubResult = {
    vocabularies: [],
    kanjis: [],
    grammars: [],
    examples: [],
}

type SearchResponse = Partial<SearchHubResult>

const searchCache = new Map<string, SearchHubResult>()

function normalizeSearchResponse(
    data: SearchResponse
): SearchHubResult {
    return {
        vocabularies: data.vocabularies || [],
        kanjis: data.kanjis || [],
        grammars: data.grammars || [],
        examples: data.examples || [],
    }
}

export default function useSearchHub(
    keyword: string,
    activeTab: SearchTab
) {
    const normalizedKeyword = useMemo(() => {
        return keyword.trim()
    }, [keyword])

    const cacheKey = useMemo(() => {
        return `${normalizedKeyword}:${activeTab}`
    }, [normalizedKeyword, activeTab])

    const initialResult = useMemo(() => {
        if (!normalizedKeyword) {
            return emptyResult
        }

        return searchCache.get(cacheKey) || emptyResult
    }, [normalizedKeyword, cacheKey])

    const [result, setResult] =
        useState<SearchHubResult>(initialResult)

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!normalizedKeyword) {
            return
        }

        if (searchCache.has(cacheKey)) {
            return
        }

        const controller = new AbortController()

        async function fetchSearchResult() {
            setLoading(true)

            try {
                await new Promise((resolve) => {
                    setTimeout(resolve, 150)
                })

                if (controller.signal.aborted) {
                    return
                }

                const response = await fetch(
                    `/api/search?q=${encodeURIComponent(
                        normalizedKeyword
                    )}&tab=${activeTab}`,
                    {
                        signal: controller.signal,
                    }
                )

                const data =
                    (await response.json()) as SearchResponse

                const normalizedResult =
                    normalizeSearchResponse(data)

                searchCache.set(cacheKey, normalizedResult)
                setResult(normalizedResult)
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                ) {
                    return
                }

                console.error(error)
                setResult(emptyResult)
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        fetchSearchResult()

        return () => {
            controller.abort()
        }
    }, [normalizedKeyword, activeTab, cacheKey])

    return {
        result: normalizedKeyword ? result : emptyResult,
        loading: normalizedKeyword ? loading : false,
    }
}