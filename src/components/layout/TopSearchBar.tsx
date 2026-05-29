"use client"

import "./TopSearchBar.css"

import { useState } from "react"
import SearchBar from "@/components/search/SearchBar"
import SuggestionList from "@/components/search/SuggestionList"
import useSearchHistory from "@/features/history/useSearchHistory"
import useVocabularySearch from "@/features/search/hooks/useVocabularySearch"

export default function TopSearchBar() {
    const [keyword, setKeyword] = useState("")

    const { addHistory } = useSearchHistory()

    const { suggestions } = useVocabularySearch(keyword)

    return (
        <div className="top-search">
            <div className="top-search-inner">
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
            </div>
        </div>
    )
}