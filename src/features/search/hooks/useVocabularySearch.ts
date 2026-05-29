import { useEffect, useState } from "react"

import { Vocabulary } from "../types/vocabulary.types"
import { searchVocabularies } from "../services/vocabulary-search.service"

export default function useVocabularySearch(keyword: string) {
    const [vocabularies, setVocabularies] =
        useState<Vocabulary[]>([])

    const [loading, setLoading] =
        useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            async function fetchData() {
                if (!keyword.trim()) {
                    setVocabularies([])
                    return
                }

                setLoading(true)

                const data = await searchVocabularies(keyword)

                setVocabularies(data)
                setLoading(false)
            }

            fetchData()
        }, 250)

        return () => clearTimeout(timer)
    }, [keyword])

    const suggestions = vocabularies
        .sort((a, b) => {
            const searchText = keyword.toLowerCase().trim()

            const getScore = (item: Vocabulary) => {
                const word = item.word.toLowerCase()
                const kana = item.kana.toLowerCase()
                const meaning = item.meaning.toLowerCase()

                if (word === searchText) return 1
                if (kana === searchText) return 2

                if (word.startsWith(searchText)) return 3
                if (kana.startsWith(searchText)) return 4

                if (word.includes(searchText)) return 5
                if (kana.includes(searchText)) return 6
                if (meaning.includes(searchText)) return 7

                return 99
            }

            return getScore(a) - getScore(b)
        })
        .slice(0, 10)

    return {
        vocabularies,
        suggestions,
        loading,
    }
}