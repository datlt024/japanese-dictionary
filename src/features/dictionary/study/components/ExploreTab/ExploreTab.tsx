"use client"

import { useMemo, useState } from "react"
import { Eye, Heart, LayoutGrid, List } from "lucide-react"
import useSWR from "swr"
import type { ExploreSection, PublicNotebook } from "@/domain/notebook/notebook.type"
import {
    fetchExploreSections,
    loadLiked, saveLiked,
    loadLikedSections, saveLikedSections,
    loadViewed, saveViewed,
} from "./explore-utils"
import type { SubTab, ViewMode } from "./explore-utils"
import ExploreDetailView from "./ExploreDetailView"
import {
    FavoritesView,
    GridView,
    HistoryView,
    ListView,
    SectionDetailGrid,
} from "./ExploreCards"
import styles from "./ExploreTab.module.css"

export default function ExploreTab() {
    const [subTab,          setSubTab]          = useState<SubTab>("explore")
    const [viewMode,        setViewMode]        = useState<ViewMode>("list")
    const [selected,        setSelected]        = useState<PublicNotebook | null>(null)
    const [selectedSection, setSelectedSection] = useState<ExploreSection | null>(null)

    const [likedIds, setLikedIds] = useState<Set<string>>(() => {
        if (typeof window === "undefined") return new Set()
        return loadLiked()
    })
    const [likedSectionIds, setLikedSectionIds] = useState<Set<string>>(() => {
        if (typeof window === "undefined") return new Set()
        return loadLikedSections()
    })
    const [viewedIds, setViewedIds] = useState<string[]>(() => {
        if (typeof window === "undefined") return []
        return loadViewed()
    })

    // Single SWR call — all sub-views read from this cache
    const { data: sections, isLoading, error } = useSWR<ExploreSection[]>(
        "/explore/notebooks",
        fetchExploreSections,
        { revalidateOnFocus: false, dedupingInterval: 300_000 }
    )

    const totalLiked = useMemo(() => likedIds.size + likedSectionIds.size, [likedIds, likedSectionIds])

    function toggleLike(id: string, e: React.MouseEvent) {
        e.stopPropagation()
        const next = new Set(likedIds)
        if (next.has(id)) next.delete(id); else next.add(id)
        saveLiked(next); setLikedIds(next)
    }

    function toggleLikeSection(id: string, e: React.MouseEvent) {
        e.stopPropagation()
        const next = new Set(likedSectionIds)
        if (next.has(id)) next.delete(id); else next.add(id)
        saveLikedSections(next); setLikedSectionIds(next)
    }

    function handleSelect(nb: PublicNotebook) {
        const next = [nb.id, ...viewedIds.filter((i) => i !== nb.id)].slice(0, 50)
        saveViewed(next); setViewedIds(next); setSelected(nb)
    }

    function handleViewMode(mode: ViewMode) {
        setViewMode(mode); setSelectedSection(null)
    }

    // ── Detail views ──────────────────────────────

    if (selected) {
        return <ExploreDetailView notebook={selected} onBack={() => setSelected(null)} />
    }

    if (selectedSection && viewMode === "grid") {
        return (
            <SectionDetailGrid
                section={selectedSection}
                onBack={() => setSelectedSection(null)}
                onSelect={handleSelect}
                likedIds={likedIds}
                onToggleLike={toggleLike}
            />
        )
    }

    // ── Main layout ───────────────────────────────

    return (
        <div className={styles.exploreRoot}>
            <div className={styles.exploreHeader}>
                <div className={styles.subTabs}>
                    <button
                        type="button"
                        className={styles.subTab}
                        data-active={subTab === "explore" || undefined}
                        onClick={() => setSubTab("explore")}
                    >
                        Khám phá sổ tay
                    </button>
                    <button
                        type="button"
                        className={styles.subTab}
                        data-active={subTab === "favorites" || undefined}
                        onClick={() => setSubTab("favorites")}
                    >
                        <Heart size={13} />
                        Yêu thích
                        {totalLiked > 0 && <span className={styles.tabBadge}>{totalLiked}</span>}
                    </button>
                    <button
                        type="button"
                        className={styles.subTab}
                        data-active={subTab === "history" || undefined}
                        onClick={() => setSubTab("history")}
                    >
                        <Eye size={13} />
                        Đã xem
                        {viewedIds.length > 0 && <span className={styles.tabBadge}>{viewedIds.length}</span>}
                    </button>
                </div>
                <div className={styles.viewToggle}>
                    <button
                        type="button"
                        className={styles.viewBtn}
                        data-active={viewMode === "list" || undefined}
                        onClick={() => handleViewMode("list")}
                        title="Dạng danh sách"
                    >
                        <List size={15} />
                    </button>
                    <button
                        type="button"
                        className={styles.viewBtn}
                        data-active={viewMode === "grid" || undefined}
                        onClick={() => handleViewMode("grid")}
                        title="Dạng lưới"
                    >
                        <LayoutGrid size={15} />
                    </button>
                </div>
            </div>

            {subTab === "explore" && viewMode === "list" && (
                <ListView
                    onSelect={handleSelect}
                    likedIds={likedIds}
                    onToggleLike={toggleLike}
                    likedSectionIds={likedSectionIds}
                    onToggleLikeSection={toggleLikeSection}
                    sections={sections}
                    isLoading={isLoading}
                    error={error}
                />
            )}
            {subTab === "explore" && viewMode === "grid" && (
                <GridView
                    onSelectSection={setSelectedSection}
                    likedSectionIds={likedSectionIds}
                    onToggleLikeSection={toggleLikeSection}
                    sections={sections}
                    isLoading={isLoading}
                    error={error}
                />
            )}
            {subTab === "favorites" && (
                <FavoritesView
                    likedIds={likedIds}
                    onSelect={handleSelect}
                    onToggleLike={toggleLike}
                    likedSectionIds={likedSectionIds}
                    onToggleLikeSection={toggleLikeSection}
                    onSelectSection={(section) => {
                        setSelectedSection(section)
                        if (viewMode !== "grid") setViewMode("list")
                    }}
                    viewMode={viewMode}
                    sections={sections}
                    isLoading={isLoading}
                />
            )}
            {subTab === "history" && (
                <HistoryView
                    viewedIds={viewedIds}
                    onSelect={handleSelect}
                    likedIds={likedIds}
                    onToggleLike={toggleLike}
                    viewMode={viewMode}
                    sections={sections}
                    isLoading={isLoading}
                />
            )}
        </div>
    )
}
