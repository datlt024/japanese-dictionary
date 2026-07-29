"use client"

import {
    FormEvent,
    useEffect,
    useRef,
    useState,
} from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"
import {
    ArrowUpDown,
    BookOpen,
    Briefcase,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    CreditCard,
    Flame,
    FolderOpen,
    HelpCircle,
    Layers,
    Lightbulb,
    LogIn,
    MoreHorizontal,
    Pencil,
    PenLine,
    Plus,
    PlusCircle,
    Trash2,
    X,
    Zap,
} from "lucide-react"

import { useAuth } from "@/features/auth/hooks/useAuth"
import { useNotebooks } from "@/features/notebook/hooks/useNotebooks"
import { useNotebookGroups } from "@/features/notebook/hooks/useNotebookGroups"
import { useNotebookItems } from "@/features/notebook/hooks/useNotebookItems"
import { useStreak, WEEK_DAYS } from "@/features/notebook/hooks/useStreak"
import { NOTEBOOK_ITEM_TYPE_LABELS } from "@/shared/constants/search-tabs"
import type { EnrichedNotebookItem, NotebookGroup, NotebookWithCount } from "@/domain/notebook/notebook.type"
import QuickLookupModal from "@/features/dictionary/quick-lookup/components/QuickLookupModal"
import { getQuickLookupTarget, type QuickLookupTarget } from "@/features/dictionary/quick-lookup/services/quick-lookup.service"
import styles from "./StudyNotebooksTab.module.css"

/* ── Constants ─────────────────────────────────────────────── */

const CARD_COLORS = [
    { bg: "#f5f3ff", text: "#7c3aed" },
    { bg: "#f0fdf4", text: "#16a34a" },
    { bg: "#fff7ed", text: "#ea580c" },
    { bg: "#eff6ff", text: "#2563eb" },
    { bg: "#fdf2f8", text: "#db2777" },
    { bg: "#f0fdfa", text: "#0d9488" },
]
const CARD_ICONS = [Briefcase, BookOpen, Layers, Zap, Flame, CheckCircle2]

const PRACTICE_MODES = [
    { id: "flashcard", Icon: CreditCard, title: "FlashCard", desc: "Ôn tập từ vựng bằng thẻ lật", color: "#2563eb", bg: "#eff6ff" },
    { id: "quiz", Icon: HelpCircle, title: "Trắc nghiệm", desc: "Chọn đáp án đúng trong 4 lựa chọn", color: "#7c3aed", bg: "#f5f3ff" },
    { id: "writing", Icon: PenLine, title: "Luyện viết", desc: "Nhìn nghĩa, gõ lại từ tiếng Nhật", color: "#0891b2", bg: "#ecfeff" },
    { id: "minitest", Icon: ClipboardList, title: "Mini Test", desc: "Bài kiểm tra ngắn có tính giờ", color: "#b45309", bg: "#fffbeb" },
]

/* ── Helpers ───────────────────────────────────────────────── */

function Skeleton() {
    return (
        <div className={styles.skeletonWrap}>
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.skeleton} />
            ))}
        </div>
    )
}

/* ── Compact list card ─────────────────────────────────────── */

