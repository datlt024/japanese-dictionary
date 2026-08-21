"use client"

import {
    FormEvent,
    KeyboardEvent,
    useCallback,
    useRef,
    useState,
} from "react"
import {
    useRouter,
    useSearchParams,
} from "next/navigation"

import styles from "./TopSearchBar.module.css"

import dynamic from "next/dynamic"

import SearchBar from "@/features/dictionary/search/components/SearchBar"
import SearchHubDropdown from "@/features/dictionary/search/components/SearchHubDropdown"
import VoiceSearchModal from "@/features/dictionary/search/components/VoiceSearchModal"

const ImageScanModal = dynamic(
    () => import("@/features/dictionary/image-scan/components/ImageScanModal"),
    { ssr: false }
)

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
    hideTabs?: boolean
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
    hideTabs = false,
}: Required<Omit<TopSearchBarProps, "hideTabs">> & {
    language: DictionaryLanguage
    hideTabs?: boolean
}) {
    const router = useRouter()
    const wrapperRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const [keyword, setKeyword] = useState(searchKeyword)
    const [activeTab, setActiveTab] =
        useState<SearchTab>(activeSearchTab)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [handwritingOpen, setHandwritingOpen] = useState(false)
    const [voiceSearchOpen, setVoiceSearchOpen] = useState(false)
    const [imageScanOpen, setImageScanOpen] = useState(false)

    const debouncedKeyword = useDebounce(keyword, 150)

    const { addHistory } = useSearchHistory()

    const { result, loading, error: searchError } = useSearchHub(
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

    function getFocusableDropdownItems(): HTMLAnchorElement[] {
        if (!dropdownRef.current) return []
        return Array.from(dropdownRef.current.querySelectorAll("a[href]"))
    }

    function handleWrapperKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        if (e.key === "Escape") {
            setIsDropdownOpen(false)
            inputRef.current?.focus()
            return
        }

        const items = getFocusableDropdownItems()
        if (items.length === 0) return

        const active = document.activeElement
        const idx = items.indexOf(active as HTMLAnchorElement)

        if (e.key === "ArrowDown") {
            e.preventDefault()
            if (idx === -1) {
                items[0]?.focus()
            } else {
                items[Math.min(idx + 1, items.length - 1)]?.focus()
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            if (idx <= 0) {
                inputRef.current?.focus()
            } else {
                items[idx - 1]?.focus()
            }
        }
    }

    return (
        <>
            <div className={styles.topSearch} ref={wrapperRef}>
                <div className={styles.topSearchInner}>
                    <form onSubmit={handleSubmit}>
                        <div
                            className={styles.searchDropdownWrapper}
                            onKeyDown={handleWrapperKeyDown}
                        >
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
                                inputRef={inputRef}
                            />

                            {isDropdownOpen && keyword.trim() && (
                                <SearchHubDropdown
                                    ref={dropdownRef}
                                    result={result}
                                    keyword={debouncedKeyword}
                                    loading={isSearchLoading}
                                    error={searchError}
                                    activeTab={activeTab}
                                    language={language}
                                />
                            )}
                        </div>

                        {!hideTabs && (
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
                        )}
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
    hideTabs = false,
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
            hideTabs={hideTabs}
        />
    )
}