"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import Link from "next/link"
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    Briefcase,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Eye,
    Flame,
    Heart,
    LayoutGrid,
    Layers,
    Library,
    List,
    Plus,
    X,
    Zap,
} from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useNotebooks } from "@/features/notebook/hooks/useNotebooks"
import { NOTEBOOK_ITEM_TYPE_LABELS } from "@/shared/constants/search-tabs"
import QuickLookupModal from "@/features/dictionary/quick-lookup/components/QuickLookupModal"
import { getQuickLookupTarget, type QuickLookupTarget } from "@/features/dictionary/quick-lookup/services/quick-lookup.service"
import type { EnrichedNotebookItem, ExploreSection, NotebookWithCount, PublicNotebook } from "@/domain/notebook/notebook.type"
import styles from "./ExploreTab.module.css"

// ── Fetchers ──────────────────────────────────────

async function fetchExploreSections(): Promise<ExploreSection[]> {
    const res = await fetch("/api/explore/notebooks")
    if (!res.ok) throw new Error("fetch failed")
    return res.json()
}

async function fetchPublicItems(notebookId: string): Promise<EnrichedNotebookItem[]> {
    const res = await fetch(`/api/explore/notebooks/${notebookId}/items`)
    if (!res.ok) throw new Error("fetch failed")
    return res.json()
}

// ── LocalStorage helpers ──────────────────────────

const LIKED_KEY = "yomi_explore_liked"
const LIKED_SECTIONS_KEY = "yomi_explore_liked_sections"
const VIEWED_KEY = "yomi_explore_viewed"

function loadLiked(): Set<string> {
    try {
        const v = localStorage.getItem(LIKED_KEY)
        return new Set(v ? (JSON.parse(v) as string[]) : [])
    } catch { return new Set() }
}

function saveLiked(ids: Set<string>) {
    try { localStorage.setItem(LIKED_KEY, JSON.stringify([...ids])) } catch {}
}

function loadLikedSections(): Set<string> {
    try {
        const v = localStorage.getItem(LIKED_SECTIONS_KEY)
        return new Set(v ? (JSON.parse(v) as string[]) : [])
    } catch { return new Set() }
}

function saveLikedSections(ids: Set<string>) {
    try { localStorage.setItem(LIKED_SECTIONS_KEY, JSON.stringify([...ids])) } catch {}
}

function loadViewed(): string[] {
    try {
        const v = localStorage.getItem(VIEWED_KEY)
        return v ? (JSON.parse(v) as string[]) : []
    } catch { return [] }
}

function saveViewed(ids: string[]) {
    try { localStorage.setItem(VIEWED_KEY, JSON.stringify(ids)) } catch {}
}

// ── Types ─────────────────────────────────────────

type SubTab = "explore" | "favorites" | "history"
type ViewMode = "list" | "grid"

// ── Card colors/icons ─────────────────────────────

const CARD_COLORS = [
    { bg: "#f5f3ff", text: "#7c3aed" },
    { bg: "#f0fdf4", text: "#16a34a" },
    { bg: "#fff7ed", text: "#ea580c" },
    { bg: "#eff6ff", text: "#2563eb" },
    { bg: "#fdf2f8", text: "#db2777" },
    { bg: "#f0fdfa", text: "#0d9488" },
]
const CARD_ICONS = [Briefcase, BookOpen, Layers, Zap, Flame, CheckCircle2]

// ── Sub-components ────────────────────────────────

function CategoryIcon({ category, size = 16 }: { category: string | null; size?: number }) {
    if (!category) return <BookOpen size={size} />
    if (category.includes("Theo đầu sách")) return <Library size={size} />
    if (category.includes("Mẹo thi")) return <Zap size={size} />
    if (category.includes("Ngữ pháp")) return <Layers size={size} />
    return <BookOpen size={size} />
}

// ── Exam tips ─────────────────────────────────────

