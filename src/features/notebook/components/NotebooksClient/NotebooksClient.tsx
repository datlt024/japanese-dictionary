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
    BookOpen,
    Briefcase,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Clock,
    CreditCard,
    Flame,
    FolderOpen,
    HelpCircle,
    Layers,
    Lightbulb,
    LogOut,
    MoreHorizontal,
    Pencil,
    PenLine,
    Plus,
    Trash2,
    X,
    Zap,
} from "lucide-react"

import { useAuth } from "@/features/auth/hooks/useAuth"
import AuthModal from "@/features/auth/components/AuthModal/AuthModal"
import { useNotebooks } from "@/features/notebook/hooks/useNotebooks"
import { useNotebookGroups } from "@/features/notebook/hooks/useNotebookGroups"
import { useNotebookItems } from "@/features/notebook/hooks/useNotebookItems"
import { useStreak, WEEK_DAYS } from "@/features/notebook/hooks/useStreak"
import type { EnrichedNotebookItem, NotebookGroup, NotebookWithCount } from "@/domain/notebook/notebook.type"
import Footer from "@/shared/components/layout/Footer"

import { NOTEBOOK_ITEM_TYPE_LABELS } from "@/shared/constants/search-tabs"

import styles from "./NotebooksClient.module.css"

const CARD_COLORS = [
    { bg: "#f5f3ff", text: "#7c3aed" },
    { bg: "#f0fdf4", text: "#16a34a" },
    { bg: "#fff7ed", text: "#ea580c" },
    { bg: "#eff6ff", text: "#2563eb" },
    { bg: "#fdf2f8", text: "#db2777" },
    { bg: "#f0fdfa", text: "#0d9488" },
]

const CARD_ICONS = [Briefcase, BookOpen, Layers, Zap, Flame, CheckCircle2]

function getCardStyle(index: number) {
    return CARD_COLORS[index % CARD_COLORS.length]
}

