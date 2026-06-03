"use client"

import "@/styles/pages/search.css"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

import AppLayout from "@/shared/components/layout/AppLayout"
import EmptyState from "@/shared/components/EmptyState"

import type { SearchTab } from "@/features/search/types"

type AppSearchTab =
    | "vocabulary"
    | "kanji"
    | "grammar"
    | "example"
    | "jpjp"

function normalizeSearchTab(tab: string | null): SearchTab {
    if (
        tab === "vocabulary" ||
        tab === "kanji" ||
        tab === "grammar" ||
        tab === "example" ||
        tab === "jpjp" ||
        tab === "all"
    ) {
        return tab
    }

    return "all"
}

function getActiveSearchTab(tab: SearchTab): AppSearchTab {
    if (tab === "all") {
        return "vocabulary"
    }

    return tab
}

function getEmptyTitle(tab: SearchTab) {
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
            <main className="search-page">
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
        <Suspense fallback={null}>
            <SearchContent />
        </Suspense>
    )
}