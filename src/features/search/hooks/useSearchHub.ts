import useSWR from "swr"

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
    meaning_vi?: string | null
    meaning_en?: string | null
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

async function fetchSearchResult(
    url: string
): Promise<SearchHubResult> {
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error("Search request failed")
    }

    const data = (await response.json()) as SearchResponse

    return normalizeSearchResponse(data)
}

export default function useSearchHub(
    keyword: string,
    activeTab: SearchTab
) {
    const normalizedKeyword = keyword.trim()

    const shouldSearch = Boolean(normalizedKeyword)

    const searchUrl = shouldSearch
        ? `/api/search?q=${encodeURIComponent(
            normalizedKeyword
        )}&tab=${activeTab}`
        : null

    const { data, isLoading, error } = useSWR(
        searchUrl,
        fetchSearchResult,
        {
            dedupingInterval: 10_000,
            keepPreviousData: true,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    )

    if (error) {
        console.error(error)
    }

    return {
        result: shouldSearch ? data || emptyResult : emptyResult,
        loading: shouldSearch ? isLoading : false,
    }
}