const EXAM_TIPS = [
    {
        title: "Chiến lược làm bài Văn pháp (文法)",
        tips: [
            "Đọc toàn bộ câu trước khi chọn đáp án — ngữ pháp phụ thuộc vào ngữ cảnh.",
            "Chú ý từ nối trước và sau chỗ trống: て-form thường nối với động từ tiếp theo.",
            "Loại trừ các đáp án sai trước: tìm những lựa chọn không phù hợp về mặt ngữ pháp.",
            "Phân biệt các cặp dễ nhầm: ように vs ために, によって vs に対して.",
        ],
    },
    {
        title: "Chiến lược làm bài Từ vựng (語彙)",
        tips: [
            "Học từ theo nhóm nghĩa và đồng nghĩa/trái nghĩa để nhớ lâu hơn.",
            "Chú ý cách dùng của từ trong câu — nghĩa từ điển không đủ để làm bài.",
            "Từ Hán (漢語) thường xuất hiện trong văn viết; từ Yamato (和語) hay gặp trong hội thoại.",
            "Phân biệt 〜的 (tính chất) và 〜性 (khả năng/bản chất) trong từ ghép.",
        ],
    },
    {
        title: "Chiến lược làm bài Đọc hiểu (読解)",
        tips: [
            "Đọc câu hỏi TRƯỚC khi đọc bài — biết mình tìm gì giúp đọc có mục tiêu.",
            "Văn bản JLPT thường có cấu trúc: mở đề → phát triển → kết luận/quan điểm.",
            "Chú ý các từ đảo ngữ: しかし、ところが、それでも thường đánh dấu điểm quan trọng.",
            "Đáp án sai thường chứa thông tin đúng nhưng bị biến tấu — đối chiếu kỹ với bài gốc.",
        ],
    },
    {
        title: "Chiến lược làm bài Nghe (聴解)",
        tips: [
            "Trong lúc chờ bài nghe, đọc nhanh câu hỏi và các đáp án để chuẩn bị.",
            "Tập trung vào phần cuối hội thoại — câu trả lời thường nằm ở đây.",
            "Chú ý các cụm: じゃあ、それじゃ、では thường dẫn vào quyết định/kết luận.",
            "Luyện nghe phân biệt số, ngày tháng, địa điểm — loại thông tin phổ biến nhất.",
        ],
    },
]

