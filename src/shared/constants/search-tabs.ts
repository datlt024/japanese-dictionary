export const SEARCH_TABS = [
    "vocabulary",
    "kanji",
    "grammar",
    "example",
    "jpjp",
] as const

export const SEARCH_TABS_WITH_ALL = [
    ...SEARCH_TABS,
    "all",
] as const

export type SearchTab = typeof SEARCH_TABS[number]
export type SearchTabWithAll =
    typeof SEARCH_TABS_WITH_ALL[number]

export const SEARCH_TAB_LABELS: Record<SearchTab, string> = {
    vocabulary: "Từ vựng",
    kanji: "Hán tự",
    grammar: "Ngữ pháp",
    example: "Mẫu câu",
    jpjp: "Nhật - Nhật",
}

export function isSearchTab(value: string | null): value is SearchTab {
    return SEARCH_TABS.includes(value as SearchTab)
}

export function isSearchTabWithAll(
    value: string | null
): value is SearchTabWithAll {
    return SEARCH_TABS_WITH_ALL.includes(
        value as SearchTabWithAll
    )
}

export function normalizeSearchTab(
    value: string | null
): SearchTabWithAll {
    if (isSearchTabWithAll(value)) {
        return value
    }

    return "all"
}

export function normalizeAppSearchTab(
    value: string | null
): SearchTab {
    if (isSearchTab(value)) {
        return value
    }

    return "vocabulary"
}