"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

import styles from "@/features/dictionary/search/styles/SearchPage.module.css"

import AppLayout from "@/shared/components/layout/AppLayout"
import EmptyState from "@/shared/components/EmptyState/EmptyState"

import {
    normalizeSearchTab,
} from "@/shared/constants/search-tabs"

import type {
    SearchTab,
    SearchTabWithAll,
} from "@/shared/constants/search-tabs"

function getActiveSearchTab(tab: SearchTabWithAll): SearchTab {
    if (tab === "all") {
        return "vocabulary"
    }

    return tab
}

function getEmptyTitle(tab: SearchTabWithAll) {
    switch (tab) {
        case "vocabulary":
            return "Không có dữ liệu từ vựng"
        case "kanji":
            return "Không có dữ liệu Hán tự"
        case "grammar":
            return "Không có dữ liệu ngữ pháp"
        case "example":
            return "Không có dữ liệu ví dụ"
        case "jpjp":
            return "Không có dữ liệu Nhật - Nhật"
        default:
            return "Không có dữ liệu"
    }
}

function SearchFallback() {
    return null
}

function SearchContent() {
    const searchParams = useSearchParams()

    const keyword = searchParams.get("q")?.trim() || ""
    const tab = normalizeSearchTab(searchParams.get("tab"))

    return (
        <AppLayout
            title="Tra cứu"
            searchKeyword={keyword}
            activeSearchTab={getActiveSearchTab(tab)}
        >
            <main className={styles.searchPage}>
                <EmptyState
                    title={getEmptyTitle(tab)}
                    keyword={keyword}
                    description={
                        keyword
                            ? `Không tìm thấy dữ liệu phù hợp với "${keyword}".`
                            : "Vui lòng nhập từ khóa để tra cứu."
                    }
                    backHref="/"
                    backLabel="Quay lại trang chủ"
                />
            </main>
        </AppLayout>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchFallback />}>
            <SearchContent />
        </Suspense>
    )
}