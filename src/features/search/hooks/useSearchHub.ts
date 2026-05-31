import { useEffect, useState } from "react"

export type SearchVocabulary = {
    id: number
    word: string
    kana: string | null
    meaning_en: string | null
    meaning_vi: string | null
    part_of_speech: string | null
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
    jlpt_level: string | null
    meaning_vi: string | null
    meaning_en: string | null
    structure: string | null
    explanation_vi: string | null
    explanation_en: string | null
    example_jp: string | null
    example_vi: string | null
    source: string | null
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

export default function useSearchHub(keyword: string) {
    const [result, setResult] =
        useState<SearchHubResult>(emptyResult)

    const [loading, setLoading] =
        useState(false)

    useEffect(() => {
        const normalizedKeyword = keyword.trim()

        if (!normalizedKeyword) {
            setResult(emptyResult)
            setLoading(false)
            return
        }

        const controller = new AbortController()

        const timer = setTimeout(async () => {
            setLoading(true)

            try {
                const response = await fetch(
                    `/api/search?q=${encodeURIComponent(normalizedKeyword)}`,
                    {
                        signal: controller.signal,
                    }
                )

                const data = await response.json()

                setResult({
                    vocabularies: data.vocabularies || [],
                    kanjis: data.kanjis || [],
                    grammars: data.grammars || [],
                    examples: data.examples || [],
                })
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return
                }

                console.error(error)
                setResult(emptyResult)
            } finally {
                setLoading(false)
            }
        }, 250)

        return () => {
            clearTimeout(timer)
            controller.abort()
        }
    }, [keyword])

    return {
        result,
        loading,
    }
}