"use client"

import {
    FormEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { useRouter } from "next/navigation"
import React from "react"
import useSWR from "swr"
import {
    ArrowUpDown,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    FolderOpen,
    Layers,
    Lightbulb,
    LogIn,
    Pencil,
    Plus,
    PlusCircle,
    Trash2,
    Zap,
} from "lucide-react"

import { useAuth } from "@/features/auth/hooks/useAuth"
import AuthModal from "@/features/auth/components/AuthModal/AuthModal"
import { useNotebooks } from "@/features/notebook/hooks/useNotebooks"
import { useNotebookGroups } from "@/features/notebook/hooks/useNotebookGroups"
import { useStreak, WEEK_DAYS } from "@/features/notebook/hooks/useStreak"
import NotebookListCard from "./NotebookListCard"
import NotebookDetailView from "./NotebookDetailView"
import PracticeModeModal from "./PracticeModeModal"
import RenameModal from "./RenameModal"
import ConfirmDialog from "./ConfirmDialog"
import styles from "./StudyNotebooksTab.module.css"

/* ── Constants ─────────────────────────────────────────────── */

const PAGE_SIZE = 10

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

/* ── Main component ─────────────────────────────────────────── */

export default function StudyNotebooksTab() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const { notebooks, loading: notebooksLoading, error: notebooksError, mutate: mutateNotebooks } = useNotebooks(!!user)
    const { groups, loading: groupsLoading, error: groupsError, mutate: mutateGroups } = useNotebookGroups(!!user)

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

    const [page, setPage] = useState(1)
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
    const [editGroupName, setEditGroupName] = useState("")
    const [renameGroupLoading, setRenameGroupLoading] = useState(false)
    const editGroupInputRef = useRef<HTMLInputElement>(null)

    const SORT_KEY = "notebookSortOrder"
    const VALID_SORTS = ["newest", "oldest", "az", "za"] as const
    type SortOrder = typeof VALID_SORTS[number]
    const [authModalOpen, setAuthModalOpen] = useState(false)

    const { data: practiceSessions } = useSWR<Array<{ known_ids: string[]; unknown_ids: string[]; total_items: number }>>(
        user ? "/api/practice/sessions" : null,
        (url: string) => fetch(url).then((r) => (r.ok ? r.json() : [])),
        { revalidateOnFocus: false, dedupingInterval: 60_000 }
    )

    const practiceStats = useMemo(() => {
        if (!practiceSessions?.length) return { knownCount: 0, ratio: "—" }
        const knownSet = new Set<string>()
        const unknownSet = new Set<string>()
        for (const s of practiceSessions) {
            for (const id of s.known_ids) knownSet.add(id)
        }
        for (const s of practiceSessions) {
            for (const id of s.unknown_ids) {
                if (!knownSet.has(id)) unknownSet.add(id)
            }
        }
        const total = knownSet.size + unknownSet.size
        return {
            knownCount: knownSet.size,
            ratio: total > 0 ? `${Math.round((knownSet.size / total) * 100)}%` : "—",
        }
    }, [practiceSessions])

    const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
        if (typeof window === "undefined") return "newest"
        const saved = localStorage.getItem(SORT_KEY)
        return (VALID_SORTS as readonly string[]).includes(saved ?? "") ? saved as SortOrder : "newest"
    })

    function handleSortChange(order: SortOrder) {
        setSortOrder(order)
        localStorage.setItem(SORT_KEY, order)
        setPage(1)
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

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
    const safePage = Math.min(page, totalPages)
    const pagedNotebooks = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

    const ungrouped = pagedNotebooks.filter((nb) => !nb.group_id)
    const byGroup = (gid: string) => pagedNotebooks.filter((nb) => nb.group_id === gid)

    const sortedGroups = [...groups].sort((a, b) => {
        if (sortOrder === "az") return compareByName(a.name, b.name)
        if (sortOrder === "za") return compareByName(b.name, a.name)
        return 0
    }).filter((g) => pagedNotebooks.some((nb) => nb.group_id === g.id))

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
                setPage(1)
            } else {
                setCreateError("Không thể tạo sổ tay. Vui lòng thử lại.")
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
            } else {
                setCreateError("Không thể tạo nhóm. Vui lòng thử lại.")
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
            const res = await fetch(`/api/notebook-groups/${editingGroupId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            })
            if (res.ok) await mutateGroups()
        } finally {
            setRenameGroupLoading(false)
            setEditingGroupId(null)
        }
    }

    async function handleRenameNotebook(notebookId: string, name: string): Promise<string | null> {
        if (notebooks.some((nb) => nb.id !== notebookId && nb.name.toLowerCase() === name.toLowerCase())) {
            return "Tên sổ tay đã tồn tại."
        }
        const res = await fetch(`/api/notebooks/${notebookId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        })
        if (!res.ok) return "Không thể đổi tên. Vui lòng thử lại."
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
        const res = await fetch(`/api/notebooks/${notebookId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ group_id: groupId }),
        })
        if (!res.ok) return
        await mutateNotebooks()
    }

    async function handleConfirmUngroup(notebookId: string) {
        setConfirmUngroupId(null)
        const res = await fetch(`/api/notebooks/${notebookId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ group_id: null }),
        })
        if (!res.ok) return
        await mutateNotebooks()
    }

    /* ── Render guards ── */

    if (authLoading) return <Skeleton />

    if (!user) {
        return (
            <>
                <div className={styles.loginPrompt}>
                    <LogIn size={32} className={styles.loginIcon} />
                    <p className={styles.loginTitle}>Đăng nhập để xem sổ tay của bạn</p>
                    <p className={styles.loginDesc}>Lưu từ vựng, hán tự và ngữ pháp vào sổ tay để ôn luyện mọi lúc.</p>
                    <button type="button" className={styles.loginBtn} onClick={() => setAuthModalOpen(true)}>Đăng nhập</button>
                </div>
                <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
            </>
        )
    }

    if (notebooksLoading || groupsLoading) return <Skeleton />

    if (notebooksError || groupsError) {
        return (
            <div className={styles.loginPrompt}>
                <p className={styles.loginTitle}>Không thể tải dữ liệu</p>
                <p className={styles.loginDesc}>Đã xảy ra lỗi khi kết nối. Vui lòng thử lại.</p>
                <button
                    type="button"
                    className={styles.loginBtn}
                    onClick={() => { mutateNotebooks(); mutateGroups() }}
                >
                    Thử lại
                </button>
            </div>
        )
    }

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
        { icon: <CheckCircle2 size={20} style={{ color: "#16a34a" }} />, bg: "#f0fdf4", value: practiceStats.knownCount || "—", label: "Từ đã ghi nhớ" },
        { icon: <Zap size={20} style={{ color: "#ea580c" }} />, bg: "#fff7ed", value: practiceStats.ratio, label: "Tỷ lệ ghi nhớ" },
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

                {/* ── Phân trang ── */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button
                            type="button"
                            className={styles.pageBtn}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                        >
                            <ChevronLeft size={14} />
                            Trước
                        </button>
                        <span className={styles.pageInfo}>
                            {safePage} / {totalPages}
                        </span>
                        <button
                            type="button"
                            className={styles.pageBtn}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                        >
                            Tiếp
                            <ChevronRight size={14} />
                        </button>
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
