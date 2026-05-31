"use client"

import "./TopSearchBar.css"

import {
    FormEvent,
    useEffect,
    useRef,
    useState,
} from "react"
import { useRouter } from "next/navigation"

import SearchBar from "@/components/search/SearchBar"
import SearchHubDropdown from "@/components/search/SearchHubDropdown"

import useSearchHistory from "@/features/history/useSearchHistory"
import useSearchHub from "@/features/search/hooks/useSearchHub"

export type SearchTab =
    | "vocabulary"
    | "kanji"
    | "grammar"
    | "example"
    | "jpjp"

type TopSearchBarProps = {
    searchKeyword?: string
    activeSearchTab?: SearchTab
}

export default function TopSearchBar({
    searchKeyword = "",
    activeSearchTab = "vocabulary",
}: TopSearchBarProps) {
    const router = useRouter()
    const wrapperRef = useRef<HTMLDivElement>(null)

    const [keyword, setKeyword] = useState(searchKeyword)
    const [activeTab, setActiveTab] =
        useState<SearchTab>(activeSearchTab)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const { addHistory } = useSearchHistory()
    const { result, loading } = useSearchHub(keyword)

    useEffect(() => {
        setKeyword(searchKeyword)
        setIsDropdownOpen(false)
    }, [searchKeyword])

    useEffect(() => {
        setActiveTab(activeSearchTab)
    }, [activeSearchTab])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    function closeDropdown() {
        setIsDropdownOpen(false)
    }

    async function getTargetUrl(tab: SearchTab, q: string) {
        if (!q) return null

        const response = await fetch(
            `/api/search?q=${encodeURIComponent(q)}`
        )

        const data = await response.json()

        if (tab === "vocabulary") {
            const firstVocabulary = data.vocabularies?.[0]

            if (firstVocabulary) {
                return `/vocabulary/${firstVocabulary.id}`
            }

            return `/search?q=${encodeURIComponent(q)}&tab=vocabulary`
        }

        if (tab === "kanji") {
            const firstKanji = data.kanjis?.[0]

            if (firstKanji) {
                return `/kanji/${firstKanji.kanji}`
            }

            return `/search?q=${encodeURIComponent(q)}&tab=kanji`
        }

        return `/search?q=${encodeURIComponent(q)}&tab=${tab}`
    }

    async function navigateSearch(tab: SearchTab) {
        const q = keyword.trim()

        if (!q) return

        closeDropdown()
        addHistory(q)

        const targetUrl = await getTargetUrl(tab, q)

        if (targetUrl) {
            router.push(targetUrl)
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()
        await navigateSearch(activeTab)
    }

    function handleChange(value: string) {
        setKeyword(value)

        if (value.trim()) {
            setIsDropdownOpen(true)
        } else {
            setIsDropdownOpen(false)
        }
    }

    async function handleTabClick(tab: SearchTab) {
        setActiveTab(tab)
        await navigateSearch(tab)
    }

    return (
        <div className="top-search" ref={wrapperRef}>
            <div className="top-search-inner">
                <form onSubmit={handleSubmit}>
                    <SearchBar
                        value={keyword}
                        onChange={handleChange}
                    />

                    <div className="top-search-tabs">
                        <button
                            type="button"
                            className={activeTab === "vocabulary" ? "active" : ""}
                            onClick={() => handleTabClick("vocabulary")}
                        >
                            Từ vựng
                        </button>

                        <button
                            type="button"
                            className={activeTab === "kanji" ? "active" : ""}
                            onClick={() => handleTabClick("kanji")}
                        >
                            Hán tự
                        </button>

                        <button
                            type="button"
                            className={activeTab === "example" ? "active" : ""}
                            onClick={() => handleTabClick("example")}
                        >
                            Mẫu câu
                        </button>

                        <button
                            type="button"
                            className={activeTab === "grammar" ? "active" : ""}
                            onClick={() => handleTabClick("grammar")}
                        >
                            Ngữ pháp
                        </button>

                        <button
                            type="button"
                            className={activeTab === "jpjp" ? "active" : ""}
                            onClick={() => handleTabClick("jpjp")}
                        >
                            Nhật - Nhật
                        </button>
                    </div>
                </form>

                {isDropdownOpen && keyword.trim() && (
                    <div onClick={closeDropdown}>
                        <SearchHubDropdown
                            result={result}
                            keyword={keyword}
                            loading={loading}
                            activeTab={activeTab}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}