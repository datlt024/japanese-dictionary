"use client"

import {
    FormEvent,
    useEffect,
    useRef,
    useState,
} from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    BookOpen,
    Briefcase,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Clock,
    CreditCard,
    Flame,
    HelpCircle,
    Layers,
    Lightbulb,
    LogOut,
    PenLine,
    Plus,
    Trash2,
    X,
    Zap,
} from "lucide-react"

import { useAuth } from "@/features/auth/hooks/useAuth"
import AuthModal from "@/features/auth/components/AuthModal/AuthModal"
import { useNotebooks } from "@/features/notebook/hooks/useNotebooks"
import { useNotebookItems } from "@/features/notebook/hooks/useNotebookItems"
import type { EnrichedNotebookItem, NotebookWithCount } from "@/domain/notebook/notebook.type"
import Footer from "@/shared/components/layout/Footer"

import styles from "./NotebooksClient.module.css"

const TYPE_LABEL: Record<string, string> = {
    vocabulary: "Từ vựng",
    kanji: "Hán tự",
    grammar: "Ngữ pháp",
}

const CARD_COLORS = [
    { bg: "#f5f3ff", text: "#7c3aed" },
    { bg: "#f0fdf4", text: "#16a34a" },
    { bg: "#fff7ed", text: "#ea580c" },
    { bg: "#eff6ff", text: "#2563eb" },
    { bg: "#fdf2f8", text: "#db2777" },
    { bg: "#f0fdfa", text: "#0d9488" },
]

const CARD_ICONS = [Briefcase, BookOpen, Layers, Zap, Flame, CheckCircle2]


const STREAK_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

const JLPT_LEVELS = [
    { level: "N5", color: "#2563eb" },
    { level: "N4", color: "#16a34a" },
    { level: "N3", color: "#f59e0b" },
    { level: "N2", color: "#7c3aed" },
    { level: "N1", color: "#6b7280" },
]

