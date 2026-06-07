"use client"

import {
    FormEvent,
    useCallback,
    useRef,
    useState,
} from "react"
import {
    useRouter,
    useSearchParams,
} from "next/navigation"

import styles from "./TopSearchBar.module.css"

import SearchBar from "@/features/dictionary/search/components/SearchBar"
import SearchHubDropdown from "@/features/dictionary/search/components/SearchHubDropdown"

import useSearchHistory from "@/features/user/search-history/hooks/useSearchHistory"
import useSearchHub from "@/features/dictionary/search/hooks/useSearchHub"

import { useClickOutside } from "@/shared/hooks/useClickOutside"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { extractKanjis } from "@/shared/utils/japanese"

import {
    DictionaryLanguage,
    normalizeDictionaryLanguage,
} from "@/shared/types/dictionaryLanguage"

import {
    SEARCH_TAB_LABELS,
} from "@/shared/constants/search-tabs"

import type {
    SearchTab,
} from "@/shared/constants/search-tabs"

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

const SEARCH_TABS: SearchTab[] = [
    "vocabulary",
    "kanji",
    "example",
    "grammar",
    "jpjp",
]

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

    return `${path}${separator}lang=${encodeURIComponent(language)}`
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
    const [handwritingOpen, setHandwritingOpen] = useState(false)

    const debouncedKeyword = useDebounce(keyword, 300)

    const { addHistory } = useSearchHistory()

    const { result, loading } = useSearchHub(
        debouncedKeyword,
        activeTab,
        language
    )

    const isDebouncing =
        keyword.trim() !== debouncedKeyword.trim()

    const isSearchLoading = loading || isDebouncing

    const handleClickOutside = useCallback(() => {
        setIsDropdownOpen(false)
    }, [])

    useClickOutside(wrapperRef, handleClickOutside)

    function closeDropdown() {
        setIsDropdownOpen(false)
    }

    async function fetchSearchResult(
        q: string,
        tab: SearchTab
    ): Promise<SearchApiResponse> {
        try {
            const response = await fetch(
                `/api/search?q=${encodeURIComponent(
                    q
                )}&tab=${encodeURIComponent(
                    tab
                )}&lang=${encodeURIComponent(language)}`
            )

            if (!response.ok) {
                return {}
            }

            return response.json() as Promise<SearchApiResponse>
        } catch {
            return {}
        }
    }

    async function getTargetUrl(tab: SearchTab, q: string) {
        if (!q) {
            return null
        }

        if (tab === "kanji") {
            const kanjis = extractKanjis(q)

            if (kanjis.length > 0) {
                return createUrlWithLanguage(
                    `/kanji/${encodeURIComponent(
                        kanjis[0]
                    )}?q=${encodeURIComponent(q)}`,
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
            `/search?q=${encodeURIComponent(
                q
            )}&tab=${encodeURIComponent(tab)}`,
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

        if (!keyword.trim()) {
            return
        }

        await navigateSearch(tab)
    }

    function handleHandwritingOpenChange(open: boolean) {
        setHandwritingOpen(open)

        if (open) {
            setIsDropdownOpen(Boolean(keyword.trim()))
        }
    }

    return (
        <div className={styles.topSearch} ref={wrapperRef}>
            <div className={styles.topSearchInner}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.searchDropdownWrapper}>
                        <SearchBar
                            value={keyword}
                            onChange={handleChange}
                            handwritingOpen={handwritingOpen}
                            onHandwritingOpenChange={
                                handleHandwritingOpenChange
                            }
                        />

                        {isDropdownOpen && keyword.trim() && (
                            <SearchHubDropdown
                                result={result}
                                keyword={debouncedKeyword}
                                loading={isSearchLoading}
                                activeTab={activeTab}
                                language={language}
                            />
                        )}
                    </div>

                    <div className={styles.topSearchTabs}>
                        {SEARCH_TABS.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                className={getTabButtonClass(
                                    activeTab,
                                    tab
                                )}
                                onClick={() =>
                                    handleTabClick(tab)
                                }
                            >
                                {SEARCH_TAB_LABELS[tab]}
                            </button>
                        ))}
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