"use client"

import { useState } from "react"
import { BookOpen, ChevronDown, ChevronRight, Heart, Library, Zap, Layers } from "lucide-react"
import type { ExploreSection, PublicNotebook } from "@/domain/notebook/notebook.type"
import { CARD_COLORS, CARD_ICONS } from "./explore-utils"
import ExamTipsSection from "./ExamTipsSection"
import styles from "./ExploreTab.module.css"

// ── Category icon ─────────────────────────────────

export function CategoryIcon({ category, size = 16 }: { category: string | null; size?: number }) {
    if (!category) return <BookOpen size={size} />
    if (category.includes("Theo đầu sách")) return <Library size={size} />
    if (category.includes("Mẹo thi"))        return <Zap     size={size} />
    if (category.includes("Ngữ pháp"))       return <Layers  size={size} />
    return <BookOpen size={size} />
}

// ── Card props ────────────────────────────────────

export interface CardProps {
    notebook: PublicNotebook
    index: number
    liked: boolean
    onToggleLike: (e: React.MouseEvent) => void
    onClick: () => void
}

// ── NotebookCard (list view) ──────────────────────

export function NotebookCard({ notebook, index, liked, onToggleLike, onClick }: CardProps) {
    const color = CARD_COLORS[index % CARD_COLORS.length]
    const Icon  = CARD_ICONS[index  % CARD_ICONS.length]

    return (
        <div className={styles.nbCard}>
            <button type="button" className={styles.nbCardMain} onClick={onClick}>
                <div className={styles.nbCardIcon} style={{ background: color.bg }}>
                    <Icon size={20} style={{ color: color.text }} />
                </div>
                <div className={styles.nbCardBody}>
                    <p className={styles.nbCardName}>{notebook.name}</p>
                    <p className={styles.nbCardCount}>{notebook.item_count.toLocaleString("vi-VN")} mục</p>
                </div>
                <ChevronRight size={15} className={styles.nbCardChevron} />
            </button>
            <button
                type="button"
                className={styles.nbCardLike}
                onClick={onToggleLike}
                data-liked={liked || undefined}
                title={liked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
            >
                <Heart size={14} />
            </button>
        </div>
    )
}

// ── GridCard ──────────────────────────────────────

export function GridCard({ notebook, index, liked, onToggleLike, onClick }: CardProps) {
    const color = CARD_COLORS[index % CARD_COLORS.length]
    const Icon  = CARD_ICONS[index  % CARD_ICONS.length]

    return (
        <div
            className={styles.gridCard}
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => e.key === "Enter" && onClick()}
        >
            <div className={styles.gridCardTop}>
                <div className={styles.gridCardIcon} style={{ background: color.bg }}>
                    <Icon size={22} style={{ color: color.text }} />
                </div>
                <button
                    type="button"
                    className={styles.gridCardLike}
                    onClick={(e) => { e.stopPropagation(); onToggleLike(e) }}
                    data-liked={liked || undefined}
                    title={liked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                >
                    <Heart size={15} />
                </button>
            </div>
            <p className={styles.gridCardTitle}>{notebook.name}</p>
            <div className={styles.gridCardFooter}>
                <span className={styles.gridCardCount}>{notebook.item_count.toLocaleString("vi-VN")} mục</span>
                {notebook.public_category && (
                    <span className={styles.gridCardCat}>{notebook.public_category}</span>
                )}
            </div>
        </div>
    )
}

// ── SectionCard (grid view) ───────────────────────

export function SectionCard({
    section,
    index,
    liked,
    onToggleLike,
    onClick,
}: {
    section: ExploreSection
    index: number
    liked: boolean
    onToggleLike: (e: React.MouseEvent) => void
    onClick: () => void
}) {
    const color = CARD_COLORS[index % CARD_COLORS.length]
    const Icon  = CARD_ICONS[index  % CARD_ICONS.length]

    return (
        <div
            className={styles.gridCard}
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => e.key === "Enter" && onClick()}
        >
            <div className={styles.gridCardTop}>
                <div className={styles.gridCardIcon} style={{ background: color.bg }}>
                    <Icon size={22} style={{ color: color.text }} />
                </div>
                <button
                    type="button"
                    className={styles.gridCardLike}
                    onClick={(e) => { e.stopPropagation(); onToggleLike(e) }}
                    data-liked={liked || undefined}
                    title={liked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                >
                    <Heart size={15} />
                </button>
            </div>
            <p className={styles.gridCardTitle}>{section.name}</p>
            {section.description && (
                <p className={styles.sectionCardDesc}>{section.description}</p>
            )}
            <div className={styles.gridCardFooter}>
                <span className={styles.gridCardCount}>{section.notebooks.length} sổ tay</span>
            </div>
        </div>
    )
}

// ── SectionBlock (list view, collapsible) ─────────

export function SectionBlock({
    section,
    onSelect,
    likedIds,
    onToggleLike,
    likedSectionIds,
    onToggleLikeSection,
}: {
    section: ExploreSection
    onSelect: (nb: PublicNotebook) => void
    likedIds: Set<string>
    onToggleLike: (id: string, e: React.MouseEvent) => void
    likedSectionIds: Set<string>
    onToggleLikeSection: (id: string, e: React.MouseEvent) => void
}) {
    const [open, setOpen] = useState(true)
    const nb           = section.notebooks
    const sectionLiked = likedSectionIds.has(section.id)

    return (
        <section className={styles.categorySection}>
            <div className={styles.sectionHeader}>
                <button
                    type="button"
                    className={styles.sectionToggle}
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                >
                    {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <CategoryIcon category={section.type === "group" ? "Theo đầu sách" : section.name} size={14} />
                    <span className={styles.sectionTitle}>{section.name}</span>
                    <span className={styles.sectionCount}>{nb.length} sổ tay</span>
                </button>
                <button
                    type="button"
                    className={styles.sectionLikeBtn}
                    onClick={(e) => onToggleLikeSection(section.id, e)}
                    data-liked={sectionLiked || undefined}
                    title={sectionLiked ? "Bỏ yêu thích mục" : "Yêu thích mục này"}
                >
                    <Heart size={14} />
                </button>
            </div>
            {section.description && (
                <p className={styles.sectionDesc}>{section.description}</p>
            )}
            {open && (
                <div className={styles.notebookGrid}>
                    {nb.map((n, i) => (
                        <NotebookCard
                            key={n.id}
                            notebook={n}
                            index={i}
                            liked={likedIds.has(n.id)}
                            onToggleLike={(e) => onToggleLike(n.id, e)}
                            onClick={() => onSelect(n)}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

// ── SectionDetailGrid ─────────────────────────────

export function SectionDetailGrid({
    section,
    onBack,
    onSelect,
    likedIds,
    onToggleLike,
}: {
    section: ExploreSection
    onBack: () => void
    onSelect: (nb: PublicNotebook) => void
    likedIds: Set<string>
    onToggleLike: (id: string, e: React.MouseEvent) => void
}) {
    return (
        <div className={styles.detailView}>
            <button type="button" className={styles.backBtn} onClick={onBack}>
                <ChevronRight size={15} style={{ transform: "rotate(180deg)" }} />
                Quay lại
            </button>
            <div>
                <h2 className={styles.detailTitle}>{section.name}</h2>
                {section.description && (
                    <p className={styles.detailDesc}>{section.description}</p>
                )}
                <p className={styles.detailCount}>{section.notebooks.length} sổ tay</p>
            </div>
            {section.notebooks.length === 0 ? (
                <div className={styles.emptyItems}>
                    <BookOpen size={32} />
                    <p>Chưa có sổ tay nào.</p>
                </div>
            ) : (
                <div className={styles.gridContainer}>
                    {section.notebooks.map((nb, i) => (
                        <GridCard
                            key={nb.id}
                            notebook={nb}
                            index={i}
                            liked={likedIds.has(nb.id)}
                            onToggleLike={(e) => onToggleLike(nb.id, e)}
                            onClick={() => onSelect(nb)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// ── NotebookSubGrid ───────────────────────────────

export function NotebookSubGrid({
    notebooks,
    likedIds,
    onSelect,
    onToggleLike,
    viewMode,
}: {
    notebooks: PublicNotebook[]
    likedIds: Set<string>
    onSelect: (nb: PublicNotebook) => void
    onToggleLike: (id: string, e: React.MouseEvent) => void
    viewMode: "list" | "grid"
}) {
    if (viewMode === "grid") {
        return (
            <div className={styles.gridContainer}>
                {notebooks.map((nb, i) => (
                    <GridCard
                        key={nb.id}
                        notebook={nb}
                        index={i}
                        liked={likedIds.has(nb.id)}
                        onToggleLike={(e) => onToggleLike(nb.id, e)}
                        onClick={() => onSelect(nb)}
                    />
                ))}
            </div>
        )
    }
    return (
        <div className={styles.notebookGrid}>
            {notebooks.map((nb, i) => (
                <NotebookCard
                    key={nb.id}
                    notebook={nb}
                    index={i}
                    liked={likedIds.has(nb.id)}
                    onToggleLike={(e) => onToggleLike(nb.id, e)}
                    onClick={() => onSelect(nb)}
                />
            ))}
        </div>
    )
}

// ── ListView ──────────────────────────────────────

export function ListView({
    onSelect,
    likedIds,
    onToggleLike,
    likedSectionIds,
    onToggleLikeSection,
    sections,
    isLoading,
    error,
}: {
    onSelect: (nb: PublicNotebook) => void
    likedIds: Set<string>
    onToggleLike: (id: string, e: React.MouseEvent) => void
    likedSectionIds: Set<string>
    onToggleLikeSection: (id: string, e: React.MouseEvent) => void
    sections: ExploreSection[] | undefined
    isLoading: boolean
    error: unknown
}) {
    return (
        <div className={styles.listView}>
            {isLoading && (
                <div className={styles.skeletonGrid}>
                    {[1, 2, 3, 4].map((i) => <div key={i} className={styles.skeletonCard} />)}
                </div>
            )}
            {!!error && (
                <div className={styles.errorState}>
                    <p>Không thể tải sổ tay. Vui lòng thử lại.</p>
                </div>
            )}
            {!isLoading && !error && (!sections || sections.length === 0) && (
                <div className={styles.emptyState}>
                    <Library size={32} />
                    <p>Chưa có sổ tay nào được công khai.</p>
                </div>
            )}
            {(sections ?? []).map((section) => (
                <SectionBlock
                    key={section.id}
                    section={section}
                    onSelect={onSelect}
                    likedIds={likedIds}
                    onToggleLike={onToggleLike}
                    likedSectionIds={likedSectionIds}
                    onToggleLikeSection={onToggleLikeSection}
                />
            ))}
            {!isLoading && <ExamTipsSection />}
        </div>
    )
}

// ── GridView ──────────────────────────────────────

export function GridView({
    onSelectSection,
    likedSectionIds,
    onToggleLikeSection,
    sections,
    isLoading,
    error,
}: {
    onSelectSection: (section: ExploreSection) => void
    likedSectionIds: Set<string>
    onToggleLikeSection: (id: string, e: React.MouseEvent) => void
    sections: ExploreSection[] | undefined
    isLoading: boolean
    error: unknown
}) {
    if (isLoading) {
        return (
            <div className={styles.gridContainer}>
                {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className={styles.gridSkeleton} />)}
            </div>
        )
    }
    if (error) {
        return (
            <div className={styles.errorState}>
                <p>Không thể tải sổ tay. Vui lòng thử lại.</p>
            </div>
        )
    }
    if (!sections?.length) {
        return (
            <div className={styles.emptyState}>
                <Library size={32} />
                <p>Chưa có sổ tay nào được công khai.</p>
            </div>
        )
    }
    return (
        <div className={styles.gridContainer}>
            {sections.map((section, i) => (
                <SectionCard
                    key={section.id}
                    section={section}
                    index={i}
                    liked={likedSectionIds.has(section.id)}
                    onToggleLike={(e) => onToggleLikeSection(section.id, e)}
                    onClick={() => onSelectSection(section)}
                />
            ))}
        </div>
    )
}

// ── FavoritesView ─────────────────────────────────

export function FavoritesView({
    likedIds,
    onSelect,
    onToggleLike,
    likedSectionIds,
    onToggleLikeSection,
    onSelectSection,
    viewMode,
    sections,
    isLoading,
}: {
    likedIds: Set<string>
    onSelect: (nb: PublicNotebook) => void
    onToggleLike: (id: string, e: React.MouseEvent) => void
    likedSectionIds: Set<string>
    onToggleLikeSection: (id: string, e: React.MouseEvent) => void
    onSelectSection: (section: ExploreSection) => void
    viewMode: "list" | "grid"
    sections: ExploreSection[] | undefined
    isLoading: boolean
}) {
    const likedSections     = (sections ?? []).filter((s) => likedSectionIds.has(s.id))
    const favoriteNotebooks = (sections ?? []).flatMap((s) => s.notebooks).filter((nb) => likedIds.has(nb.id))
    const hasAny = likedSections.length > 0 || favoriteNotebooks.length > 0

    if (isLoading) {
        return (
            <div className={styles.skeletonGrid}>
                {[1, 2, 3].map((i) => <div key={i} className={styles.skeletonCard} />)}
            </div>
        )
    }

    if (!hasAny) {
        return (
            <div className={styles.emptyState}>
                <Heart size={32} />
                <p>Bạn chưa yêu thích sổ tay nào.</p>
                <p className={styles.emptyHint}>Nhấn ♡ trên bất kỳ mục nào để lưu vào đây.</p>
            </div>
        )
    }

    return (
        <div className={styles.listView}>
            {likedSections.length > 0 && (
                <div className={styles.categorySection}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionToggle} style={{ cursor: "default" }}>
                            <Heart size={14} />
                            <span className={styles.sectionTitle}>Mục yêu thích</span>
                            <span className={styles.sectionCount}>{likedSections.length} mục</span>
                        </span>
                    </div>
                    {viewMode === "grid" ? (
                        <div className={styles.gridContainer} style={{ paddingBottom: 0 }}>
                            {likedSections.map((section, i) => (
                                <SectionCard
                                    key={section.id}
                                    section={section}
                                    index={i}
                                    liked
                                    onToggleLike={(e) => onToggleLikeSection(section.id, e)}
                                    onClick={() => onSelectSection(section)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.notebookGrid}>
                            {likedSections.map((section, i) => {
                                const color = CARD_COLORS[i % CARD_COLORS.length]
                                const Icon  = CARD_ICONS[i  % CARD_ICONS.length]
                                return (
                                    <div key={section.id} className={styles.nbCard}>
                                        <button type="button" className={styles.nbCardMain} onClick={() => onSelectSection(section)}>
                                            <div className={styles.nbCardIcon} style={{ background: color.bg }}>
                                                <Icon size={20} style={{ color: color.text }} />
                                            </div>
                                            <div className={styles.nbCardBody}>
                                                <p className={styles.nbCardName}>{section.name}</p>
                                                <p className={styles.nbCardCount}>{section.notebooks.length} sổ tay</p>
                                            </div>
                                            <ChevronRight size={15} className={styles.nbCardChevron} />
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.nbCardLike}
                                            onClick={(e) => onToggleLikeSection(section.id, e)}
                                            data-liked
                                            title="Bỏ yêu thích"
                                        >
                                            <Heart size={14} />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {favoriteNotebooks.length > 0 && (
                <div className={styles.categorySection}>
                    {likedSections.length > 0 && (
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionToggle} style={{ cursor: "default" }}>
                                <BookOpen size={14} />
                                <span className={styles.sectionTitle}>Sổ tay yêu thích</span>
                                <span className={styles.sectionCount}>{favoriteNotebooks.length} sổ tay</span>
                            </span>
                        </div>
                    )}
                    <NotebookSubGrid
                        notebooks={favoriteNotebooks}
                        likedIds={likedIds}
                        onSelect={onSelect}
                        onToggleLike={onToggleLike}
                        viewMode={viewMode}
                    />
                </div>
            )}
        </div>
    )
}

// ── HistoryView ───────────────────────────────────

export function HistoryView({
    viewedIds,
    onSelect,
    likedIds,
    onToggleLike,
    viewMode,
    sections,
    isLoading,
}: {
    viewedIds: string[]
    onSelect: (nb: PublicNotebook) => void
    likedIds: Set<string>
    onToggleLike: (id: string, e: React.MouseEvent) => void
    viewMode: "list" | "grid"
    sections: ExploreSection[] | undefined
    isLoading: boolean
}) {
    const notebookMap = new Map((sections ?? []).flatMap((s) => s.notebooks).map((nb) => [nb.id, nb]))
    const history = viewedIds.map((id) => notebookMap.get(id)).filter(Boolean) as PublicNotebook[]

    if (isLoading) {
        return (
            <div className={styles.skeletonGrid}>
                {[1, 2, 3].map((i) => <div key={i} className={styles.skeletonCard} />)}
            </div>
        )
    }

    if (!history.length) {
        return (
            <div className={styles.emptyState}>
                <BookOpen size={32} />
                <p>Bạn chưa xem sổ tay nào.</p>
                <p className={styles.emptyHint}>Sổ tay bạn đã mở sẽ xuất hiện ở đây.</p>
            </div>
        )
    }

    return (
        <NotebookSubGrid
            notebooks={history}
            likedIds={likedIds}
            onSelect={onSelect}
            onToggleLike={onToggleLike}
            viewMode={viewMode}
        />
    )
}
