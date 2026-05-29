"use client"

import { useEffect, useState } from "react"

import "@/styles/home.css"

import SearchBar from "@/components/search/SearchBar"
import VocabularyCard from "@/components/search/VocabularyCard"
import Sidebar from "@/components/layout/Sidebar"
import SuggestionList from "@/components/search/SuggestionList"

import useSearchHistory from "@/features/history/useSearchHistory"
import { supabase } from "@/lib/supabase"

type Vocabulary = {
  id: number
  word: string
  kana: string
  meaning: string
}

export default function HomePage() {
  const [keyword, setKeyword] = useState("")
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])

  const { histories, addHistory } = useSearchHistory()

  useEffect(() => {
    async function searchVocabularies() {
      const normalizedKeyword = keyword.trim()

      if (!normalizedKeyword) {
        setVocabularies([])
        return
      }

      const exactQuery = supabase
        .from("vocabularies")
        .select("id, word, kana, meaning")
        .or(
          `word.eq.${normalizedKeyword},kana.eq.${normalizedKeyword}`
        )
        .limit(10)

      const prefixQuery = supabase
        .from("vocabularies")
        .select("id, word, kana, meaning")
        .or(
          `word.ilike.${normalizedKeyword}%,kana.ilike.${normalizedKeyword}%`
        )
        .limit(20)

      const containsQuery = supabase
        .from("vocabularies")
        .select("id, word, kana, meaning")
        .or(
          `word.ilike.%${normalizedKeyword}%,kana.ilike.%${normalizedKeyword}%,meaning.ilike.%${normalizedKeyword}%`
        )
        .limit(50)

      const [
        exactResult,
        prefixResult,
        containsResult,
      ] = await Promise.all([
        exactQuery,
        prefixQuery,
        containsQuery,
      ])

      if (
        exactResult.error ||
        prefixResult.error ||
        containsResult.error
      ) {
        console.error(
          exactResult.error ||
          prefixResult.error ||
          containsResult.error
        )

        setVocabularies([])
        return
      }

      const merged = [
        ...(exactResult.data || []),
        ...(prefixResult.data || []),
        ...(containsResult.data || []),
      ]

      const unique = merged.filter(
        (item, index, self) =>
          index === self.findIndex((v) => v.id === item.id)
      )

      setVocabularies(unique)
    }

    searchVocabularies()
  }, [keyword])

  const suggestions = vocabularies.slice(0, 10).sort((a, b) => {
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

  return (
    <div className="layout">
      <Sidebar />

      <main className="main-content">
        <header className="header">
          <div className="header-container">
            <h1 className="title">
              Japanese Dictionary
            </h1>

            <p className="subtitle">
              Tra cứu tiếng Nhật
            </p>
          </div>
        </header>

        <div className="content">
          <div className="search-box">
            <SearchBar
              value={keyword}
              onChange={(value) => {
                setKeyword(value)

                if (value.trim()) {
                  addHistory(value)
                }
              }}
            />

            <SuggestionList
              items={suggestions}
              onSelect={(word) => setKeyword(word)}
            />

            <div className="tab-container">
              <button className="active-tab">
                Từ vựng
              </button>

              <button className="tab">
                Kanji
              </button>

              <button className="tab">
                Ngữ pháp
              </button>
            </div>
          </div>

          <div className="history-container">
            {histories.map((item) => (
              <button
                key={item}
                className="history-item"
                onClick={() => setKeyword(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="result-list">
            {vocabularies.map((item) => (
              <VocabularyCard
                key={item.id}
                id={item.id}
                word={item.word}
                kana={item.kana}
                meaning={item.meaning}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}