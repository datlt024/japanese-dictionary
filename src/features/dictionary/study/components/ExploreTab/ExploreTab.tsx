"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import {
    ArrowLeft,
    BookOpen,
    ChevronRight,
    Layers,
    Library,
    Plus,
    Zap,
    X,
    Check,
    AlertCircle,
    ExternalLink,
} from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useNotebooks } from "@/features/notebook/hooks/useNotebooks"
import type { EnrichedNotebookItem, NotebookWithCount, PublicNotebook } from "@/domain/notebook/notebook.type"
import styles from "./ExploreTab.module.css"

// ── Fetchers ──────────────────────────────────────

async function fetchPublicNotebooks(): Promise<PublicNotebook[]> {
    const res = await fetch("/api/explore/notebooks")
    if (!res.ok) throw new Error("fetch failed")
    return res.json()
}

async function fetchPublicItems(notebookId: string): Promise<EnrichedNotebookItem[]> {
    const res = await fetch(`/api/explore/notebooks/${notebookId}/items`)
    if (!res.ok) throw new Error("fetch failed")
    return res.json()
}

// ── Sub-components ────────────────────────────────

function CategoryIcon({ category, size = 16 }: { category: string | null; size?: number }) {
    if (!category) return <BookOpen size={size} />
    if (category.includes("Theo đầu sách")) return <Library size={size} />
    if (category.includes("Mẹo thi")) return <Zap size={size} />
    if (category.includes("Ngữ pháp")) return <Layers size={size} />
    return <BookOpen size={size} />
}

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
        { revalidateOnFocus: false }
    )
    const { user } = useAuth()
    const { notebooks } = useNotebooks(!!user)
    const [showModal, setShowModal] = useState(false)

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
                <div className={styles.itemList}>
                    {items.map((item) => (
                        <Link key={item.id} href={item.display.href} className={styles.itemRow}>
                            <div className={styles.itemMain}>
                                <span className={styles.itemTitle}>{item.display.title}</span>
                                {item.display.subtitle && (
                                    <span className={styles.itemSub}>{item.display.subtitle}</span>
                                )}
                            </div>
                            {item.display.meaning && (
                                <span className={styles.itemMeaning}>{item.display.meaning}</span>
                            )}
                            <ExternalLink size={12} className={styles.itemArrow} />
                        </Link>
                    ))}
                </div>
            )}

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

// ── List view ─────────────────────────────────────

function NotebookCard({
    notebook,
    onClick,
}: {
    notebook: PublicNotebook
    onClick: () => void
}) {
    return (
        <button type="button" className={styles.notebookCard} onClick={onClick}>
            <div className={styles.cardIconWrap}>
                <CategoryIcon category={notebook.public_category} size={18} />
            </div>
            <div className={styles.cardBody}>
                <p className={styles.cardName}>{notebook.name}</p>
                {notebook.public_description && (
                    <p className={styles.cardDesc}>{notebook.public_description}</p>
                )}
                <p className={styles.cardCount}>{notebook.item_count.toLocaleString("vi-VN")} mục</p>
            </div>
            <ChevronRight size={14} className={styles.cardChevron} />
        </button>
    )
}

function ListView({ onSelect }: { onSelect: (nb: PublicNotebook) => void }) {
    const { data, isLoading, error } = useSWR<PublicNotebook[]>(
        "/explore/notebooks",
        fetchPublicNotebooks,
        { revalidateOnFocus: false }
    )

    // Group notebooks by category
    const grouped = new Map<string, PublicNotebook[]>()
    for (const nb of data ?? []) {
        const cat = nb.public_category ?? "Khác"
        if (!grouped.has(cat)) grouped.set(cat, [])
        grouped.get(cat)!.push(nb)
    }

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

            {!isLoading && !error && grouped.size === 0 && (
                <div className={styles.emptyState}>
                    <Library size={32} />
                    <p>Chưa có sổ tay nào được công khai.</p>
                </div>
            )}

            {[...grouped.entries()].map(([category, notebooks]) => (
                <section key={category} className={styles.categorySection}>
                    <h2 className={styles.sectionTitle}>
                        <CategoryIcon category={category} size={16} />
                        {category}
                    </h2>
                    <div className={styles.notebookGrid}>
                        {notebooks.map((nb) => (
                            <NotebookCard key={nb.id} notebook={nb} onClick={() => onSelect(nb)} />
                        ))}
                    </div>
                </section>
            ))}

            <ExamTipsSection />
        </div>
    )
}

// ── Main export ───────────────────────────────────

export default function ExploreTab() {
    const [selected, setSelected] = useState<PublicNotebook | null>(null)

    if (selected) {
        return <DetailView notebook={selected} onBack={() => setSelected(null)} />
    }

    return <ListView onSelect={setSelected} />
}