function NotebookListCard({
    nb,
    index,
    groups,
    onOpen,
    onPractice,
    onDelete,
    onRename,
    onMove,
    menuOpen,
    onMenuToggle,
}: {
    nb: NotebookWithCount
    index: number
    groups: NotebookGroup[]
    onOpen: () => void
    onPractice: () => void
    onDelete: () => void
    onRename: () => void
    onMove: (groupId: string | null) => void
    menuOpen: boolean
    onMenuToggle: () => void
}) {
    const color = CARD_COLORS[index % CARD_COLORS.length]
    const Icon = CARD_ICONS[index % CARD_ICONS.length]

    return (
        <div className={styles.card} data-menu={nb.id}>
            <button type="button" className={styles.cardMain} onClick={onOpen}>
                <div className={styles.cardIcon} style={{ background: color.bg }}>
                    {React.createElement(Icon, { size: 20, style: { color: color.text } })}
                </div>
                <div className={styles.cardBody}>
                    <p className={styles.cardName}>{nb.name}</p>
                    <p className={styles.cardCount}>{nb.item_count.toLocaleString("vi-VN")} mục</p>
                </div>
                <ChevronRight size={15} className={styles.cardChevron} />
            </button>

            <div className={styles.cardMenuWrap}>
                <button
                    type="button"
                    className={styles.cardMenuBtn}
                    onClick={(e) => { e.stopPropagation(); onMenuToggle() }}
                    title="Tùy chọn"
                >
                    <MoreHorizontal size={14} />
                </button>

                {menuOpen && (
                    <div className={styles.cardMenu} onClick={(e) => e.stopPropagation()}>
                        <button type="button" className={styles.cardMenuItem} onClick={() => { onPractice(); onMenuToggle() }}>
                            <Zap size={13} />
                            Luyện tập
                        </button>
                        <button type="button" className={styles.cardMenuItem} onClick={() => { onRename(); onMenuToggle() }}>
                            <Pencil size={13} />
                            Đổi tên
                        </button>

                        {groups.length > 0 && (
                            <>
                                <div className={styles.cardMenuDivider} />
                                <p className={styles.cardMenuLabel}>Chuyển vào nhóm</p>
                                {groups.map((g) => (
                                    <button
                                        key={g.id}
                                        type="button"
                                        className={`${styles.cardMenuItem} ${nb.group_id === g.id ? styles.cardMenuItemActive : ""}`}
                                        onClick={() => onMove(nb.group_id === g.id ? null : g.id)}
                                    >
                                        <FolderOpen size={13} />
                                        {g.name}
                                        {nb.group_id === g.id && <span className={styles.cardMenuCheck}>✓</span>}
                                    </button>
                                ))}
                                {nb.group_id && (
                                    <button type="button" className={styles.cardMenuItem} onClick={() => onMove(null)}>
                                        <X size={13} />
                                        Bỏ khỏi nhóm
                                    </button>
                                )}
                            </>
                        )}

                        <div className={styles.cardMenuDivider} />
                        <button
                            type="button"
                            className={`${styles.cardMenuItem} ${styles.cardMenuItemDanger}`}
                            onClick={() => { onDelete(); onMenuToggle() }}
                        >
                            <Trash2 size={13} />
                            Xóa sổ tay
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ── Detail view ───────────────────────────────────────────── */

function NotebookDetailView({
    notebook,
    onBack,
    onDelete,
    onPractice,
    onRename,
}: {
    notebook: NotebookWithCount
    onBack: () => void
    onDelete: () => void
    onPractice: () => void
    onRename: (newName: string) => Promise<string | null>
}) {
    const { items, loading, mutate } = useNotebookItems(notebook.id)
    const [removingId, setRemovingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState(false)
    const [editName, setEditName] = useState(notebook.name)
    const [saveLoading, setSaveLoading] = useState(false)
    const [renameError, setRenameError] = useState<string | null>(null)
    const editInputRef = useRef<HTMLInputElement>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [modalTarget, setModalTarget] = useState<QuickLookupTarget | null>(null)
    const [modalLoadingWord, setModalLoadingWord] = useState<string | null>(null)

    useEffect(() => {
        if (editingName) editInputRef.current?.focus()
    }, [editingName])

    async function handleSaveName(e: FormEvent) {
        e.preventDefault()
        const name = editName.trim()
        if (!name || name === notebook.name) { setEditingName(false); return }
        setSaveLoading(true)
        setRenameError(null)
        try {
            const err = await onRename(name)
            if (err) { setRenameError(err); return }
            setEditingName(false)
        } finally {
            setSaveLoading(false)
        }
    }

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

    async function handleOpenItem(item: EnrichedNotebookItem) {
        setModalTarget(null)
        setModalLoadingWord(item.display.title)
        setModalOpen(true)
        const vocabularyId = item.item_type === "vocabulary" ? parseInt(item.item_id, 10) : undefined
        const result = await getQuickLookupTarget(item.display.title, "vi", vocabularyId)
        setModalTarget(result)
        setModalLoadingWord(null)
    }

    function handleCloseModal() {
        setModalOpen(false)
        setModalTarget(null)
        setModalLoadingWord(null)
    }

    return (
        <div className={styles.detailWrap}>
            <button type="button" className={styles.backBtn} onClick={onBack}>
                <ChevronLeft size={15} />
                Tất cả sổ tay
            </button>

            <div className={styles.detailHeader}>
                <div className={styles.detailLeft}>
                    {editingName ? (
                        <form className={styles.renameTitleForm} onSubmit={handleSaveName}>
                            <input
                                ref={editInputRef}
                                className={`${styles.renameTitleInput} ${renameError ? styles.renameTitleInputError : ""}`}
                                value={editName}
                                onChange={(e) => { setEditName(e.target.value); setRenameError(null) }}
                                maxLength={80}
                                disabled={saveLoading}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") { setEditingName(false); setEditName(notebook.name); setRenameError(null) }
                                }}
                            />
                            {renameError && <span className={styles.renameTitleError}>{renameError}</span>}
                            <button type="submit" className={styles.renameTitleSave} disabled={!editName.trim() || saveLoading}>
                                {saveLoading ? "..." : "Lưu"}
                            </button>
                            <button type="button" className={styles.renameTitleCancel} onClick={() => { setEditingName(false); setEditName(notebook.name); setRenameError(null) }}>
                                Hủy
                            </button>
                        </form>
                    ) : (
                        <div className={styles.detailTitleRow}>
                            <h2 className={styles.detailTitle}>{notebook.name}</h2>
                            <button
                                type="button"
                                className={styles.detailEditBtn}
                                onClick={() => { setEditName(notebook.name); setEditingName(true) }}
                                title="Đổi tên"
                            >
                                <Pencil size={13} />
                            </button>
                        </div>
                    )}
                    {!loading && items.length > 0 && (
                        <span className={styles.countBadge}>{items.length} mục</span>
                    )}
                </div>

                <div className={styles.detailRight}>
                    <button
                        type="button"
                        className={styles.practiceBtn}
                        onClick={onPractice}
                        disabled={items.length === 0}
                    >
                        <Zap size={14} />
                        Luyện tập
                    </button>
                    <button type="button" className={styles.deleteNbBtn} onClick={onDelete}>
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className={styles.skeletonWrap}>
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className={styles.skeleton} />)}
                </div>
            ) : items.length === 0 ? (
                <div className={styles.emptyItems}>
                    <BookOpen size={28} className={styles.emptyItemsIcon} />
                    <p>Sổ tay này chưa có mục nào.</p>
                    <p className={styles.emptyItemsHint}>
                        Bấm <strong>★</strong> trên trang từ vựng, hán tự hoặc ngữ pháp để thêm vào đây.
                    </p>
                </div>
            ) : (
                <>
                <ul className={styles.itemGrid}>
                    {items.map((item) => (
                        <li key={item.id} className={styles.itemCard}>
                            {item.item_type === "vocabulary" ? (
                                <button
                                    type="button"
                                    className={styles.itemLink}
                                    onClick={() => handleOpenItem(item)}
                                >
                                    <span className={`${styles.typeBadge} ${styles[item.item_type]}`}>
                                        {NOTEBOOK_ITEM_TYPE_LABELS[item.item_type]}
                                    </span>
                                    <span className={styles.itemTitle}>{item.display.title}</span>
                                    {item.display.subtitle && (
                                        <span className={styles.itemSubtitle}>{item.display.subtitle}</span>
                                    )}
                                    {item.display.meaning && (
                                        <span className={styles.itemMeaning}>{item.display.meaning}</span>
                                    )}
                                </button>
                            ) : (
                                <Link href={item.display.href} className={styles.itemLink}>
                                    <span className={`${styles.typeBadge} ${styles[item.item_type]}`}>
                                        {NOTEBOOK_ITEM_TYPE_LABELS[item.item_type]}
                                    </span>
                                    <span className={styles.itemTitle}>{item.display.title}</span>
                                    {item.display.subtitle && (
                                        <span className={styles.itemSubtitle}>{item.display.subtitle}</span>
                                    )}
                                    {item.display.meaning && (
                                        <span className={styles.itemMeaning}>{item.display.meaning}</span>
                                    )}
                                </Link>
                            )}
                            <button
                                type="button"
                                className={styles.removeItemBtn}
                                onClick={() => handleRemoveItem(item)}
                                disabled={removingId === item.id}
                                title="Xóa khỏi sổ tay"
                            >
                                <X size={12} />
                            </button>
                        </li>
                    ))}
                </ul>

                <QuickLookupModal
                    open={modalOpen}
                    target={modalTarget}
                    loadingTitle={modalLoadingWord ?? undefined}
                    onClose={handleCloseModal}
                />
                </>
            )}
        </div>
    )
}

