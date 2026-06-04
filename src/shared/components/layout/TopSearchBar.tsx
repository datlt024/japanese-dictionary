"use client"

import styles from "./TopSearchBar.module.css"

import {
    FormEvent,
    useEffect,
    useRef,
    useState,
} from "react"
import {
    useRouter,
    useSearchParams,
} from "next/navigation"

import SearchBar from "@/features/search/components/SearchBar"
import SearchHubDropdown from "@/features/search/components/SearchHubDropdown"

import useSearchHistory from "@/features/history/hooks/useSearchHistory"
import useSearchHub from "@/features/search/hooks/useSearchHub"

import {
    DictionaryLanguage,
    normalizeDictionaryLanguage,
} from "@/shared/types/dictionaryLanguage"

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

function getTabButtonClass(
    currentTab: SearchTab,
    targetTab: SearchTab
) {
    return currentTab === targetTab
        ? `${styles.tabButton} ${styles.activeTab}`
        : styles.tabButton
}

function createUrlWithLanguage(
    path: string,
    language: DictionaryLanguage
) {
    const separator = path.includes("?") ? "&" : "?"

    return `${path}${separator}lang=${language}`
}

function TopSearchBarContent({
    searchKeyword,
    activeSearchTab,
    language,
}: Required<TopSearchBarProps> & {
    language: DictionaryLanguage
}) {
    const router = useRouter()
    const wrapperRef = useRef<HTMLDivElement>(null)

    const [keyword, setKeyword] = useState(searchKeyword)
    const [activeTab, setActiveTab] =
        useState<SearchTab>(activeSearchTab)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const { addHistory } = useSearchHistory()
    const { result, loading } = useSearchHub(
        keyword,
        activeTab,
        language
    )

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
            `/api/search?q=${encodeURIComponent(
                q
            )}&tab=${tab}&lang=${language}`
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
                return createUrlWithLanguage(
                    `/kanji/${kanjis[0]}?q=${encodeURIComponent(
                        q
                    )}`,
                    language
                )
            }

            return createUrlWithLanguage(
                `/search?q=${encodeURIComponent(
                    q
                )}&tab=kanji`,
                language
            )
        }

        if (tab === "vocabulary") {
            const data = await fetchSearchResult(q, tab)
            const firstVocabulary = data.vocabularies?.[0]

            if (firstVocabulary) {
                return createUrlWithLanguage(
                    `/vocabulary/${firstVocabulary.id}`,
                    language
                )
            }

            return createUrlWithLanguage(
                `/search?q=${encodeURIComponent(
                    q
                )}&tab=vocabulary`,
                language
            )
        }

        if (tab === "grammar") {
            const data = await fetchSearchResult(q, tab)
            const firstGrammar = data.grammars?.[0]

            if (firstGrammar) {
                return createUrlWithLanguage(
                    `/grammar/${firstGrammar.id}?q=${encodeURIComponent(
                        q
                    )}`,
                    language
                )
            }

            return createUrlWithLanguage(
                `/search?q=${encodeURIComponent(
                    q
                )}&tab=grammar`,
                language
            )
        }

        return createUrlWithLanguage(
            `/search?q=${encodeURIComponent(q)}&tab=${tab}`,
            language
        )
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
        <div className={styles.topSearch} ref={wrapperRef}>
            <div className={styles.topSearchInner}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.searchDropdownWrapper}>
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
                                language={language}
                            />
                        )}
                    </div>

                    <div className={styles.topSearchTabs}>
                        <button
                            type="button"
                            className={getTabButtonClass(
                                activeTab,
                                "vocabulary"
                            )}
                            onClick={() =>
                                handleTabClick("vocabulary")
                            }
                        >
                            Từ vựng
                        </button>

                        <button
                            type="button"
                            className={getTabButtonClass(
                                activeTab,
                                "kanji"
                            )}
                            onClick={() =>
                                handleTabClick("kanji")
                            }
                        >
                            Hán tự
                        </button>

                        <button
                            type="button"
                            className={getTabButtonClass(
                                activeTab,
                                "example"
                            )}
                            onClick={() =>
                                handleTabClick("example")
                            }
                        >
                            Mẫu câu
                        </button>

                        <button
                            type="button"
                            className={getTabButtonClass(
                                activeTab,
                                "grammar"
                            )}
                            onClick={() =>
                                handleTabClick("grammar")
                            }
                        >
                            Ngữ pháp
                        </button>

                        <button
                            type="button"
                            className={getTabButtonClass(
                                activeTab,
                                "jpjp"
                            )}
                            onClick={() =>
                                handleTabClick("jpjp")
                            }
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
    const searchParams = useSearchParams()

    const language = normalizeDictionaryLanguage(
        searchParams.get("lang")
    )

    return (
        <TopSearchBarContent
            key={`${searchKeyword}-${activeSearchTab}-${language}`}
            searchKeyword={searchKeyword}
            activeSearchTab={activeSearchTab}
            language={language}
        />
    )
}