export default function NotebooksClient() {
    const { user, loading: authLoading, signOut } = useAuth()
    const [authOpen, setAuthOpen] = useState(false)
    const router = useRouter()

    const { notebooks, loading: notebooksLoading, mutate: mutateNotebooks } =
        useNotebooks(Boolean(user))

    const [view, setView] = useState<"grid" | "detail">("grid")
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const [creating, setCreating] = useState(false)
    const [newName, setNewName] = useState("")
    const [createLoading, setCreateLoading] = useState(false)
    const [deletingNotebookId, setDeletingNotebookId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [practiceModalId, setPracticeModalId] = useState<string | null>(null)

    const createInputRef = useRef<HTMLInputElement>(null)

    function openPracticeModal(notebookId: string) {
        setPracticeModalId(notebookId)
    }

    function handleSelectMode(mode: string) {
        if (!practiceModalId) return
        const id = practiceModalId
        setPracticeModalId(null)
        router.push(`/notebooks/${id}/practice?mode=${mode}`)
    }

    useEffect(() => {
        if (creating) createInputRef.current?.focus()
    }, [creating])

    const totalItems = notebooks.reduce((sum, nb) => sum + nb.item_count, 0)
    const selectedNotebook = notebooks.find((nb) => nb.id === selectedId) ?? null

    async function handleCreate(e: FormEvent) {
        e.preventDefault()
        const name = newName.trim()
        if (!name || createLoading) return
        setCreateLoading(true)
        try {
            const res = await fetch("/api/notebooks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            })
            if (res.ok) {
                const created = await res.json()
                await mutateNotebooks()
                setSelectedId(created.id)
                setView("detail")
                setCreating(false)
                setNewName("")
            }
        } finally {
            setCreateLoading(false)
        }
    }

    async function handleDeleteNotebook(id: string) {
        if (deletingNotebookId) return
        setDeletingNotebookId(id)
        try {
            await fetch(`/api/notebooks/${id}`, { method: "DELETE" })
            await mutateNotebooks()
            if (selectedId === id) {
                setSelectedId(null)
                setView("grid")
            }
        } finally {
            setDeletingNotebookId(null)
        }
    }

    return (
        <div className={styles.page}>
            {/* ── Top bar ── */}
            <header className={styles.topBar}>
                <div className={styles.topBarLeft}>
                    <Link href="/" className={styles.logo}>
                        mazii
                    </Link>
                    <ChevronRight size={13} className={styles.logoCaret} />
                    <span className={styles.pageTitle}>Sổ tay từ vựng</span>
                </div>
                <div className={styles.topBarRight}>
                    {!authLoading && (
                        user ? (
                            <div className={styles.userRow}>
                                <div className={styles.avatar}>
                                    {(user.email?.[0] ?? "U").toUpperCase()}
                                </div>
                                <span className={styles.userEmail}>
                                    {user.email?.split("@")[0]}
                                </span>
                                <button
                                    type="button"
                                    className={styles.iconBtn}
                                    onClick={signOut}
                                    title="Đăng xuất"
                                >
                                    <LogOut size={15} />
                                </button>
                            </div>
                        ) : (
                            <div className={styles.authBtns}>
                                <button
                                    type="button"
                                    className={styles.loginBtn}
                                    onClick={() => setAuthOpen(true)}
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    type="button"
                                    className={styles.registerBtn}
                                    onClick={() => setAuthOpen(true)}
                                >
                                    Đăng ký
                                </button>
                            </div>
                        )
                    )}
                </div>
            </header>

            {authLoading ? (
                <div className={styles.fullCenter}>
                    <span className={styles.spinner} />
                </div>
            ) : !user ? (
                <LoginWall onLogin={() => setAuthOpen(true)} />
            ) : (
                <>
                    {/* ── Content ── */}
                    <div className={styles.body}>
                      <div className={styles.bodyWrap}>
                        <main className={styles.mainCol}>
                            {view === "detail" && selectedNotebook ? (
                                <>
                                    <button
                                        type="button"
                                        className={styles.backBtn}
                                        onClick={() => setView("grid")}
                                    >
                                        <ChevronLeft size={15} />
                                        Tất cả sổ tay
                                    </button>
                                    <NotebookDetail
                                        notebook={selectedNotebook}
                                        onDelete={() => setConfirmDeleteId(selectedNotebook.id)}
                                        onPractice={() => openPracticeModal(selectedNotebook.id)}
                                    />
                                </>
                            ) : (
                                <>
                                    {/* ── Tổng quan ── */}
                                    <section className={styles.overviewSection}>
                                        <h2 className={styles.overviewTitle}>Tổng quan</h2>
                                        <div className={styles.statsRow}>
                                            <div className={styles.statItem}>
                                                <div
                                                    className={styles.statIcon}
                                                    style={{ background: "#f5f3ff" }}
                                                >
                                                    <Layers size={20} style={{ color: "#7c3aed" }} />
                                                </div>
                                                <div>
                                                    <div className={styles.statNum}>
                                                        {notebooksLoading ? "—" : notebooks.length}
                                                    </div>
                                                    <div className={styles.statLabel}>Số sổ tay</div>
                                                </div>
                                            </div>

                                            <div className={styles.statItem}>
                                                <div
                                                    className={styles.statIcon}
                                                    style={{ background: "#eff6ff" }}
                                                >
                                                    <BookOpen size={20} style={{ color: "#2563eb" }} />
                                                </div>
                                                <div>
                                                    <div className={styles.statNum}>
                                                        {notebooksLoading ? "—" : totalItems}
                                                    </div>
                                                    <div className={styles.statLabel}>Tổng số từ</div>
                                                </div>
                                            </div>

                                            <div className={styles.statItem}>
                                                <div
                                                    className={styles.statIcon}
                                                    style={{ background: "#f0fdf4" }}
                                                >
                                                    <CheckCircle2 size={20} style={{ color: "#16a34a" }} />
                                                </div>
                                                <div>
                                                    <div className={styles.statNum}>—</div>
                                                    <div className={styles.statLabel}>Từ đã ghi nhớ</div>
                                                </div>
                                            </div>

                                            <div className={styles.statItem}>
                                                <div
                                                    className={styles.statIcon}
                                                    style={{ background: "#fff7ed" }}
                                                >
                                                    <Clock size={20} style={{ color: "#ea580c" }} />
                                                </div>
                                                <div>
                                                    <div className={styles.statNum}>—</div>
                                                    <div className={styles.statLabel}>Tỷ lệ ghi nhớ</div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* ── Danh sách sổ tay ── */}
                                    <section className={styles.notebooksSection}>
                                        <div className={styles.sectionHead}>
                                            <h2 className={styles.sectionTitle}>Danh sách sổ tay</h2>
                                            {!creating && (
                                                <button
                                                    type="button"
                                                    className={styles.addBtn}
                                                    onClick={() => setCreating(true)}
                                                >
                                                    <Plus size={13} />
                                                    Tạo sổ tay
                                                </button>
                                            )}
                                        </div>

                                        {creating && (
                                            <form className={styles.createForm} onSubmit={handleCreate}>
                                                <input
                                                    ref={createInputRef}
                                                    className={styles.createInput}
                                                    placeholder="Tên sổ tay..."
                                                    value={newName}
                                                    onChange={(e) => setNewName(e.target.value)}
                                                    maxLength={80}
                                                    disabled={createLoading}
                                                />
                                                <div className={styles.createActions}>
                                                    <button
                                                        className={styles.createSubmit}
                                                        type="submit"
                                                        disabled={!newName.trim() || createLoading}
                                                    >
                                                        {createLoading ? "..." : "Tạo"}
                                                    </button>
                                                    <button
                                                        className={styles.createCancel}
                                                        type="button"
                                                        onClick={() => { setCreating(false); setNewName("") }}
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {notebooksLoading ? (
                                            <p className={styles.hint}>Đang tải...</p>
                                        ) : (
                                                <div className={styles.cardsGrid}>
                                                    {notebooks.map((nb, i) => {
                                                        const color = CARD_COLORS[i % CARD_COLORS.length]
                                                        const CardIcon = CARD_ICONS[i % CARD_ICONS.length]
                                                        return (
                                                            <div
                                                                key={nb.id}
                                                                className={`${styles.card} ${i === 0 ? styles.cardFirst : ""}`}
                                                            >
                                                                <div
                                                                    className={styles.cardBookmark}
                                                                    style={{ color: color.text }}
                                                                >
                                                                    ▼
                                                                </div>
                                                                <div
                                                                    className={styles.cardTop}
                                                                    onClick={() => {
                                                                        setSelectedId(nb.id)
                                                                        setView("detail")
                                                                    }}
                                                                >
                                                                    <div
                                                                        className={styles.cardIcon}
                                                                        style={{ background: color.bg }}
                                                                    >
                                                                        <CardIcon
                                                                            size={22}
                                                                            style={{ color: color.text }}
                                                                        />
                                                                    </div>
                                                                    <h3 className={styles.cardName}>{nb.name}</h3>
                                                                    <p className={styles.cardCount}>{nb.item_count} từ</p>
                                                                    <p className={styles.cardReviewLine}>
                                                                        <span
                                                                            className={styles.reviewDot}
                                                                            style={{ background: color.text }}
                                                                        />
                                                                        0 từ cần ôn hôm nay
                                                                    </p>
                                                                </div>
                                                                <div className={styles.cardFooter}>
                                                                    <button
                                                                        type="button"
                                                                        className={styles.cardOntapBtn}
                                                                        style={{
                                                                            background: color.bg,
                                                                            color: color.text,
                                                                        }}
                                                                        onClick={() => openPracticeModal(nb.id)}
                                                                    >
                                                                        Ôn tập
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className={styles.cardDeleteBtn}
                                                                        onClick={() => setConfirmDeleteId(nb.id)}
                                                                        disabled={deletingNotebookId === nb.id}
                                                                        title="Xóa sổ tay"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}

                                                    <button
                                                        type="button"
                                                        className={styles.cardNew}
                                                        onClick={() => setCreating(true)}
                                                    >
                                                        <div className={styles.cardNewIcon}>
                                                            <Plus size={24} />
                                                        </div>
                                                        <span className={styles.cardNewLabel}>Tạo sổ tay mới</span>
                                                    </button>
                                                </div>
                                            )}
                                    </section>

                                    {/* ── Mẹo nhỏ ── */}
                                    {!notebooksLoading && (
                                        <div className={styles.tipCard}>
                                            <div className={styles.tipLeft}>
                                                <Lightbulb size={20} className={styles.tipIcon} />
                                                <div>
                                                    <p className={styles.tipTitle}>Mẹo nhỏ</p>
                                                    <p className={styles.tipBody}>
                                                        Ôn tập đều mỗi ngày giúp bạn ghi nhớ lâu hơn đến 90%!
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={styles.tipIllustration} aria-hidden>
                                                📖
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </main>

                        {/* ── Right sidebar ── */}
                        <aside className={styles.rightCol}>
                            {/* Ôn tập hôm nay */}
                            <div className={styles.widget}>
                                <div className={styles.widgetTitleRow}>
                                    <span className={styles.widgetEmoji}>📅</span>
                                    <h3 className={styles.widgetTitle}>Ôn tập hôm nay</h3>
                                </div>
                                <div className={styles.widgetBigNum}>
                                    {notebooksLoading ? "—" : totalItems}
                                </div>
                                <p className={styles.widgetSub}>từ cần ôn</p>
                                <button
                                    type="button"
                                    className={styles.widgetBtn}
                                    onClick={() => notebooks.length > 0 && openPracticeModal(notebooks[0].id)}
                                    disabled={notebooks.length === 0}
                                >
                                    <BookOpen size={14} />
                                    Bắt đầu ôn tập
                                </button>
                                {notebooks.length > 0 && (
                                    <button
                                        type="button"
                                        className={styles.widgetLink}
                                        onClick={() => {
                                            setSelectedId(notebooks[0].id)
                                            setView("detail")
                                        }}
                                    >
                                        Xem chi tiết →
                                    </button>
                                )}
                            </div>

                            {/* Chuỗi học */}
                            <div className={styles.widget}>
                                <div className={styles.widgetTitleRow}>
                                    <span className={styles.widgetEmoji}>🔥</span>
                                    <h3 className={styles.widgetTitle}>Chuỗi học của bạn</h3>
                                </div>
                                <div className={styles.widgetBigNum}>0 ngày</div>
                                <p className={styles.widgetSub}>Bắt đầu chuỗi học ngay!</p>
                                <div className={styles.streakDays}>
                                    {STREAK_DAYS.map((day) => (
                                        <div key={day} className={styles.streakDayCol}>
                                            <span className={styles.streakFire}>🔥</span>
                                            <span className={styles.streakDayLabel}>{day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tiến độ JLPT */}
                            <div className={styles.widget}>
                                <h3 className={styles.widgetTitle}>Tiến độ theo cấp độ JLPT</h3>
                                <div className={styles.jlptList}>
                                    {JLPT_LEVELS.map((j) => (
                                        <div key={j.level} className={styles.jlptRow}>
                                            <span
                                                className={styles.jlptDot}
                                                style={{ background: j.color }}
                                            />
                                            <span className={styles.jlptLevel}>{j.level}</span>
                                            <div className={styles.jlptBar}>
                                                <div
                                                    className={styles.jlptBarFill}
                                                    style={{ width: "0%", background: j.color }}
                                                />
                                            </div>
                                            <span className={styles.jlptCount}>0 từ</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </aside>
                      </div>
                    </div>
                </>
            )}

            <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
            <PracticeModeModal
                open={practiceModalId !== null}
                onClose={() => setPracticeModalId(null)}
                onSelect={handleSelectMode}
            />

            {confirmDeleteId !== null && (
                <div className={styles.confirmOverlay} onClick={() => setConfirmDeleteId(null)}>
                    <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.confirmIcon}>
                            <Trash2 size={22} />
                        </div>
                        <h3 className={styles.confirmTitle}>Xóa sổ tay?</h3>
                        <p className={styles.confirmDesc}>
                            Hành động này không thể hoàn tác. Tất cả từ vựng trong sổ tay sẽ bị xóa vĩnh viễn.
                        </p>
                        <div className={styles.confirmActions}>
                            <button
                                type="button"
                                className={styles.confirmCancel}
                                onClick={() => setConfirmDeleteId(null)}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className={styles.confirmDelete}
                                disabled={deletingNotebookId === confirmDeleteId}
                                onClick={async () => {
                                    await handleDeleteNotebook(confirmDeleteId)
                                    setConfirmDeleteId(null)
                                }}
                            >
                                {deletingNotebookId === confirmDeleteId ? "Đang xóa..." : "Xóa"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}

/* ── Practice mode modal ── */

const PRACTICE_MODES = [
    {
        id: "flashcard",
        Icon: CreditCard,
        title: "FlashCard",
        desc: "Ôn tập từ vựng bằng thẻ lật",
        color: "#2563eb",
        bg: "#eff6ff",
    },
    {
        id: "quiz",
        Icon: HelpCircle,
        title: "Trắc nghiệm",
        desc: "Chọn đáp án đúng trong 4 lựa chọn",
        color: "#7c3aed",
        bg: "#f5f3ff",
    },
    {
        id: "writing",
        Icon: PenLine,
        title: "Luyện viết",
        desc: "Nhìn nghĩa, gõ lại từ tiếng Nhật",
        color: "#0891b2",
        bg: "#ecfeff",
    },
    {
        id: "minitest",
        Icon: ClipboardList,
        title: "Mini Test",
        desc: "Bài kiểm tra ngắn có tính giờ",
        color: "#b45309",
        bg: "#fffbeb",
    },
]

function PracticeModeModal({
    open,
    onClose,
    onSelect,
}: {
    open: boolean
    onClose: () => void
    onSelect: (mode: string) => void
}) {
    useEffect(() => {
        if (!open) return
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open, onClose])

    if (!open) return null

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Chọn chế độ ôn tập</h2>
                    <button type="button" className={styles.modalClose} onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className={styles.modalGrid}>
                    {PRACTICE_MODES.map(({ id, Icon, title, desc, color, bg }) => (
                        <button
                            key={id}
                            type="button"
                            className={styles.modalModeCard}
                            onClick={() => onSelect(id)}
                        >
                            <div className={styles.modalModeIcon} style={{ background: bg }}>
                                <Icon size={20} color={color} />
                            </div>
                            <div className={styles.modalModeContent}>
                                <div className={styles.modalModeTitle}>{title}</div>
                                <div className={styles.modalModeDesc}>{desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ── Login wall ── */

function LoginWall({ onLogin }: { onLogin: () => void }) {
    return (
        <div className={styles.loginWall}>
            <div className={styles.loginCard}>
                <div className={styles.loginIconWrap}>
                    <BookOpen size={26} />
                </div>
                <h2 className={styles.loginTitle}>Sổ tay cá nhân</h2>
                <p className={styles.loginDesc}>
                    Lưu từ vựng, hán tự và ngữ pháp vào sổ tay để ôn luyện theo lộ trình của riêng bạn.
                </p>
                <div className={styles.loginFeatures}>
                    {["Lưu từ vựng yêu thích", "Ôn luyện bằng flashcard", "Theo dõi tiến độ học"].map((f) => (
                        <div key={f} className={styles.featureRow}>
                            <span className={styles.featureDot} />
                            {f}
                        </div>
                    ))}
                </div>
                <button type="button" className={styles.loginBtn} onClick={onLogin}>
                    Đăng nhập để bắt đầu
                </button>
            </div>
        </div>
    )
}

/* ── Notebook detail ── */

type NotebookDetailProps = {
    notebook: NotebookWithCount
    onDelete: () => void
    onPractice: () => void
}

function NotebookDetail({ notebook, onDelete, onPractice }: NotebookDetailProps) {
    const { items, loading, mutate } = useNotebookItems(notebook.id)
    const [removingId, setRemovingId] = useState<string | null>(null)

    async function handleRemoveItem(item: EnrichedNotebookItem) {
        if (removingId) return
        setRemovingId(item.id)
        try {
            await fetch(`/api/notebooks/${notebook.id}/items`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_type: item.item_type, item_id: item.item_id }),
            })
            await mutate()
        } finally {
            setRemovingId(null)
        }
    }

    return (
        <div className={styles.detailWrap}>
            <div className={styles.detailHeader}>
                <div className={styles.detailLeft}>
                    <h1 className={styles.detailTitle}>{notebook.name}</h1>
                    {!loading && items.length > 0 && (
                        <span className={styles.countBadge}>{items.length} mục</span>
                    )}
                </div>
                <div className={styles.detailRight}>
                    <button
                        type="button"
                        className={`${styles.practiceBtn} ${items.length === 0 ? styles.disabledBtn : ""}`}
                        onClick={onPractice}
                        disabled={items.length === 0}
                    >
                        <Zap size={14} />
                        Luyện tập
                    </button>
                    <button type="button" className={styles.deleteNbBtn} onClick={onDelete}>
                        <Trash2 size={14} />
                        Xóa sổ tay
                    </button>
                </div>
            </div>

            {loading ? (
                <p className={styles.hint}>Đang tải...</p>
            ) : items.length === 0 ? (
                <div className={styles.emptyItems}>
                    <div className={styles.emptyItemsIcon}>
                        <BookOpen size={28} />
                    </div>
                    <p>Sổ tay này chưa có mục nào.</p>
                    <p className={styles.emptyItemsHint}>
                        Bấm <strong>★</strong> trên trang từ vựng, hán tự hoặc ngữ pháp để thêm vào đây.
                    </p>
                </div>
            ) : (
                <ul className={styles.itemGrid}>
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className={`${styles.itemCard} ${styles[`accent_${item.item_type}`]}`}
                        >
                            <Link href={item.display.href} className={styles.itemLink}>
                                <span className={`${styles.typeBadge} ${styles[item.item_type]}`}>
                                    {TYPE_LABEL[item.item_type]}
                                </span>
                                <span className={styles.itemTitle}>{item.display.title}</span>
                                {item.display.subtitle && (
                                    <span className={styles.itemSubtitle}>{item.display.subtitle}</span>
                                )}
                                {item.display.meaning && (
                                    <span className={styles.itemMeaning}>{item.display.meaning}</span>
                                )}
                            </Link>
                            <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={() => handleRemoveItem(item)}
                                disabled={removingId === item.id}
                                title="Xóa khỏi sổ tay"
                            >
                                <X size={12} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
