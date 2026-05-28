"use client"

import { useState } from "react"

import "@/styles/home.css"

import SearchBar from "@/components/search/SearchBar"
import VocabularyCard from "@/components/search/VocabularyCard"

import { vocabularies } from "@/data/vocabulary"

export default function HomePage() {
  const [keyword, setKeyword] = useState("")

  const filteredWords = vocabularies.filter((item) => {
    return (
      item.word.includes(keyword) ||
      item.kana.includes(keyword) ||
      item.meaning.includes(keyword)
    )
  })

  return (
    <main className="page">
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
            onChange={setKeyword}
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

        {/* Result */}
        <div className="result-list">
          {filteredWords.map((item) => (
            <VocabularyCard
              key={item.id}
              word={item.word}
              kana={item.kana}
              meaning={item.meaning}
            />
          ))}
        </div>
      </div>
    </main>
  )
}