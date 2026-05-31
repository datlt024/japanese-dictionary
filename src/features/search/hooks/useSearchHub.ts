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

export type SearchHubResult = {
    vocabularies: SearchVocabulary[]
    kanjis: SearchKanji[]
    grammars: unknown[]
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
        const timer = setTimeout(() => {
            async function fetchSearchHub() {
                const normalizedKeyword = keyword.trim()

                if (!normalizedKeyword) {
                    setResult(emptyResult)
                    return
                }

                setLoading(true)

                try {
                    const response = await fetch(
                        `/api/search?q=${encodeURIComponent(
                            normalizedKeyword
                        )}`
                    )

                    const data = await response.json()

                    setResult({
                        vocabularies: data.vocabularies || [],
                        kanjis: data.kanjis || [],
                        grammars: data.grammars || [],
                        examples: data.examples || [],
                    })
                } catch (error) {
                    console.error(error)
                    setResult(emptyResult)
                } finally {
                    setLoading(false)
                }
            }

            fetchSearchHub()
        }, 250)

        return () => clearTimeout(timer)
    }, [keyword])

    return {
        result,
        loading,
    }
}