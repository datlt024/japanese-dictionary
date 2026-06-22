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
import VoiceSearchModal from "@/features/dictionary/search/components/VoiceSearchModal"
import ImageScanModal from "@/features/dictionary/image-scan/components/ImageScanModal"

import useSearchHistory from "@/features/user/search-history/hooks/useSearchHistory"
import useSearchHub from "@/features/dictionary/search/hooks/useSearchHub"

import { getSearchTargetUrl } from "@/features/dictionary/search/utils"

import { useClickOutside } from "@/shared/hooks/useClickOutside"
import { useDebounce } from "@/shared/hooks/useDebounce"

import {
    normalizeDictionaryLanguage,
    type DictionaryLanguage,
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
    const [voiceSearchOpen, setVoiceSearchOpen] = useState(false)
    const [imageScanOpen, setImageScanOpen] = useState(false)

    const debouncedKeyword = useDebounce(keyword, 150)

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

    async function navigateSearch(
        tab: SearchTab,
        searchText = keyword
    ) {
        const q = searchText.trim()

        if (!q) {
            return
        }

        closeDropdown()
        addHistory(q)

        const targetUrl = await getSearchTargetUrl(
            tab,
            q,
            language
        )

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

    async function handleVoiceSearchResult(text: string) {
        const q = text.trim()

        if (!q) {
            return
        }

        setKeyword(q)
        setIsDropdownOpen(false)

        await navigateSearch(activeTab, q)
    }

    function handleImageScanOpen() {
        setImageScanOpen(true)
        setIsDropdownOpen(false)
    }

    function handleImageScanClose() {
        setImageScanOpen(false)
    }

    return (
        <>
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
                                onVoiceSearchOpen={() =>
                                    setVoiceSearchOpen(true)
                                }
                                onImageScanOpen={handleImageScanOpen}
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

            <VoiceSearchModal
                open={voiceSearchOpen}
                activeTab={activeTab}
                dictionaryLanguage={language}
                onClose={() => setVoiceSearchOpen(false)}
                onResult={handleVoiceSearchResult}
            />

            <ImageScanModal
                open={imageScanOpen}
                onClose={handleImageScanClose}
            />
        </>
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