export default function NotebooksClient() {
    const { user, loading: authLoading, signOut } = useAuth()
    const [authOpen, setAuthOpen] = useState(false)
    const router = useRouter()

    const { notebooks, loading: notebooksLoading, mutate: mutateNotebooks } =
        useNotebooks(Boolean(user))
    const { groups, loading: groupsLoading, mutate: mutateGroups } =
        useNotebookGroups(Boolean(user))

    const [view, setView] = useState<"grid" | "detail">("grid")
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const [creating, setCreating] = useState(false)
    const [newName, setNewName] = useState("")
    const [createLoading, setCreateLoading] = useState(false)
    const [createInGroupId, setCreateInGroupId] = useState<string | null>(null)

    const [creatingGroup, setCreatingGroup] = useState(false)
    const [newGroupName, setNewGroupName] = useState("")
    const [createGroupLoading, setCreateGroupLoading] = useState(false)

    const [deletingNotebookId, setDeletingNotebookId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [confirmDeleteGroupId, setConfirmDeleteGroupId] = useState<string | null>(null)
    const [confirmUngroupId, setConfirmUngroupId] = useState<string | null>(null)
    const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null)

    const [practiceModalId, setPracticeModalId] = useState<string | null>(null)
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
    const [moveNotebookId, setMoveNotebookId] = useState<string | null>(null)
    const [renameNotebookId, setRenameNotebookId] = useState<string | null>(null)
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

    const streak = useStreak(user?.id ?? null)

    const createInputRef = useRef<HTMLInputElement>(null)
    const createGroupInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (creating) createInputRef.current?.focus()
    }, [creating])

    useEffect(() => {
        if (creatingGroup) createGroupInputRef.current?.focus()
    }, [creatingGroup])

    useEffect(() => {
        if (!menuOpenId) return
        function handler(e: MouseEvent) {
            if (!(e.target as Element).closest(`[data-menu="${menuOpenId}"]`)) {
                setMenuOpenId(null)
            }
        }
        document.addEventListener("click", handler)
        return () => document.removeEventListener("click", handler)
    }, [menuOpenId])

    function openPracticeModal(notebookId: string) {
        setPracticeModalId(notebookId)
    }

    function handleSelectMode(mode: string) {
        if (!practiceModalId) return
        const id = practiceModalId
        setPracticeModalId(null)
        router.push(`/notebooks/${id}/practice?mode=${mode}`)
    }

    function toggleGroup(groupId: string) {
        setCollapsedGroups((prev) => {
            const next = new Set(prev)
            if (next.has(groupId)) next.delete(groupId)
            else next.add(groupId)
            return next
        })
    }

    const totalItems = notebooks.reduce((sum, nb) => sum + nb.item_count, 0)
    const selectedNotebook = notebooks.find((nb) => nb.id === selectedId) ?? null

    const ungroupedNotebooks = notebooks.filter((nb) => !nb.group_id)
    const notebooksByGroup = (groupId: string) => notebooks.filter((nb) => nb.group_id === groupId)

    async function handleCreate(e: FormEvent, groupId?: string | null) {
        e.preventDefault()
        const name = newName.trim()
        if (!name || createLoading) return
        setCreateLoading(true)
        try {
            const res = await fetch("/api/notebooks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, group_id: groupId ?? null }),
            })
            if (res.ok) {
                const created = await res.json()
                await mutateNotebooks()
                setSelectedId(created.id)
                setView("detail")
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
        if (deletingNotebookId) return
        setDeletingNotebookId(id)
        try {
            const res = await fetch(`/api/notebooks/${id}`, { method: "DELETE" })
            if (!res.ok) return
            await mutateNotebooks()
            if (selectedId === id) {
                setSelectedId(null)
                setView("grid")
            }
        } finally {
            setDeletingNotebookId(null)
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

    async function handleRenameNotebook(notebookId: string, newName: string) {
        setRenameNotebookId(null)
        await fetch(`/api/notebooks/${notebookId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName }),
        })
        await mutateNotebooks()
    }

    async function handleMoveNotebook(notebookId: string, groupId: string | null) {
        if (groupId === null) {
            setMoveNotebookId(null)
            setMenuOpenId(null)
            setConfirmUngroupId(notebookId)
            return
        }
        setMoveNotebookId(null)
        setMenuOpenId(null)
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
                                            onRename={(newName) => handleRenameNotebook(selectedNotebook.id, newName)}
                                        />
                                    </>
                                ) : (
                                    <>
                                        {/* ── Tổng quan ── */}
                                        <section className={styles.overviewSection}>
                                            <h2 className={styles.overviewTitle}>Tổng quan</h2>
                                            <div className={styles.statsRow}>
                                                <div className={styles.statItem}>
                                                    <div className={styles.statIcon} style={{ background: "#f5f3ff" }}>
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
                                                    <div className={styles.statIcon} style={{ background: "#eff6ff" }}>
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
                                                    <div className={styles.statIcon} style={{ background: "#f0fdf4" }}>
                                                        <CheckCircle2 size={20} style={{ color: "#16a34a" }} />
                                                    </div>
                                                    <div>
                                                        <div className={styles.statNum}>—</div>
                                                        <div className={styles.statLabel}>Từ đã ghi nhớ</div>
                                                    </div>
                                                </div>
                                                <div className={styles.statItem}>
                                                    <div className={styles.statIcon} style={{ background: "#fff7ed" }}>
                                                        <Clock size={20} style={{ color: "#ea580c" }} />
                                                    </div>
                                                    <div>
                                                        <div className={styles.statNum}>—</div>
                                                        <div className={styles.statLabel}>Tỷ lệ ghi nhớ</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        {/* ── Danh sách ── */}
                                        <section className={styles.notebooksSection}>
                                            <div className={styles.sectionHead}>
                                                <h2 className={styles.sectionTitle}>Danh sách sổ tay</h2>
                                                <div className={styles.sectionActions}>
                                                    {!creatingGroup && (
                                                        <button
                                                            type="button"
                                                            className={styles.addGroupBtn}
                                                            onClick={() => setCreatingGroup(true)}
                                                        >
                                                            <FolderOpen size={13} />
                                                            Tạo nhóm
                                                        </button>
                                                    )}
                                                    {!creating && (
                                                        <button
                                                            type="button"
                                                            className={styles.addBtn}
                                                            onClick={() => { setCreating(true); setCreateInGroupId(null) }}
                                                        >
                                                            <Plus size={13} />
                                                            Tạo sổ tay
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Form tạo nhóm */}
                                            {creatingGroup && (
                                                <form className={styles.createForm} onSubmit={handleCreateGroup}>
                                                    <FolderOpen size={16} className={styles.createFormIcon} />
                                                    <input
                                                        ref={createGroupInputRef}
                                                        className={styles.createInput}
                                                        placeholder="Tên nhóm (vd: Minnano Nihongo)..."
                                                        value={newGroupName}
                                                        onChange={(e) => setNewGroupName(e.target.value)}
                                                        maxLength={80}
                                                        disabled={createGroupLoading}
                                                    />
                                                    <div className={styles.createActions}>
                                                        <button
                                                            className={styles.createSubmit}
                                                            type="submit"
                                                            disabled={!newGroupName.trim() || createGroupLoading}
                                                        >
                                                            {createGroupLoading ? "..." : "Tạo"}
                                                        </button>
                                                        <button
                                                            className={styles.createCancel}
                                                            type="button"
                                                            onClick={() => { setCreatingGroup(false); setNewGroupName("") }}
                                                        >
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </form>
                                            )}

                                            {/* Form tạo sổ không có nhóm */}
                                            {creating && createInGroupId === null && (
                                                <form className={styles.createForm} onSubmit={(e) => handleCreate(e, null)}>
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

                                            {notebooksLoading || groupsLoading ? (
                                                <p className={styles.hint}>Đang tải...</p>
                                            ) : (
                                                <div className={styles.listsWrap}>
                                                    {/* ── Nhóm ── */}
                                                    {groups.map((group) => {
                                                        const groupNotebooks = notebooksByGroup(group.id)
                                                        const isExpanded = !collapsedGroups.has(group.id)
                                                        return (
                                                            <div key={group.id} className={styles.groupSection}>
                                                                <div className={styles.groupHeader}>
                                                                    <button
                                                                        type="button"
                                                                        className={styles.groupToggle}
                                                                        onClick={() => toggleGroup(group.id)}
                                                                    >
                                                                        {isExpanded
                                                                            ? <ChevronDown size={15} />
                                                                            : <ChevronRight size={15} />
                                                                        }
                                                                        <FolderOpen size={16} className={styles.groupFolderIcon} />
                                                                        <span className={styles.groupName}>{group.name}</span>
                                                                        <span className={styles.groupCount}>{groupNotebooks.length} sổ</span>
                                                                    </button>
                                                                    <div className={styles.groupActions}>
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
                                                                </div>

                                                                {isExpanded && (
                                                                    <div className={styles.groupBody}>
                                                                        {/* Form tạo sổ trong nhóm */}
                                                                        {creating && createInGroupId === group.id && (
                                                                            <form
                                                                                className={styles.createFormInline}
                                                                                onSubmit={(e) => handleCreate(e, group.id)}
                                                                            >
                                                                                <input
                                                                                    ref={createInputRef}
                                                                                    className={styles.createInput}
                                                                                    placeholder="Tên sổ tay..."
                                                                                    value={newName}
                                                                                    onChange={(e) => setNewName(e.target.value)}
                                                                                    maxLength={80}
                                                                                    disabled={createLoading}
                                                                                    autoFocus
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
                                                                                        onClick={() => { setCreating(false); setCreateInGroupId(null); setNewName("") }}
                                                                                    >
                                                                                        Hủy
                                                                                    </button>
                                                                                </div>
                                                                            </form>
                                                                        )}

                                                                        <div className={styles.cardsGrid}>
                                                                            {groupNotebooks.map((nb, i) => (
                                                                                <NotebookCard
                                                                                    key={nb.id}
                                                                                    notebook={nb}
                                                                                    colorIndex={i}
                                                                                    groups={groups}
                                                                                    onOpen={() => { setSelectedId(nb.id); setView("detail") }}
                                                                                    onPractice={() => openPracticeModal(nb.id)}
                                                                                    onDelete={() => setConfirmDeleteId(nb.id)}
                                                                                    onRename={() => setRenameNotebookId(nb.id)}
                                                                                    onMove={(gid) => handleMoveNotebook(nb.id, gid)}
                                                                                    deleting={deletingNotebookId === nb.id}
                                                                                    menuOpen={menuOpenId === nb.id}
                                                                                    onMenuToggle={() => setMenuOpenId(menuOpenId === nb.id ? null : nb.id)}
                                                                                />
                                                                            ))}
                                                                            {groupNotebooks.length === 0 && !(creating && createInGroupId === group.id) && (
                                                                                <button
                                                                                    type="button"
                                                                                    className={styles.cardNew}
                                                                                    onClick={() => {
                                                                                        setCreateInGroupId(group.id)
                                                                                        setCreating(true)
                                                                                        setNewName("")
                                                                                    }}
                                                                                >
                                                                                    <div className={styles.cardNewIcon}>
                                                                                        <Plus size={20} />
                                                                                    </div>
                                                                                    <span className={styles.cardNewLabel}>Thêm sổ tay</span>
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}

                                                    {/* ── Sổ tay không có nhóm ── */}
                                                    {(ungroupedNotebooks.length > 0 || groups.length === 0) && (
                                                        <div className={styles.ungroupedSection}>
                                                            {groups.length > 0 && (
                                                                <p className={styles.ungroupedLabel}>Không có nhóm</p>
                                                            )}
                                                            <div className={styles.cardsGrid}>
                                                                {ungroupedNotebooks.map((nb, i) => (
                                                                    <NotebookCard
                                                                        key={nb.id}
                                                                        notebook={nb}
                                                                        colorIndex={i}
                                                                        groups={groups}
                                                                        onOpen={() => { setSelectedId(nb.id); setView("detail") }}
                                                                        onPractice={() => openPracticeModal(nb.id)}
                                                                        onDelete={() => setConfirmDeleteId(nb.id)}
                                                                        onRename={() => setRenameNotebookId(nb.id)}
                                                                        onMove={(gid) => handleMoveNotebook(nb.id, gid)}
                                                                        deleting={deletingNotebookId === nb.id}
                                                                        menuOpen={menuOpenId === nb.id}
                                                                        onMenuToggle={() => setMenuOpenId(menuOpenId === nb.id ? null : nb.id)}
                                                                    />
                                                                ))}
                                                                <button
                                                                    type="button"
                                                                    className={styles.cardNew}
                                                                    onClick={() => { setCreating(true); setCreateInGroupId(null) }}
                                                                >
                                                                    <div className={styles.cardNewIcon}>
                                                                        <Plus size={24} />
                                                                    </div>
                                                                    <span className={styles.cardNewLabel}>Tạo sổ tay mới</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
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
                                                    style={{ opacity: streak.activeDays.includes(idx) ? 1 : 0.2 }}
                                                >
                                                    🔥
                                                </span>
                                                <span className={styles.streakDayLabel}>{day}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.widget}>
                                    <div className={styles.widgetTitleRow}>
                                        <span className={styles.widgetEmoji}>🗺️</span>
                                        <h3 className={styles.widgetTitle}>Khám phá</h3>
                                    </div>
                                    <div className={styles.exploreLinks}>
                                        <Link href="/search?tab=grammar&q=N5" className={styles.exploreLink}>
                                            📘 Ngữ pháp N5
                                        </Link>
                                        <Link href="/search?tab=grammar&q=N4" className={styles.exploreLink}>
                                            📗 Ngữ pháp N4
                                        </Link>
                                        <Link href="/kanji" className={styles.exploreLink}>
                                            漢 Tra Hán tự theo cấp
                                        </Link>
                                        <Link href="/search?tab=vocabulary&q=日本語" className={styles.exploreLink}>
                                            🔍 Tìm từ vựng
                                        </Link>
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

            {/* Confirm xóa sổ tay */}
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

            {/* Confirm xóa nhóm */}
            {confirmDeleteGroupId !== null && (
                <div className={styles.confirmOverlay} onClick={() => setConfirmDeleteGroupId(null)}>
                    <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.confirmIcon}>
                            <Trash2 size={22} />
                        </div>
                        <h3 className={styles.confirmTitle}>Xóa nhóm?</h3>
                        <p className={styles.confirmDesc}>
                            Các sổ tay trong nhóm sẽ không bị xóa mà chuyển về danh sách không có nhóm.
                        </p>
                        <div className={styles.confirmActions}>
                            <button
                                type="button"
                                className={styles.confirmCancel}
                                onClick={() => setConfirmDeleteGroupId(null)}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className={styles.confirmDelete}
                                disabled={deletingGroupId === confirmDeleteGroupId}
                                onClick={async () => {
                                    await handleDeleteGroup(confirmDeleteGroupId)
                                    setConfirmDeleteGroupId(null)
                                }}
                            >
                                {deletingGroupId === confirmDeleteGroupId ? "Đang xóa..." : "Xóa nhóm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm bỏ khỏi nhóm */}
            {confirmUngroupId !== null && (() => {
                const nb = notebooks.find((n) => n.id === confirmUngroupId)
                return (
                    <div className={styles.confirmOverlay} onClick={() => setConfirmUngroupId(null)}>
                        <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.confirmIcon} style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}>
                                <FolderOpen size={22} />
                            </div>
                            <h3 className={styles.confirmTitle}>Bỏ khỏi nhóm?</h3>
                            <p className={styles.confirmDesc}>
                                {nb ? <><strong>{nb.name}</strong> sẽ được chuyển về danh sách sổ tay không có nhóm.</> : "Sổ tay sẽ được chuyển về danh sách không có nhóm."}
                            </p>
                            <div className={styles.confirmActions}>
                                <button
                                    type="button"
                                    className={styles.confirmCancel}
                                    onClick={() => setConfirmUngroupId(null)}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className={styles.confirmDelete}
                                    style={{ background: "var(--color-primary)" }}
                                    onClick={() => handleConfirmUngroup(confirmUngroupId)}
                                >
                                    Bỏ khỏi nhóm
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })()}

            {/* Rename notebook modal */}
            {renameNotebookId !== null && (() => {
                const nb = notebooks.find((n) => n.id === renameNotebookId)
                return nb ? (
                    <RenameNotebookModal
                        currentName={nb.name}
                        onClose={() => setRenameNotebookId(null)}
                        onSave={(newName) => handleRenameNotebook(renameNotebookId, newName)}
                    />
                ) : null
            })()}

            {/* Move notebook modal */}
            {moveNotebookId !== null && (
                <MoveNotebookModal
                    notebook={notebooks.find((nb) => nb.id === moveNotebookId)!}
                    groups={groups}
                    onClose={() => setMoveNotebookId(null)}
                    onMove={(gid) => handleMoveNotebook(moveNotebookId, gid)}
                />
            )}

            <Footer />
        </div>
    )
}

/* ── Notebook card ── */

type NotebookCardProps = {
    notebook: NotebookWithCount
    colorIndex: number
    groups: NotebookGroup[]
    onOpen: () => void
    onPractice: () => void
    onDelete: () => void
    onRename: () => void
    onMove: (groupId: string | null) => void
    deleting: boolean
    menuOpen: boolean
    onMenuToggle: () => void
}

function NotebookCard({
    notebook,
    colorIndex,
    groups,
    onOpen,
    onPractice,
    onDelete,
    onRename,
    onMove,
    deleting,
    menuOpen,
    onMenuToggle,
}: NotebookCardProps) {
    const color = getCardStyle(colorIndex)

    return (
        <div className={styles.card} data-menu={notebook.id}>
            <div className={styles.cardBookmark} style={{ color: color.text }} />
            <div className={styles.cardTop} onClick={onOpen}>
                <div className={styles.cardIcon} style={{ background: color.bg }}>
                    {React.createElement(CARD_ICONS[colorIndex % CARD_ICONS.length], { size: 22, style: { color: color.text } })}
                </div>
                <h3 className={styles.cardName}>{notebook.name}</h3>
                <p className={styles.cardCount}>{notebook.item_count} từ</p>
                <p className={styles.cardReviewLine}>
                    <span className={styles.reviewDot} style={{ background: color.text }} />
                    0 từ cần ôn hôm nay
                </p>
            </div>
            <div className={styles.cardFooter}>
                <button
                    type="button"
                    className={styles.cardOntapBtn}
                    style={{ background: color.bg, color: color.text }}
                    onClick={onPractice}
                >
                    Ôn tập
                </button>
                <div className={styles.cardMenuWrap}>
                    <button
                        type="button"
                        className={styles.cardMenuBtn}
                        onClick={(e) => { e.stopPropagation(); onMenuToggle() }}
                        title="Tùy chọn"
                        disabled={deleting}
                    >
                        <MoreHorizontal size={14} />
                    </button>
                    {menuOpen && (
                        <div className={styles.cardMenu} onClick={(e) => e.stopPropagation()}>
                            {groups.length > 0 && (
                                <div className={styles.cardMenuGroup}>
                                    <p className={styles.cardMenuLabel}>Chuyển vào nhóm</p>
                                    {groups.map((g) => (
                                        <button
                                            key={g.id}
                                            type="button"
                                            className={`${styles.cardMenuItem} ${notebook.group_id === g.id ? styles.cardMenuItemActive : ""}`}
                                            onClick={() => onMove(notebook.group_id === g.id ? null : g.id)}
                                        >
                                            <FolderOpen size={13} />
                                            {g.name}
                                            {notebook.group_id === g.id && <span className={styles.cardMenuCheck}>✓</span>}
                                        </button>
                                    ))}
                                    {notebook.group_id && (
                                        <button
                                            type="button"
                                            className={styles.cardMenuItem}
                                            onClick={() => onMove(null)}
                                        >
                                            <X size={13} />
                                            Bỏ khỏi nhóm
                                        </button>
                                    )}
                                    <div className={styles.cardMenuDivider} />
                                </div>
                            )}
                            <button
                                type="button"
                                className={styles.cardMenuItem}
                                onClick={onRename}
                            >
                                <Pencil size={13} />
                                Đổi tên
                            </button>
                            <button
                                type="button"
                                className={`${styles.cardMenuItem} ${styles.cardMenuItemDanger}`}
                                onClick={onDelete}
                            >
                                <Trash2 size={13} />
                                Xóa sổ tay
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ── Rename notebook modal ── */

function RenameNotebookModal({
    currentName,
    onClose,
    onSave,
}: {
    currentName: string
    onClose: () => void
    onSave: (newName: string) => void
}) {
    const [name, setName] = useState(currentName)
    const [loading, setLoading] = useState(false)
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
        setLoading(true)
        try { onSave(trimmed) } finally { setLoading(false) }
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
                        className={styles.renameModalInput}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={80}
                        disabled={loading}
                        placeholder="Tên sổ tay..."
                    />
                    <div className={styles.confirmActions}>
                        <button type="button" className={styles.confirmCancel} onClick={onClose}>Hủy</button>
                        <button
                            type="submit"
                            className={styles.confirmDelete}
                            style={{ background: "var(--color-primary)" }}
                            disabled={!name.trim() || loading}
                        >
                            {loading ? "..." : "Lưu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/* ── Move notebook modal ── */

function MoveNotebookModal({
    notebook,
    groups,
    onClose,
    onMove,
}: {
    notebook: NotebookWithCount
    groups: NotebookGroup[]
    onClose: () => void
    onMove: (groupId: string | null) => void
}) {
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onClose])

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Chuyển &ldquo;{notebook.name}&rdquo; vào nhóm</h2>
                    <button type="button" className={styles.modalClose} onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <div className={styles.moveList}>
                    {notebook.group_id && (
                        <button type="button" className={styles.moveItem} onClick={() => onMove(null)}>
                            <X size={16} />
                            Bỏ khỏi nhóm
                        </button>
                    )}
                    {groups.map((g) => (
                        <button
                            key={g.id}
                            type="button"
                            className={`${styles.moveItem} ${notebook.group_id === g.id ? styles.moveItemActive : ""}`}
                            onClick={() => onMove(g.id)}
                        >
                            <FolderOpen size={16} />
                            {g.name}
                            {notebook.group_id === g.id && <span className={styles.moveCheck}>✓</span>}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ── Practice mode modal ── */

const PRACTICE_MODES = [
    { id: "flashcard", Icon: CreditCard, title: "FlashCard", desc: "Ôn tập từ vựng bằng thẻ lật", color: "#2563eb", bg: "#eff6ff" },
    { id: "quiz", Icon: HelpCircle, title: "Trắc nghiệm", desc: "Chọn đáp án đúng trong 4 lựa chọn", color: "#7c3aed", bg: "#f5f3ff" },
    { id: "writing", Icon: PenLine, title: "Luyện viết", desc: "Nhìn nghĩa, gõ lại từ tiếng Nhật", color: "#0891b2", bg: "#ecfeff" },
    { id: "minitest", Icon: ClipboardList, title: "Mini Test", desc: "Bài kiểm tra ngắn có tính giờ", color: "#b45309", bg: "#fffbeb" },
]

function PracticeModeModal({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (mode: string) => void }) {
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
    onRename: (newName: string) => Promise<void>
}

function NotebookDetail({ notebook, onDelete, onPractice, onRename }: NotebookDetailProps) {
    const { items, loading, mutate } = useNotebookItems(notebook.id)
    const [removingId, setRemovingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState(false)
    const [editName, setEditName] = useState(notebook.name)
    const [saveLoading, setSaveLoading] = useState(false)
    const editInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (editingName) editInputRef.current?.focus()
    }, [editingName])

    async function handleSaveName(e: FormEvent) {
        e.preventDefault()
        const name = editName.trim()
        if (!name || name === notebook.name) { setEditingName(false); return }
        setSaveLoading(true)
        try {
            await onRename(name)
        } finally {
            setSaveLoading(false)
            setEditingName(false)
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

    return (
        <div className={styles.detailWrap}>
            <div className={styles.detailHeader}>
                <div className={styles.detailLeft}>
                    {editingName ? (
                        <form className={styles.renameTitleForm} onSubmit={handleSaveName}>
                            <input
                                ref={editInputRef}
                                className={styles.renameTitleInput}
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                maxLength={80}
                                disabled={saveLoading}
                                onKeyDown={(e) => { if (e.key === "Escape") { setEditingName(false); setEditName(notebook.name) } }}
                            />
                            <button
                                type="submit"
                                className={styles.renameTitleSave}
                                disabled={!editName.trim() || saveLoading}
                            >
                                {saveLoading ? "..." : "Lưu"}
                            </button>
                            <button
                                type="button"
                                className={styles.renameTitleCancel}
                                onClick={() => { setEditingName(false); setEditName(notebook.name) }}
                            >
                                Hủy
                            </button>
                        </form>
                    ) : (
                        <div className={styles.detailTitleRow}>
                            <h1 className={styles.detailTitle}>{notebook.name}</h1>
                            <button
                                type="button"
                                className={styles.detailEditBtn}
                                onClick={() => { setEditName(notebook.name); setEditingName(true) }}
                                title="Đổi tên sổ tay"
                            >
                                <Pencil size={14} />
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
                        <li key={item.id} className={`${styles.itemCard} ${styles[`accent_${item.item_type}`]}`}>
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