/* ── Practice mode modal ───────────────────────────────────── */

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
        function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open, onClose])

    if (!open) return null

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Chọn chế độ ôn tập</h2>
                    <button type="button" className={styles.modalClose} onClick={onClose}><X size={18} /></button>
                </div>
                <div className={styles.modalGrid}>
                    {PRACTICE_MODES.map(({ id, Icon, title, desc, color, bg }) => (
                        <button key={id} type="button" className={styles.modalModeCard} onClick={() => onSelect(id)}>
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

/* ── Rename modal ──────────────────────────────────────────── */

function RenameModal({
    currentName,
    onClose,
    onSave,
}: {
    currentName: string
    onClose: () => void
    onSave: (name: string) => Promise<string | null>
}) {
    const [name, setName] = useState(currentName)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => { inputRef.current?.focus(); inputRef.current?.select() }, [])
    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onClose])

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        const trimmed = name.trim()
        if (!trimmed || trimmed === currentName) { onClose(); return }
        setSaving(true)
        setError(null)
        const err = await onSave(trimmed)
        setSaving(false)
        if (err) {
            setError(err)
        } else {
            onClose()
        }
    }

    return (
        <div className={styles.confirmOverlay} onClick={onClose}>
            <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
                <div className={styles.confirmIcon} style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}>
                    <Pencil size={20} />
                </div>
                <h3 className={styles.confirmTitle}>Đổi tên sổ tay</h3>
                <form style={{ width: "100%" }} onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        className={`${styles.renameModalInput} ${error ? styles.renameModalInputError : ""}`}
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(null) }}
                        maxLength={80}
                        placeholder="Tên sổ tay..."
                        disabled={saving}
                    />
                    {error && <p className={styles.formError}>{error}</p>}
                    <div className={styles.confirmActions}>
                        <button type="button" className={styles.confirmCancel} onClick={onClose}>Hủy</button>
                        <button type="submit" className={styles.confirmOk} disabled={!name.trim() || saving}>
                            {saving ? "..." : "Lưu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/* ── Confirm dialog ────────────────────────────────────────── */

function ConfirmDialog({
    icon,
    iconStyle,
    title,
    desc,
    okLabel,
    okStyle,
    loading,
    onCancel,
    onOk,
}: {
    icon: React.ReactNode
    iconStyle?: React.CSSProperties
    title: string
    desc: React.ReactNode
    okLabel: string
    okStyle?: React.CSSProperties
    loading?: boolean
    onCancel: () => void
    onOk: () => void
}) {
    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === "Escape") onCancel() }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onCancel])

    return (
        <div className={styles.confirmOverlay} onClick={onCancel}>
            <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
                <div className={styles.confirmIcon} style={iconStyle}>{icon}</div>
                <h3 className={styles.confirmTitle}>{title}</h3>
                <p className={styles.confirmDesc}>{desc}</p>
                <div className={styles.confirmActions}>
                    <button type="button" className={styles.confirmCancel} onClick={onCancel}>Hủy</button>
                    <button type="button" className={styles.confirmOk} style={okStyle} onClick={onOk} disabled={loading}>
                        {loading ? "Đang xử lý..." : okLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ── Main component ────────────────────────────────────────── */

export default function StudyNotebooksTab() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const { notebooks, loading: notebooksLoading, mutate: mutateNotebooks } = useNotebooks(!!user)
    const { groups, loading: groupsLoading, mutate: mutateGroups } = useNotebookGroups(!!user)

    const streak = useStreak(user?.id ?? null)

    const [view, setView] = useState<"list" | "detail">("list")
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const [creating, setCreating] = useState(false)
    const [createInGroupId, setCreateInGroupId] = useState<string | null>(null)
    const [newName, setNewName] = useState("")
    const [createLoading, setCreateLoading] = useState(false)

    const [creatingGroup, setCreatingGroup] = useState(false)
    const [newGroupName, setNewGroupName] = useState("")
    const [createGroupLoading, setCreateGroupLoading] = useState(false)

    const [createError, setCreateError] = useState<string | null>(null)

    const [practiceId, setPracticeId] = useState<string | null>(null)
    const [renameId, setRenameId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [confirmDeleteGroupId, setConfirmDeleteGroupId] = useState<string | null>(null)
    const [confirmUngroupId, setConfirmUngroupId] = useState<string | null>(null)
    const [deletingNbId, setDeletingNbId] = useState<string | null>(null)
    const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null)

    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
    const [editGroupName, setEditGroupName] = useState("")
    const [renameGroupLoading, setRenameGroupLoading] = useState(false)
    const editGroupInputRef = useRef<HTMLInputElement>(null)

    const SORT_KEY = "notebookSortOrder"
    const VALID_SORTS = ["newest", "oldest", "az", "za"] as const
    type SortOrder = typeof VALID_SORTS[number]
    const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
        if (typeof window === "undefined") return "newest"
        const saved = localStorage.getItem(SORT_KEY)
        return (VALID_SORTS as readonly string[]).includes(saved ?? "") ? saved as SortOrder : "newest"
    })

    function handleSortChange(order: SortOrder) {
        setSortOrder(order)
        localStorage.setItem(SORT_KEY, order)
    }

    const createInputRef = useRef<HTMLInputElement>(null)
    const createGroupInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => { if (creating) createInputRef.current?.focus() }, [creating])
    useEffect(() => { if (creatingGroup) createGroupInputRef.current?.focus() }, [creatingGroup])
    useEffect(() => {
        if (!menuOpenId) return
        function handler(e: MouseEvent) {
            if (!(e.target as Element).closest(`[data-menu="${menuOpenId}"]`)) setMenuOpenId(null)
        }
        document.addEventListener("click", handler)
        return () => document.removeEventListener("click", handler)
    }, [menuOpenId])

    const selectedNotebook = notebooks.find((nb) => nb.id === selectedId) ?? null

    function normalizeForSort(name: string): string {
        const kanjiMap: Record<string, number> = {
            "〇": 0, "一": 1, "二": 2, "三": 3, "四": 4,
            "五": 5, "六": 6, "七": 7, "八": 8, "九": 9,
            "十": 10, "百": 100, "千": 1000,
        }
        return name.replace(/[〇一二三四五六七八九十百千]+/g, (match) => {
            let value = 0
            let current = 0
            for (const ch of match) {
                const v = kanjiMap[ch]
                if (v === undefined) break
                if (v >= 10) {
                    value += (current === 0 ? 1 : current) * v
                    current = 0
                } else {
                    current = v
                }
            }
            return String(value + current)
        })
    }

    function compareByName(a: string, b: string) {
        return normalizeForSort(a).localeCompare(normalizeForSort(b), ["vi", "ja", "en"], { numeric: true, caseFirst: "lower" })
    }

    const sorted = [...notebooks].sort((a, b) => {
        if (sortOrder === "az") return compareByName(a.name, b.name)
        if (sortOrder === "za") return compareByName(b.name, a.name)
        if (sortOrder === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    const ungrouped = sorted.filter((nb) => !nb.group_id)
    const byGroup = (gid: string) => sorted.filter((nb) => nb.group_id === gid)

    const sortedGroups = [...groups].sort((a, b) => {
        if (sortOrder === "az") return compareByName(a.name, b.name)
        if (sortOrder === "za") return compareByName(b.name, a.name)
        return 0
    })

    function toggleGroup(id: string) {
        setCollapsedGroups((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id); else next.add(id)
            return next
        })
    }

    function handleSelectMode(mode: string) {
        if (!practiceId) return
        const id = practiceId
        setPracticeId(null)
        router.push(`/notebooks/${id}/practice?mode=${mode}`)
    }

    async function handleCreate(e: FormEvent, groupId?: string | null) {
        e.preventDefault()
        const name = newName.trim()
        if (!name || createLoading) return
        if (notebooks.some((nb) => nb.name.toLowerCase() === name.toLowerCase())) {
            setCreateError("Tên sổ tay đã tồn tại.")
            return
        }
        setCreateError(null)
        setCreateLoading(true)
        try {
            const res = await fetch("/api/notebooks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, group_id: groupId ?? null }),
            })
            if (res.ok) {
                await mutateNotebooks()
                setCreating(false)
                setCreateInGroupId(null)
                setNewName("")
            }
        } finally {
            setCreateLoading(false)
        }
    }

    async function handleCreateGroup(e: FormEvent) {
        e.preventDefault()
        const name = newGroupName.trim()
        if (!name || createGroupLoading) return
        setCreateGroupLoading(true)
        try {
            const res = await fetch("/api/notebook-groups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            })
            if (res.ok) {
                const created = await res.json()
                await mutateGroups()
                setCollapsedGroups((prev) => { const next = new Set(prev); next.delete(created.id); return next })
                setCreatingGroup(false)
                setNewGroupName("")
            }
        } finally {
            setCreateGroupLoading(false)
        }
    }

    async function handleDeleteNotebook(id: string) {
        if (deletingNbId) return
        setDeletingNbId(id)
        try {
            const res = await fetch(`/api/notebooks/${id}`, { method: "DELETE" })
            if (!res.ok) return
            await mutateNotebooks()
            if (selectedId === id) { setSelectedId(null); setView("list") }
        } finally {
            setDeletingNbId(null)
        }
    }

    async function handleDeleteGroup(id: string) {
        if (deletingGroupId) return
        setDeletingGroupId(id)
        try {
            const res = await fetch(`/api/notebook-groups/${id}`, { method: "DELETE" })
            if (!res.ok) return
            await Promise.all([mutateGroups(), mutateNotebooks()])
        } finally {
            setDeletingGroupId(null)
        }
    }

    async function handleRenameGroup(e: FormEvent) {
        e.preventDefault()
        if (!editingGroupId) return
        const name = editGroupName.trim()
        if (!name) { setEditingGroupId(null); return }
        setRenameGroupLoading(true)
        try {
            await fetch(`/api/notebook-groups/${editingGroupId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            })
            await mutateGroups()
        } finally {
            setRenameGroupLoading(false)
            setEditingGroupId(null)
        }
    }

    async function handleRenameNotebook(notebookId: string, name: string): Promise<string | null> {
        if (notebooks.some((nb) => nb.id !== notebookId && nb.name.toLowerCase() === name.toLowerCase())) {
            return "Tên sổ tay đã tồn tại."
        }
        await fetch(`/api/notebooks/${notebookId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        })
        await mutateNotebooks()
        setRenameId(null)
        return null
    }

    async function handleMoveNotebook(notebookId: string, groupId: string | null) {
        setMenuOpenId(null)
        if (groupId === null) {
            setConfirmUngroupId(notebookId)
            return
        }
        await fetch(`/api/notebooks/${notebookId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ group_id: groupId }),
        })
        await mutateNotebooks()
    }

    async function handleConfirmUngroup(notebookId: string) {
        setConfirmUngroupId(null)
        await fetch(`/api/notebooks/${notebookId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ group_id: null }),
        })
        await mutateNotebooks()
    }

    /* ── Render guards ── */

    if (authLoading) return <Skeleton />

    if (!user) {
        return (
            <div className={styles.loginPrompt}>
                <LogIn size={32} className={styles.loginIcon} />
                <p className={styles.loginTitle}>Đăng nhập để xem sổ tay của bạn</p>
                <p className={styles.loginDesc}>Lưu từ vựng, hán tự và ngữ pháp vào sổ tay để ôn luyện mọi lúc.</p>
                <Link href="/login" className={styles.loginBtn}>Đăng nhập</Link>
            </div>
        )
    }

    if (notebooksLoading || groupsLoading) return <Skeleton />

    /* ── Detail view ── */

    if (view === "detail" && selectedNotebook) {
        return (
            <>
                <NotebookDetailView
                    notebook={selectedNotebook}
                    onBack={() => setView("list")}
                    onDelete={() => setConfirmDeleteId(selectedNotebook.id)}
                    onPractice={() => setPracticeId(selectedNotebook.id)}
                    onRename={(name) => handleRenameNotebook(selectedNotebook.id, name)}
                />
                <PracticeModeModal
                    open={practiceId !== null}
                    onClose={() => setPracticeId(null)}
                    onSelect={handleSelectMode}
                />
                {confirmDeleteId !== null && (
                    <ConfirmDialog
                        icon={<Trash2 size={22} />}
                        title="Xóa sổ tay?"
                        desc="Hành động này không thể hoàn tác. Tất cả từ trong sổ tay sẽ bị xóa vĩnh viễn."
                        okLabel="Xóa"
                        okStyle={{ background: "var(--color-danger)" }}
                        loading={deletingNbId === confirmDeleteId}
                        onCancel={() => setConfirmDeleteId(null)}
                        onOk={async () => { await handleDeleteNotebook(confirmDeleteId); setConfirmDeleteId(null) }}
                    />
                )}
            </>
        )
    }

    /* ── List view ── */

    const totalItems = notebooks.reduce((sum, nb) => sum + nb.item_count, 0)

    const STATS = [
        { icon: <Layers size={20} style={{ color: "#7c3aed" }} />, bg: "#f5f3ff", value: notebooks.length, label: "Số sổ tay" },
        { icon: <BookOpen size={20} style={{ color: "#2563eb" }} />, bg: "#eff6ff", value: totalItems, label: "Tổng số từ" },
        { icon: <CheckCircle2 size={20} style={{ color: "#16a34a" }} />, bg: "#f0fdf4", value: "—", label: "Từ đã ghi nhớ" },
        { icon: <Zap size={20} style={{ color: "#ea580c" }} />, bg: "#fff7ed", value: "—", label: "Tỷ lệ ghi nhớ" },
    ]

    return (
        <>
            <div className={styles.layout}>
                <main className={styles.mainCol}>
                {/* ── Tổng quan ── */}
                <section className={styles.overviewSection}>
                    <h2 className={styles.overviewTitle}>Tổng quan</h2>
                    <div className={styles.statsRow}>
                        {STATS.map(({ icon, bg, value, label }) => (
                            <div key={label} className={styles.statItem}>
                                <div className={styles.statIcon} style={{ background: bg }}>{icon}</div>
                                <div>
                                    <div className={styles.statNum}>{value}</div>
                                    <div className={styles.statLabel}>{label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Toolbar ── */}
                <div className={styles.toolbar}>
                    <div className={styles.sortWrap}>
                        <ArrowUpDown size={13} className={styles.sortIcon} />
                        <select
                            className={styles.sortSelect}
                            value={sortOrder}
                            onChange={(e) => handleSortChange(e.target.value as SortOrder)}
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="az">A → Z</option>
                            <option value="za">Z → A</option>
                        </select>
                    </div>

                    <div className={styles.toolbarRight}>
                        {!creatingGroup && (
                            <button type="button" className={styles.toolbarBtn} onClick={() => setCreatingGroup(true)}>
                                <FolderOpen size={13} />
                                Tạo nhóm
                            </button>
                        )}
                        {!creating && (
                            <button type="button" className={styles.toolbarBtnPrimary} onClick={() => { setCreating(true); setCreateInGroupId(null) }}>
                                <Plus size={13} />
                                Tạo sổ tay
                            </button>
                        )}
                    </div>
                </div>

                {/* Form tạo nhóm */}
                {creatingGroup && (
                    <form className={styles.createForm} onSubmit={handleCreateGroup}>
                        <FolderOpen size={15} className={styles.createFormIcon} />
                        <input
                            ref={createGroupInputRef}
                            className={styles.createInput}
                            placeholder="Tên nhóm..."
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            maxLength={80}
                            disabled={createGroupLoading}
                        />
                        <button className={styles.createSubmit} type="submit" disabled={!newGroupName.trim() || createGroupLoading}>
                            {createGroupLoading ? "..." : "Tạo"}
                        </button>
                        <button className={styles.createCancel} type="button" onClick={() => { setCreatingGroup(false); setNewGroupName("") }}>
                            Hủy
                        </button>
                    </form>
                )}

                {/* Form tạo sổ tay (không nhóm) */}
                {creating && createInGroupId === null && (
                    <div>
                        <form className={styles.createForm} onSubmit={(e) => handleCreate(e, null)}>
                            <input
                                ref={createInputRef}
                                className={`${styles.createInput} ${createError ? styles.createInputError : ""}`}
                                placeholder="Tên sổ tay..."
                                value={newName}
                                onChange={(e) => { setNewName(e.target.value); setCreateError(null) }}
                                maxLength={80}
                                disabled={createLoading}
                            />
                            <button className={styles.createSubmit} type="submit" disabled={!newName.trim() || createLoading}>
                                {createLoading ? "..." : "Tạo"}
                            </button>
                            <button className={styles.createCancel} type="button" onClick={() => { setCreating(false); setNewName(""); setCreateError(null) }}>
                                Hủy
                            </button>
                        </form>
                        {createError && <p className={styles.formError}>{createError}</p>}
                    </div>
                )}

                {notebooks.length === 0 && !creating ? (
                    <div className={styles.emptyWrap}>
                        <BookOpen size={36} className={styles.emptyIcon} />
                        <p className={styles.emptyTitle}>Bạn chưa có sổ tay nào</p>
                        <p className={styles.emptyDesc}>Hãy tạo sổ tay và thêm từ để bắt đầu ôn luyện.</p>
                        <button type="button" className={styles.createBtn} onClick={() => setCreating(true)}>
                            <PlusCircle size={15} />
                            Tạo sổ tay
                        </button>
                    </div>
                ) : (
                    <div className={styles.lists}>
                        {/* Nhóm */}
                        {sortedGroups.map((group) => {
                            const children = byGroup(group.id)
                            const isExpanded = !collapsedGroups.has(group.id)
                            return (
                                <div key={group.id} className={styles.groupSection}>
                                    <div className={styles.groupHeader}>
                                        {editingGroupId === group.id ? (
                                            <form className={styles.editGroupForm} onSubmit={handleRenameGroup}>
                                                <input
                                                    ref={editGroupInputRef}
                                                    className={styles.editGroupInput}
                                                    value={editGroupName}
                                                    onChange={(e) => setEditGroupName(e.target.value)}
                                                    maxLength={80}
                                                    disabled={renameGroupLoading}
                                                    autoFocus
                                                    onKeyDown={(e) => { if (e.key === "Escape") setEditingGroupId(null) }}
                                                />
                                                <button className={styles.createSubmit} type="submit" disabled={!editGroupName.trim() || renameGroupLoading}>
                                                    {renameGroupLoading ? "..." : "Lưu"}
                                                </button>
                                                <button className={styles.createCancel} type="button" onClick={() => setEditingGroupId(null)}>
                                                    Hủy
                                                </button>
                                            </form>
                                        ) : (
                                            <>
                                            <button type="button" className={styles.groupToggle} onClick={() => toggleGroup(group.id)}>
                                                {isExpanded
                                                    ? <ChevronDown size={14} />
                                                    : <ChevronRight size={14} />
                                                }
                                                <FolderOpen size={14} className={styles.groupFolderIcon} />
                                                <span className={styles.groupName}>{group.name}</span>
                                                <span className={styles.groupCount}>{children.length} sổ tay</span>
                                            </button>
                                            <div className={styles.groupActions}>
                                                <button
                                                    type="button"
                                                    className={styles.groupAddBtn}
                                                    title="Đổi tên nhóm"
                                                    onClick={() => { setEditingGroupId(group.id); setEditGroupName(group.name) }}
                                                >
                                                    <Pencil size={13} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className={styles.groupAddBtn}
                                                    title="Thêm sổ tay vào nhóm"
                                                    onClick={() => {
                                                        setCreateInGroupId(group.id)
                                                        setCreating(true)
                                                        setNewName("")
                                                        if (!isExpanded) toggleGroup(group.id)
                                                    }}
                                                >
                                                    <Plus size={13} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className={styles.groupDeleteBtn}
                                                    title="Xóa nhóm"
                                                    onClick={() => setConfirmDeleteGroupId(group.id)}
                                                    disabled={deletingGroupId === group.id}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                            </>
                                        )}
                                    </div>

                                    {isExpanded && (
                                        <div className={styles.groupBody}>
                                            {creating && createInGroupId === group.id && (
                                                <div>
                                                    <form className={styles.createFormInline} onSubmit={(e) => handleCreate(e, group.id)}>
                                                        <input
                                                            ref={createInputRef}
                                                            className={`${styles.createInput} ${createError ? styles.createInputError : ""}`}
                                                            placeholder="Tên sổ tay..."
                                                            value={newName}
                                                            onChange={(e) => { setNewName(e.target.value); setCreateError(null) }}
                                                            maxLength={80}
                                                            disabled={createLoading}
                                                            autoFocus
                                                        />
                                                        <button className={styles.createSubmit} type="submit" disabled={!newName.trim() || createLoading}>
                                                            {createLoading ? "..." : "Tạo"}
                                                        </button>
                                                        <button className={styles.createCancel} type="button" onClick={() => { setCreating(false); setCreateInGroupId(null); setNewName(""); setCreateError(null) }}>
                                                            Hủy
                                                        </button>
                                                    </form>
                                                    {createError && <p className={styles.formError}>{createError}</p>}
                                                </div>
                                            )}
                                            <div className={styles.grid}>
                                                {children.map((nb, i) => (
                                                    <NotebookListCard
                                                        key={nb.id}
                                                        nb={nb}
                                                        index={i}
                                                        groups={groups}
                                                        onOpen={() => { setSelectedId(nb.id); setView("detail") }}
                                                        onPractice={() => setPracticeId(nb.id)}
                                                        onDelete={() => setConfirmDeleteId(nb.id)}
                                                        onRename={() => setRenameId(nb.id)}
                                                        onMove={(gid) => handleMoveNotebook(nb.id, gid)}
                                                        menuOpen={menuOpenId === nb.id}
                                                        onMenuToggle={() => setMenuOpenId(menuOpenId === nb.id ? null : nb.id)}
                                                    />
                                                ))}
                                                {children.length === 0 && !(creating && createInGroupId === group.id) && (
                                                    <button
                                                        type="button"
                                                        className={styles.groupAddPlaceholder}
                                                        onClick={() => { setCreateInGroupId(group.id); setCreating(true); setNewName("") }}
                                                    >
                                                        <Plus size={14} />
                                                        Thêm sổ tay
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {/* Sổ tay không có nhóm */}
                        {(ungrouped.length > 0 || groups.length === 0) && (
                            <div className={styles.groupSection}>
                                {groups.length > 0 && (
                                    <div className={styles.ungroupedLabel}>Không có nhóm</div>
                                )}
                                <div className={styles.grid}>
                                    {ungrouped.map((nb, i) => (
                                        <NotebookListCard
                                            key={nb.id}
                                            nb={nb}
                                            index={i}
                                            groups={groups}
                                            onOpen={() => { setSelectedId(nb.id); setView("detail") }}
                                            onPractice={() => setPracticeId(nb.id)}
                                            onDelete={() => setConfirmDeleteId(nb.id)}
                                            onRename={() => setRenameId(nb.id)}
                                            onMove={(gid) => handleMoveNotebook(nb.id, gid)}
                                            menuOpen={menuOpenId === nb.id}
                                            onMenuToggle={() => setMenuOpenId(menuOpenId === nb.id ? null : nb.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Mẹo nhỏ ── */}
                <div className={styles.tipCard}>
                    <div className={styles.tipLeft}>
                        <Lightbulb size={20} className={styles.tipIcon} />
                        <div>
                            <p className={styles.tipTitle}>Mẹo nhỏ</p>
                            <p className={styles.tipBody}>Ôn tập đều mỗi ngày giúp bạn ghi nhớ lâu hơn đến 90%!</p>
                        </div>
                    </div>
                    <div className={styles.tipIllustration} aria-hidden>📖</div>
                </div>
                </main>

                <aside className={styles.sideCol}>
                    {/* Ôn tập hôm nay */}
                    <div className={styles.widget}>
                        <div className={styles.widgetTitleRow}>
                            <span className={styles.widgetEmoji}>📅</span>
                            <h3 className={styles.widgetTitle}>Ôn tập hôm nay</h3>
                        </div>
                        <div className={styles.widgetBigNum}>{totalItems}</div>
                        <p className={styles.widgetSub}>từ cần ôn</p>
                        <button
                            type="button"
                            className={styles.widgetBtn}
                            onClick={() => notebooks.length > 0 && setPracticeId(notebooks[0].id)}
                            disabled={notebooks.length === 0}
                        >
                            <BookOpen size={14} />
                            Bắt đầu ôn tập
                        </button>
                        {notebooks.length > 0 && (
                            <button
                                type="button"
                                className={styles.widgetLink}
                                onClick={() => { setSelectedId(notebooks[0].id); setView("detail") }}
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
                        <div className={styles.widgetBigNum}>
                            {streak.count > 0 ? `${streak.count} ngày` : "—"}
                        </div>
                        <p className={styles.widgetSub}>
                            {streak.count > 0
                                ? "Tuyệt vời! Tiếp tục duy trì nhé."
                                : "Đăng nhập mỗi ngày để tăng chuỗi học!"}
                        </p>
                        <div className={styles.streakDays}>
                            {WEEK_DAYS.map((day, idx) => (
                                <div key={day} className={styles.streakDayCol}>
                                    <span
                                        className={styles.streakFire}
                                        style={{ opacity: streak.activeDays.includes(idx) ? 1 : 0.18 }}
                                    >
                                        🔥
                                    </span>
                                    <span className={styles.streakDayLabel}>{day}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {/* ── Modals & dialogs ── */}

            <PracticeModeModal
                open={practiceId !== null}
                onClose={() => setPracticeId(null)}
                onSelect={handleSelectMode}
            />

            {renameId !== null && (() => {
                const nb = notebooks.find((n) => n.id === renameId)
                return nb ? (
                    <RenameModal
                        currentName={nb.name}
                        onClose={() => setRenameId(null)}
                        onSave={(name) => handleRenameNotebook(renameId, name)}
                    />
                ) : null
            })()}


            {confirmDeleteId !== null && (
                <ConfirmDialog
                    icon={<Trash2 size={22} />}
                    title="Xóa sổ tay?"
                    desc="Hành động này không thể hoàn tác. Tất cả từ trong sổ tay sẽ bị xóa vĩnh viễn."
                    okLabel="Xóa"
                    okStyle={{ background: "var(--color-danger)" }}
                    loading={deletingNbId === confirmDeleteId}
                    onCancel={() => setConfirmDeleteId(null)}
                    onOk={async () => { await handleDeleteNotebook(confirmDeleteId); setConfirmDeleteId(null) }}
                />
            )}

            {confirmDeleteGroupId !== null && (
                <ConfirmDialog
                    icon={<Trash2 size={22} />}
                    title="Xóa nhóm?"
                    desc="Các sổ tay trong nhóm sẽ không bị xóa mà chuyển về danh sách không có nhóm."
                    okLabel="Xóa nhóm"
                    okStyle={{ background: "var(--color-danger)" }}
                    loading={deletingGroupId === confirmDeleteGroupId}
                    onCancel={() => setConfirmDeleteGroupId(null)}
                    onOk={async () => { await handleDeleteGroup(confirmDeleteGroupId); setConfirmDeleteGroupId(null) }}
                />
            )}

            {confirmUngroupId !== null && (() => {
                const nb = notebooks.find((n) => n.id === confirmUngroupId)
                return (
                    <ConfirmDialog
                        icon={<FolderOpen size={22} />}
                        iconStyle={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
                        title="Bỏ khỏi nhóm?"
                        desc={nb ? <><strong>{nb.name}</strong> sẽ được chuyển về danh sách không có nhóm.</> : "Sổ tay sẽ được chuyển về danh sách không có nhóm."}
                        okLabel="Bỏ khỏi nhóm"
                        okStyle={{ background: "var(--color-primary)" }}
                        onCancel={() => setConfirmUngroupId(null)}
                        onOk={() => handleConfirmUngroup(confirmUngroupId)}
                    />
                )
            })()}
        </>
    )
}
