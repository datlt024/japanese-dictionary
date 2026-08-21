"use client"

import { useMemo, useState } from "react"
import { Eye, Heart, LayoutGrid, List, Lock } from "lucide-react"
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
import { useAuth } from "@/shared/hooks/useAuth"
import AuthModal from "@/shared/components/AuthModal"
import styles from "./ExploreTab.module.css"

export default function ExploreTab() {
    const { user } = useAuth()
    const userId = user?.id
    const [authModalOpen,   setAuthModalOpen]   = useState(false)
    const [subTab,          setSubTab]          = useState<SubTab>("explore")
    const [viewMode,        setViewMode]        = useState<ViewMode>("list")
    const [selected,        setSelected]        = useState<PublicNotebook | null>(null)
    const [selectedSection, setSelectedSection] = useState<ExploreSection | null>(null)

    const [trackedUserId, setTrackedUserId] = useState<string | undefined>(userId)
    const [exploreData, setExploreData] = useState<{
        likedIds: Set<string>
        likedSectionIds: Set<string>
        viewedIds: string[]
    }>({ likedIds: new Set(), likedSectionIds: new Set(), viewedIds: [] })

    // Reload per-account data from localStorage when the user changes.
    // Calling setState during render (with a guard) is the React-recommended
    // pattern for resetting derived state when an upstream value changes.
    if (trackedUserId !== userId) {
        setTrackedUserId(userId)
        setExploreData({
            likedIds: typeof window !== "undefined" ? loadLiked(userId) : new Set(),
            likedSectionIds: typeof window !== "undefined" ? loadLikedSections(userId) : new Set(),
            viewedIds: typeof window !== "undefined" ? loadViewed(userId) : [],
        })
    }

    const { likedIds, likedSectionIds, viewedIds } = exploreData

    // Single SWR call — all sub-views read from this cache
    const { data: sections, isLoading, error } = useSWR<ExploreSection[]>(
        "/explore/notebooks",
        fetchExploreSections,
        { revalidateOnFocus: true, dedupingInterval: 10_000 }
    )

    const totalLiked = useMemo(() => likedIds.size + likedSectionIds.size, [likedIds, likedSectionIds])

    function toggleLike(id: string, e: React.MouseEvent) {
        e.stopPropagation()
        const next = new Set(likedIds)
        if (next.has(id)) next.delete(id); else next.add(id)
        saveLiked(next, userId)
        setExploreData((prev) => ({ ...prev, likedIds: next }))
    }

    function toggleLikeSection(id: string, e: React.MouseEvent) {
        e.stopPropagation()
        const next = new Set(likedSectionIds)
        if (next.has(id)) next.delete(id); else next.add(id)
        saveLikedSections(next, userId)
        setExploreData((prev) => ({ ...prev, likedSectionIds: next }))
    }

    function handleSelect(nb: PublicNotebook) {
        const next = [nb.id, ...viewedIds.filter((i) => i !== nb.id)].slice(0, 50)
        saveViewed(next, userId)
        setExploreData((prev) => ({ ...prev, viewedIds: next }))
        setSelected(nb)
    }

    function handleViewMode(mode: ViewMode) {
        setViewMode(mode); setSelectedSection(null)
    }

    function handleSubTabClick(tab: SubTab) {
        if ((tab === "favorites" || tab === "history") && !user) {
            setAuthModalOpen(true)
            return
        }
        setSubTab(tab)
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
                        onClick={() => handleSubTabClick("explore")}
                    >
                        Khám phá sổ tay
                    </button>
                    <button
                        type="button"
                        className={styles.subTab}
                        data-active={subTab === "favorites" || undefined}
                        onClick={() => handleSubTabClick("favorites")}
                    >
                        <Heart size={13} />
                        Yêu thích
                        {user && totalLiked > 0 && <span className={styles.tabBadge}>{totalLiked}</span>}
                        {!user && <Lock size={11} className={styles.tabLock} />}
                    </button>
                    <button
                        type="button"
                        className={styles.subTab}
                        data-active={subTab === "history" || undefined}
                        onClick={() => handleSubTabClick("history")}
                    >
                        <Eye size={13} />
                        Đã xem
                        {user && viewedIds.length > 0 && <span className={styles.tabBadge}>{viewedIds.length}</span>}
                        {!user && <Lock size={11} className={styles.tabLock} />}
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
            <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </div>
    )
}