function ExamTipsSection() {
    const [open, setOpen] = useState<number | null>(null)
    return (
        <section className={styles.tipsSection}>
            <h2 className={styles.sectionTitle}>
                <Zap size={16} />
                Mẹo làm bài thi JLPT
            </h2>
            <p className={styles.sectionDesc}>
                Chiến lược làm bài hiệu quả cho từng phần thi — được tổng hợp cho người học tiếng Nhật.
            </p>
            <div className={styles.accordionList}>
                {EXAM_TIPS.map((tip, i) => (
                    <div key={i} className={styles.accordionItem} data-open={open === i || undefined}>
                        <button
                            type="button"
                            className={styles.accordionHeader}
                            onClick={() => setOpen(open === i ? null : i)}
                        >
                            <span>{tip.title}</span>
                            <ChevronRight size={15} className={styles.accordionChevron} />
                        </button>
                        {open === i && (
                            <ul className={styles.accordionBody}>
                                {tip.tips.map((t, j) => (
                                    <li key={j} className={styles.tipItem}>
                                        <Check size={13} className={styles.tipCheck} />
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}

// ── Add-to-notebook modal ─────────────────────────

interface AddModalProps {
    items: EnrichedNotebookItem[]
    notebooks: NotebookWithCount[]
    onClose: () => void
}

function AddToNotebookModal({ items, notebooks, onClose }: AddModalProps) {
    const [selected, setSelected] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [addedCount, setAddedCount] = useState(0)

    async function handleAdd() {
        if (!selected) return
        setLoading(true)
        const results = await Promise.allSettled(
            items.map((item) =>
                fetch(`/api/notebooks/${selected}/items`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ item_type: item.item_type, item_id: item.item_id }),
                })
            )
        )
        const succeeded = results.filter((r) => r.status === "fulfilled" && (r.value as Response).ok).length
        setAddedCount(succeeded)
        setLoading(false)
        setDone(true)
    }

    const selectedNb = notebooks.find((nb) => nb.id === selected)

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <p className={styles.modalTitle}>Thêm vào sổ tay</p>
                    <button type="button" className={styles.modalClose} onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {done ? (
                    <div className={styles.modalDone}>
                        <Check size={28} className={styles.modalDoneIcon} />
                        <p className={styles.modalDoneTitle}>Đã thêm {addedCount}/{items.length} mục</p>
                        {selectedNb && (
                            <Link
                                href={`/notebooks/${selected}`}
                                className={styles.modalDoneLink}
                                onClick={onClose}
                            >
                                Xem sổ tay &ldquo;{selectedNb.name}&rdquo;
                                <ExternalLink size={12} />
                            </Link>
                        )}
                        <button type="button" className={styles.btnSecondary} onClick={onClose}>
                            Đóng
                        </button>
                    </div>
                ) : (
                    <>
                        <p className={styles.modalDesc}>
                            Chọn sổ tay cá nhân để thêm {items.length} mục từ bộ sưu tập này.
                        </p>
                        {notebooks.length === 0 ? (
                            <div className={styles.modalEmpty}>
                                <AlertCircle size={18} />
                                <p>Bạn chưa có sổ tay nào. Hãy tạo sổ tay trước.</p>
                                <Link href="/study?tab=so-tay" className={styles.btnPrimary} onClick={onClose}>
                                    Tạo sổ tay
                                </Link>
                            </div>
                        ) : (
                            <div className={styles.nbList}>
                                {notebooks.map((nb) => (
                                    <button
                                        key={nb.id}
                                        type="button"
                                        className={styles.nbOption}
                                        data-selected={selected === nb.id || undefined}
                                        onClick={() => setSelected(nb.id)}
                                    >
                                        <BookOpen size={14} />
                                        <span className={styles.nbOptionName}>{nb.name}</span>
                                        <span className={styles.nbOptionCount}>{nb.item_count} mục</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.btnSecondary} onClick={onClose}>
                                Hủy
                            </button>
                            <button
                                type="button"
                                className={styles.btnPrimary}
                                disabled={!selected || loading}
                                onClick={handleAdd}
                            >
                                {loading ? "Đang thêm…" : "Thêm vào sổ tay"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

// ── Detail view ───────────────────────────────────

interface DetailViewProps {
    notebook: PublicNotebook
    onBack: () => void
}

function DetailView({ notebook, onBack }: DetailViewProps) {
    const { data: items, isLoading } = useSWR<EnrichedNotebookItem[]>(
        `/explore/notebooks/${notebook.id}/items`,
        () => fetchPublicItems(notebook.id),
        { revalidateOnFocus: false, dedupingInterval: 300_000 }
    )
    const { user } = useAuth()
    const { notebooks } = useNotebooks(!!user)
    const [showModal, setShowModal] = useState(false)
    const [quickOpen, setQuickOpen] = useState(false)
    const [quickTarget, setQuickTarget] = useState<QuickLookupTarget | null>(null)
    const [quickLoadingWord, setQuickLoadingWord] = useState<string | null>(null)

    async function handleOpenItem(item: EnrichedNotebookItem) {
        setQuickTarget(null)
        setQuickLoadingWord(item.display.title)
        setQuickOpen(true)
        const vocabularyId = item.item_type === "vocabulary" ? parseInt(item.item_id, 10) : undefined
        const result = await getQuickLookupTarget(item.display.title, "vi", vocabularyId)
        setQuickTarget(result)
        setQuickLoadingWord(null)
    }

    function handleCloseQuick() {
        setQuickOpen(false)
        setQuickTarget(null)
        setQuickLoadingWord(null)
    }

    return (
        <div className={styles.detailView}>
            <button type="button" className={styles.backBtn} onClick={onBack}>
                <ArrowLeft size={15} />
                Quay lại
            </button>

            <div className={styles.detailHeader}>
                <div>
                    {notebook.public_category && (
                        <span className={styles.categoryBadge}>{notebook.public_category}</span>
                    )}
                    <h2 className={styles.detailTitle}>{notebook.name}</h2>
                    {notebook.public_description && (
                        <p className={styles.detailDesc}>{notebook.public_description}</p>
                    )}
                    <p className={styles.detailCount}>{notebook.item_count.toLocaleString("vi-VN")} mục</p>
                </div>
                {user && (
                    <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={() => setShowModal(true)}
                        disabled={!items || items.length === 0}
                    >
                        <Plus size={14} />
                        Thêm vào sổ tay của tôi
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className={styles.itemSkeleton}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={styles.itemSkeletonRow} />
                    ))}
                </div>
            ) : !items || items.length === 0 ? (
                <div className={styles.emptyItems}>
                    <BookOpen size={32} />
                    <p>Sổ tay này chưa có mục nào.</p>
                </div>
            ) : (
                <ul className={styles.exploreItemGrid}>
                    {items.map((item) => (
                        <li key={item.id} className={styles.exploreItemCard}>
                            {item.item_type === "vocabulary" ? (
                                <button
                                    type="button"
                                    className={styles.exploreItemLink}
                                    onClick={() => handleOpenItem(item)}
                                >
                                    <span className={styles.exploreTypeBadge} data-type={item.item_type}>
                                        {NOTEBOOK_ITEM_TYPE_LABELS[item.item_type]}
                                    </span>
                                    <span className={styles.exploreItemTitle}>{item.display.title}</span>
                                    {item.display.subtitle && (
                                        <span className={styles.exploreItemSubtitle}>{item.display.subtitle}</span>
                                    )}
                                    {item.display.meaning && (
                                        <span className={styles.exploreItemMeaning}>{item.display.meaning}</span>
                                    )}
                                </button>
                            ) : (
                                <Link href={item.display.href} className={styles.exploreItemLink}>
                                    <span className={styles.exploreTypeBadge} data-type={item.item_type}>
                                        {NOTEBOOK_ITEM_TYPE_LABELS[item.item_type]}
                                    </span>
                                    <span className={styles.exploreItemTitle}>{item.display.title}</span>
                                    {item.display.subtitle && (
                                        <span className={styles.exploreItemSubtitle}>{item.display.subtitle}</span>
                                    )}
                                    {item.display.meaning && (
                                        <span className={styles.exploreItemMeaning}>{item.display.meaning}</span>
                                    )}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <QuickLookupModal
                open={quickOpen}
                target={quickTarget}
                loadingTitle={quickLoadingWord ?? undefined}
                onClose={handleCloseQuick}
            />

            {!user && (
                <div className={styles.authPrompt}>
                    <p>Đăng nhập để thêm mục vào sổ tay cá nhân của bạn.</p>
                    <Link href="/login" className={styles.btnPrimary}>Đăng nhập</Link>
                </div>
            )}

            {showModal && items && (
                <AddToNotebookModal
                    items={items}
                    notebooks={notebooks}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    )
}

// ── NotebookCard (list view) ──────────────────────

interface CardProps {
    notebook: PublicNotebook
    index: number
    liked: boolean
    onToggleLike: (e: React.MouseEvent) => void
    onClick: () => void
}

function NotebookCard({ notebook, index, liked, onToggleLike, onClick }: CardProps) {
    const color = CARD_COLORS[index % CARD_COLORS.length]
    const Icon = CARD_ICONS[index % CARD_ICONS.length]

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

function GridCard({ notebook, index, liked, onToggleLike, onClick }: CardProps) {
    const color = CARD_COLORS[index % CARD_COLORS.length]
    const Icon = CARD_ICONS[index % CARD_ICONS.length]

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

// ── SectionBlock ──────────────────────────────────

function SectionBlock({
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
    const nb = section.notebooks
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

// ── SectionCard (grid) ───────────────────────────

function SectionCard({
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
    const Icon = CARD_ICONS[index % CARD_ICONS.length]

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

// ── GridView — shows sections as cards ───────────

function GridView({
    onSelectSection,
    likedSectionIds,
    onToggleLikeSection,
}: {
    onSelectSection: (section: ExploreSection) => void
    likedSectionIds: Set<string>
    onToggleLikeSection: (id: string, e: React.MouseEvent) => void
}) {
    const { data: sections, isLoading, error } = useSWR<ExploreSection[]>(
        "/explore/notebooks",
        fetchExploreSections,
        { revalidateOnFocus: false, dedupingInterval: 300_000 }
    )

    if (isLoading) {
        return (
            <div className={styles.gridContainer}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className={styles.gridSkeleton} />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.errorState}>
                <AlertCircle size={18} />
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

// ── SectionDetailGrid — notebooks inside a section

function SectionDetailGrid({
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
                <ArrowLeft size={15} />
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

// ── ListView ──────────────────────────────────────

function ListView({
    onSelect,
    likedIds,
    onToggleLike,
    likedSectionIds,
    onToggleLikeSection,
}: {
    onSelect: (nb: PublicNotebook) => void
    likedIds: Set<string>
    onToggleLike: (id: string, e: React.MouseEvent) => void
    likedSectionIds: Set<string>
    onToggleLikeSection: (id: string, e: React.MouseEvent) => void
}) {
    const { data: sections, isLoading, error } = useSWR<ExploreSection[]>(
        "/explore/notebooks",
        fetchExploreSections,
        { revalidateOnFocus: false, dedupingInterval: 300_000 }
    )

    return (
        <div className={styles.listView}>
            {isLoading && (
                <div className={styles.skeletonGrid}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={styles.skeletonCard} />
                    ))}
                </div>
            )}

            {error && (
                <div className={styles.errorState}>
                    <AlertCircle size={18} />
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

// ── Shared sub-page grid/list renderer ───────────

function NotebookSubGrid({
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
    viewMode: ViewMode
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

// ── FavoritesView ─────────────────────────────────

function FavoritesView({
    likedIds,
    onSelect,
    onToggleLike,
    likedSectionIds,
    onToggleLikeSection,
    onSelectSection,
    viewMode,
}: {
    likedIds: Set<string>
    onSelect: (nb: PublicNotebook) => void
    onToggleLike: (id: string, e: React.MouseEvent) => void
    likedSectionIds: Set<string>
    onToggleLikeSection: (id: string, e: React.MouseEvent) => void
    onSelectSection: (section: ExploreSection) => void
    viewMode: ViewMode
}) {
    const { data: sections, isLoading } = useSWR<ExploreSection[]>(
        "/explore/notebooks",
        fetchExploreSections,
        { revalidateOnFocus: false, dedupingInterval: 300_000 }
    )

    const likedSections = useMemo(
        () => (sections ?? []).filter((s) => likedSectionIds.has(s.id)),
        [sections, likedSectionIds]
    )

    const favoriteNotebooks = useMemo(
        () => (sections ?? []).flatMap((s) => s.notebooks).filter((nb) => likedIds.has(nb.id)),
        [sections, likedIds]
    )

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
                                const Icon = CARD_ICONS[i % CARD_ICONS.length]
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

function HistoryView({
    viewedIds,
    onSelect,
    likedIds,
    onToggleLike,
    viewMode,
}: {
    viewedIds: string[]
    onSelect: (nb: PublicNotebook) => void
    likedIds: Set<string>
    onToggleLike: (id: string, e: React.MouseEvent) => void
    viewMode: ViewMode
}) {
    const { data: sections, isLoading } = useSWR<ExploreSection[]>(
        "/explore/notebooks",
        fetchExploreSections,
        { revalidateOnFocus: false, dedupingInterval: 300_000 }
    )

    const notebookMap = useMemo(
        () => new Map((sections ?? []).flatMap((s) => s.notebooks).map((nb) => [nb.id, nb])),
        [sections]
    )

    const history = useMemo(
        () => viewedIds.map((id) => notebookMap.get(id)).filter(Boolean) as PublicNotebook[],
        [viewedIds, notebookMap]
    )

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
                <Eye size={32} />
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

// ── Main export ───────────────────────────────────

export default function ExploreTab() {
    const [subTab, setSubTab] = useState<SubTab>("explore")
    const [viewMode, setViewMode] = useState<ViewMode>("list")
    const [selected, setSelected] = useState<PublicNotebook | null>(null)
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

    function toggleLike(id: string, e: React.MouseEvent) {
        e.stopPropagation()
        const next = new Set(likedIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        saveLiked(next)
        setLikedIds(next)
    }

    function toggleLikeSection(id: string, e: React.MouseEvent) {
        e.stopPropagation()
        const next = new Set(likedSectionIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        saveLikedSections(next)
        setLikedSectionIds(next)
    }

    function handleSelect(nb: PublicNotebook) {
        const next = [nb.id, ...viewedIds.filter((i) => i !== nb.id)].slice(0, 50)
        saveViewed(next)
        setViewedIds(next)
        setSelected(nb)
    }

    function handleViewMode(mode: ViewMode) {
        setViewMode(mode)
        setSelectedSection(null)
    }

    const totalLiked = likedIds.size + likedSectionIds.size

    if (selected) {
        return <DetailView notebook={selected} onBack={() => setSelected(null)} />
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
                        {totalLiked > 0 && (
                            <span className={styles.tabBadge}>{totalLiked}</span>
                        )}
                    </button>
                    <button
                        type="button"
                        className={styles.subTab}
                        data-active={subTab === "history" || undefined}
                        onClick={() => setSubTab("history")}
                    >
                        <Eye size={13} />
                        Đã xem
                        {viewedIds.length > 0 && (
                            <span className={styles.tabBadge}>{viewedIds.length}</span>
                        )}
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
                />
            )}
            {subTab === "explore" && viewMode === "grid" && (
                <GridView
                    onSelectSection={setSelectedSection}
                    likedSectionIds={likedSectionIds}
                    onToggleLikeSection={toggleLikeSection}
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
                />
            )}
            {subTab === "history" && (
                <HistoryView
                    viewedIds={viewedIds}
                    onSelect={handleSelect}
                    likedIds={likedIds}
                    onToggleLike={toggleLike}
                    viewMode={viewMode}
                />
            )}
        </div>
    )
}
