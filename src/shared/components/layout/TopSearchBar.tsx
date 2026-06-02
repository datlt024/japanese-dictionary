"use client"

import "./TopSearchBar.css"

import {
    FormEvent,
    useEffect,
    useRef,
    useState,
} from "react"
import { useRouter } from "next/navigation"

import SearchBar from "@/features/search/components/SearchBar"
import SearchHubDropdown from "@/features/search/components/SearchHubDropdown"

import useSearchHistory from "@/features/history/hooks/useSearchHistory"
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

type SearchApiResponse = {
    vocabularies?: {
        id: number
    }[]
    grammars?: {
        id: number
    }[]
}

function extractKanjis(text: string) {
    return Array.from(text.matchAll(/[\u4e00-\u9faf]/g)).map(
        (match) => match[0]
    )
}

function TopSearchBarContent({
    searchKeyword,
    activeSearchTab,
}: Required<TopSearchBarProps>) {
    const router = useRouter()
    const wrapperRef = useRef<HTMLDivElement>(null)

    const [keyword, setKeyword] = useState(searchKeyword)
    const [activeTab, setActiveTab] =
        useState<SearchTab>(activeSearchTab)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const { addHistory } = useSearchHistory()
    const { result, loading } = useSearchHub(keyword, activeTab)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(
                    event.target as Node
                )
            ) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            )
        }
    }, [])

    function closeDropdown() {
        setIsDropdownOpen(false)
    }

    async function fetchSearchResult(
        q: string,
        tab: SearchTab
    ): Promise<SearchApiResponse> {
        const response = await fetch(
            `/api/search?q=${encodeURIComponent(q)}&tab=${tab}`
        )

        return response.json() as Promise<SearchApiResponse>
    }

    async function getTargetUrl(tab: SearchTab, q: string) {
        if (!q) {
            return null
        }

        if (tab === "kanji") {
            const kanjis = extractKanjis(q)

            if (kanjis.length > 0) {
                return `/kanji/${kanjis[0]}?q=${encodeURIComponent(
                    q
                )}`
            }

            return `/search?q=${encodeURIComponent(q)}&tab=kanji`
        }

        if (tab === "vocabulary") {
            const data = await fetchSearchResult(q, tab)
            const firstVocabulary = data.vocabularies?.[0]

            if (firstVocabulary) {
                return `/vocabulary/${firstVocabulary.id}`
            }

            return `/search?q=${encodeURIComponent(
                q
            )}&tab=vocabulary`
        }

        if (tab === "grammar") {
            const data = await fetchSearchResult(q, tab)
            const firstGrammar = data.grammars?.[0]

            if (firstGrammar) {
                return `/grammar/${firstGrammar.id}?q=${encodeURIComponent(
                    q
                )}`
            }

            return `/search?q=${encodeURIComponent(q)}&tab=grammar`
        }

        return `/search?q=${encodeURIComponent(q)}&tab=${tab}`
    }

    async function navigateSearch(tab: SearchTab) {
        const q = keyword.trim()

        if (!q) {
            return
        }

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
        setIsDropdownOpen(Boolean(value.trim()))
    }

    async function handleTabClick(tab: SearchTab) {
        setActiveTab(tab)
        await navigateSearch(tab)
    }

    return (
        <div className="top-search" ref={wrapperRef}>
            <div className="top-search-inner">
                <form onSubmit={handleSubmit}>
                    <div className="search-dropdown-wrapper">
                        <SearchBar
                            value={keyword}
                            onChange={handleChange}
                        />

                        {isDropdownOpen && keyword.trim() && (
                            <SearchHubDropdown
                                result={result}
                                keyword={keyword}
                                loading={loading}
                                activeTab={activeTab}
                            />
                        )}
                    </div>

                    <div className="top-search-tabs">
                        <button
                            type="button"
                            className={
                                activeTab === "vocabulary"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                handleTabClick("vocabulary")
                            }
                        >
                            Từ vựng
                        </button>

                        <button
                            type="button"
                            className={
                                activeTab === "kanji" ? "active" : ""
                            }
                            onClick={() => handleTabClick("kanji")}
                        >
                            Hán tự
                        </button>

                        <button
                            type="button"
                            className={
                                activeTab === "example"
                                    ? "active"
                                    : ""
                            }
                            onClick={() => handleTabClick("example")}
                        >
                            Mẫu câu
                        </button>

                        <button
                            type="button"
                            className={
                                activeTab === "grammar"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                handleTabClick("grammar")
                            }
                        >
                            Ngữ pháp
                        </button>

                        <button
                            type="button"
                            className={
                                activeTab === "jpjp" ? "active" : ""
                            }
                            onClick={() => handleTabClick("jpjp")}
                        >
                            Nhật - Nhật
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function TopSearchBar({
    searchKeyword = "",
    activeSearchTab = "vocabulary",
}: TopSearchBarProps) {
    return (
        <TopSearchBarContent
            key={`${searchKeyword}-${activeSearchTab}`}
            searchKeyword={searchKeyword}
            activeSearchTab={activeSearchTab}
        />
    )
}