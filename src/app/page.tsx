"use client"

import { useEffect, useState } from "react"

import { getVocabularies } from "@/services/vocabulary.service"

import "@/styles/home.css"

import SearchBar from "@/components/search/SearchBar"
import VocabularyCard from "@/components/search/VocabularyCard"
import Sidebar from "@/components/layout/Sidebar"
import SuggestionList from "@/components/search/SuggestionList"

import useSearchHistory from "@/features/history/useSearchHistory"

type Vocabulary = {
  id: number
  word: string
  kana: string
  meaning: string
}

export default function HomePage() {
  const [keyword, setKeyword] = useState("")

  const [vocabularies, setVocabularies] =
    useState<Vocabulary[]>([])

  const {
    histories,
    addHistory,
  } = useSearchHistory()

  useEffect(() => {
    async function fetchVocabularies() {
      try {
        const data = await getVocabularies()

        setVocabularies(data || [])
      } catch (error) {
        console.error(error)
      }
    }

    fetchVocabularies()
  }, [])

  const filteredWords = vocabularies.filter((item) => {
    const normalizedKeyword =
      keyword.toLowerCase().trim()

    return (
      item.word
        .toLowerCase()
        .includes(normalizedKeyword) ||

      item.kana
        .toLowerCase()
        .includes(normalizedKeyword) ||

      item.meaning
        .toLowerCase()
        .includes(normalizedKeyword)
    )
  })

  const suggestions = vocabularies.filter((item) => {
    if (!keyword.trim()) {
      return false
    }

    const normalizedKeyword =
      keyword.toLowerCase().trim()

    return (
      item.word
        .toLowerCase()
        .includes(normalizedKeyword) ||

      item.kana
        .toLowerCase()
        .includes(normalizedKeyword) ||

      item.meaning
        .toLowerCase()
        .includes(normalizedKeyword)
    )
  })

  return (
    <div className="layout">
      <Sidebar />

      <main className="main-content">
        {/* Header */}
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

        {/* Content */}
        <div className="content">
          {/* Search */}
          <div className="search-box">
            <SearchBar
              value={keyword}
              onChange={(value) => {
                setKeyword(value)

                addHistory(value)
              }}
            />

            <SuggestionList
              items={suggestions}
              onSelect={(word) => setKeyword(word)}
            />

            {/* Tabs */}
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

          {/* History */}
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

          {/* Result */}
          <div className="result-list">
            {filteredWords.map((item) => (
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