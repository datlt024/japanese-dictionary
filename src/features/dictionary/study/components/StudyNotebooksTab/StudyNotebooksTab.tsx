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
    BookOpen,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    FolderOpen,
    Lightbulb,
    LogIn,
    Pencil,
    Plus,
    Trash2,
} from "lucide-react"
import { Button, Input, Skeleton, Typography } from "antd"
import type { InputRef } from "antd"
import { PlusOutlined } from "@ant-design/icons"

import { useAuth } from "@/shared/hooks/useAuth"
import AuthModal from "@/shared/components/AuthModal"
import { useNotebooks } from "@/shared/hooks/useNotebooks"
import { useNotebookGroups } from "@/shared/hooks/useNotebookGroups"
import NotebookListCard from "./NotebookListCard"
import NotebookDetailView from "./NotebookDetailView"
import NotebookSidebarWidgets from "./NotebookSidebarWidgets"
import NotebookOverviewStats from "./NotebookOverviewStats"
import NotebookToolbar from "./NotebookToolbar"
import PracticeModeModal from "./PracticeModeModal"
import RenameModal from "./RenameModal"
import ConfirmDialog from "./ConfirmDialog"
import { useNotebookCrud } from "./useNotebookCrud"
import styles from "./StudyNotebooksTab.module.css"

const { Text } = Typography

/* ── Constants ─────────────────────────────────────────────── */

const PAGE_SIZE = 10
const SORT_KEY  = "notebookSortOrder"
const VALID_SORTS = ["newest", "oldest", "az", "za"] as const
type SortOrder = typeof VALID_SORTS[number]

/* ── Helpers ───────────────────────────────────────────────── */

function LoadingSkeleton() {
    return (
        <div className={styles.skeletonWrap}>
            {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} active paragraph={{ rows: 1 }} />
            ))}
        </div>
    )
}

function normalizeForSort(name: string): string {
    const kanjiMap: Record<string, number> = {
        "〇": 0, "一": 1, "二": 2, "三": 3, "四": 4,
        "五": 5, "六": 6, "七": 7, "八": 8, "九": 9,
        "十": 10, "百": 100, "千": 1000,
    }
    return name.replace(/[〇一二三四五六七八九十百千]+/g, (match) => {
        let value = 0; let current = 0
        for (const ch of match) {
            const v = kanjiMap[ch]
            if (v === undefined) break
            if (v >= 10) { value += (current === 0 ? 1 : current) * v; current = 0 }
            else { current = v }
        }
        return String(value + current)
    })
}

function compareByName(a: string, b: string) {
    return normalizeForSort(a).localeCompare(normalizeForSort(b), ["vi", "ja", "en"], { numeric: true, caseFirst: "lower" })
}

/* ── Main component ─────────────────────────────────────────── */

export default function StudyNotebooksTab() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const { notebooks, loading: notebooksLoading, error: notebooksError, mutate: mutateNotebooks } = useNotebooks(!!user)
    const { groups,    loading: groupsLoading,    error: groupsError,    mutate: mutateGroups }    = useNotebookGroups(!!user)

    const crud = useNotebookCrud({
        notebooks,
        mutateNotebooks,
        mutateGroups,
        onSelectClear: (id) => { if (selectedId === id) { setSelectedId(null); setView("list") } },
    })

    const [view,       setView]       = useState<"list" | "detail">("list")
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const [creating,        setCreating]        = useState(false)
    const [createInGroupId, setCreateInGroupId] = useState<string | null>(null)
    const [newName,         setNewName]         = useState("")

    const [creatingGroup, setCreatingGroup] = useState(false)
    const [newGroupName,  setNewGroupName]  = useState("")

    const [practiceId,          setPracticeId]          = useState<string | null>(null)
    const [renameId,            setRenameId]            = useState<string | null>(null)
    const [confirmDeleteId,     setConfirmDeleteId]     = useState<string | null>(null)
    const [confirmDeleteGroupId,setConfirmDeleteGroupId]= useState<string | null>(null)
    const [confirmUngroupId,    setConfirmUngroupId]    = useState<string | null>(null)

    const [page,           setPage]           = useState(1)
    const [collapsedGroups,setCollapsedGroups]= useState<Set<string>>(new Set())
    const [menuOpenId,     setMenuOpenId]     = useState<string | null>(null)
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
    const [editGroupName,  setEditGroupName]  = useState("")
    const [authModalOpen,  setAuthModalOpen]  = useState(false)

    const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
        if (typeof window === "undefined") return "newest"
        const saved = localStorage.getItem(SORT_KEY)
        return (VALID_SORTS as readonly string[]).includes(saved ?? "") ? saved as SortOrder : "newest"
    })

    const { data: practiceSessions } = useSWR<Array<{ known_ids: string[]; unknown_ids: string[]; total_items: number }>>(
        user ? "/api/practice/sessions" : null,
        (url: string) => fetch(url).then(r => r.ok ? r.json() : []),
        { revalidateOnFocus: false, dedupingInterval: 60_000 }
    )

    const practiceStats = useMemo(() => {
        if (!practiceSessions?.length) return { knownCount: 0, ratio: "—" }
        const knownSet = new Set<string>(); const unknownSet = new Set<string>()
        for (const s of practiceSessions) for (const id of s.known_ids) knownSet.add(id)
        for (const s of practiceSessions) for (const id of s.unknown_ids) { if (!knownSet.has(id)) unknownSet.add(id) }
        const total = knownSet.size + unknownSet.size
        return { knownCount: knownSet.size, ratio: total > 0 ? `${Math.round(knownSet.size / total * 100)}%` : "—" }
    }, [practiceSessions])

    const createInputRef      = useRef<InputRef | null>(null)
    const createGroupInputRef = useRef<InputRef | null>(null)
    const editGroupInputRef   = useRef<InputRef | null>(null)

    useEffect(() => { if (creating)      createInputRef.current?.focus()      }, [creating])
    useEffect(() => { if (creatingGroup) createGroupInputRef.current?.focus() }, [creatingGroup])
    useEffect(() => {
        if (!menuOpenId) return
        function handler(e: MouseEvent) {
            if (!(e.target as Element).closest(`[data-menu="${menuOpenId}"]`)) setMenuOpenId(null)
        }
        document.addEventListener("click", handler)
        return () => document.removeEventListener("click", handler)
    }, [menuOpenId])

    const selectedNotebook = notebooks.find(nb => nb.id === selectedId) ?? null

    function handleSortChange(order: SortOrder) {
        setSortOrder(order); localStorage.setItem(SORT_KEY, order); setPage(1)
    }

    const sorted = [...notebooks].sort((a, b) => {
        if (sortOrder === "az")     return compareByName(a.name, b.name)
        if (sortOrder === "za")     return compareByName(b.name, a.name)
        if (sortOrder === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    const totalPages     = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
    const safePage       = Math.min(page, totalPages)
    const pagedNotebooks = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
    const ungrouped      = pagedNotebooks.filter(nb => !nb.group_id)
    const byGroup        = (gid: string) => pagedNotebooks.filter(nb => nb.group_id === gid)
    const sortedGroups   = [...groups].sort((a, b) => {
        if (sortOrder === "az") return compareByName(a.name, b.name)
        if (sortOrder === "za") return compareByName(b.name, a.name)
        return 0
    }).filter(g => pagedNotebooks.some(nb => nb.group_id === g.id))

    function toggleGroup(id: string) {
        setCollapsedGroups(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id); else next.add(id)
            return next
        })
    }

    function handleSelectMode(mode: string) {
        if (!practiceId) return
        const id = practiceId; setPracticeId(null)
        router.push(`/notebooks/${id}/practice?mode=${mode}`)
    }

    async function handleCreate(e: FormEvent, groupId?: string | null) {
        e.preventDefault()
        const name = newName.trim()
        const err = await crud.handleCreate(name, groupId ?? null)
        if (!err) { setCreating(false); setCreateInGroupId(null); setNewName(""); setPage(1) }
    }

    async function handleCreateGroup(e: FormEvent) {
        e.preventDefault()
        const name = newGroupName.trim()
        const created = await crud.handleCreateGroup(name)
        if (created) {
            setCollapsedGroups(prev => { const next = new Set(prev); next.delete(created.id); return next })
            setCreatingGroup(false); setNewGroupName("")
        }
    }

    async function handleRenameGroup(e: FormEvent) {
        e.preventDefault()
        if (!editingGroupId) return
        const name = editGroupName.trim()
        if (!name) { setEditingGroupId(null); return }
        await crud.handleRenameGroup(editingGroupId, name)
        setEditingGroupId(null)
    }

    async function handleMoveNotebook(notebookId: string, groupId: string | null) {
        setMenuOpenId(null)
        if (groupId === null) { setConfirmUngroupId(notebookId); return }
        await crud.handleMoveNotebook(notebookId, groupId)
    }

    /* ── Render guards ── */

    if (authLoading) return <LoadingSkeleton />

    if (!user) {
        return (
            <>
                <div className={styles.loginPrompt}>
                    <LogIn size={32} className={styles.loginIcon} />
                    <p className={styles.loginTitle}>Đăng nhập để xem sổ tay của bạn</p>
                    <p className={styles.loginDesc}>Lưu từ vựng, hán tự và ngữ pháp vào sổ tay để ôn luyện mọi lúc.</p>
                    <Button type="primary" onClick={() => setAuthModalOpen(true)}>Đăng nhập</Button>
                </div>
                <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
            </>
        )
    }

    if (notebooksLoading || groupsLoading) return <LoadingSkeleton />

    if (notebooksError || groupsError) {
        return (
            <div className={styles.loginPrompt}>
                <p className={styles.loginTitle}>Không thể tải dữ liệu</p>
                <p className={styles.loginDesc}>Đã xảy ra lỗi khi kết nối. Vui lòng thử lại.</p>
                <Button type="primary" onClick={() => { mutateNotebooks(); mutateGroups() }}>
                    Thử lại
                </Button>
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
                    onRename={name => crud.handleRenameNotebook(selectedNotebook.id, name)}
                />
                <PracticeModeModal open={practiceId !== null} onClose={() => setPracticeId(null)} onSelect={handleSelectMode} />
                {confirmDeleteId !== null && (
                    <ConfirmDialog
                        icon={<Trash2 size={22} />}
                        title="Xóa sổ tay?"
                        desc="Hành động này không thể hoàn tác. Tất cả từ trong sổ tay sẽ bị xóa vĩnh viễn."
                        okLabel="Xóa"
                        okStyle={{ background: "var(--color-danger)" }}
                        loading={crud.deletingNbId === confirmDeleteId}
                        onCancel={() => setConfirmDeleteId(null)}
                        onOk={async () => { await crud.handleDeleteNotebook(confirmDeleteId); setConfirmDeleteId(null) }}
                    />
                )}
            </>
        )
    }

    /* ── List view ── */

    const totalItems = notebooks.reduce((sum, nb) => sum + nb.item_count, 0)

    return (
        <>
            <div className={styles.layout}>
                <main className={styles.mainCol}>
                {/* ── Tổng quan ── */}
                <NotebookOverviewStats
                    notebookCount={notebooks.length}
                    totalItems={totalItems}
                    knownCount={practiceStats.knownCount}
                    ratio={practiceStats.ratio}
                />

                {/* ── Toolbar ── */}
                <NotebookToolbar
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                    creatingGroup={creatingGroup}
                    creating={creating}
                    onCreateGroup={() => setCreatingGroup(true)}
                    onCreate={() => { setCreating(true); setCreateInGroupId(null) }}
                />

                {/* Form tạo nhóm */}
                {creatingGroup && (
                    <form className={styles.createForm} onSubmit={handleCreateGroup}>
                        <FolderOpen size={15} className={styles.createFormIcon} />
                        <Input
                            ref={createGroupInputRef}
                            placeholder="Tên nhóm..."
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            maxLength={80}
                            disabled={crud.createGroupLoading}
                            style={{ flex: 1 }}
                        />
                        <Button type="primary" htmlType="submit" loading={crud.createGroupLoading} disabled={!newGroupName.trim()}>
                            Tạo
                        </Button>
                        <Button onClick={() => { setCreatingGroup(false); setNewGroupName("") }}>Hủy</Button>
                    </form>
                )}

                {/* Form tạo sổ tay (không nhóm) */}
                {creating && createInGroupId === null && (
                    <div>
                        <form className={styles.createForm} onSubmit={e => handleCreate(e, null)}>
                            <Input
                                ref={createInputRef}
                                placeholder="Tên sổ tay..."
                                value={newName}
                                onChange={e => { setNewName(e.target.value); crud.setCreateError(null) }}
                                maxLength={80}
                                disabled={crud.createLoading}
                                status={crud.createError ? "error" : undefined}
                                style={{ flex: 1 }}
                            />
                            <Button type="primary" htmlType="submit" loading={crud.createLoading} disabled={!newName.trim()}>
                                Tạo
                            </Button>
                            <Button onClick={() => { setCreating(false); setNewName(""); crud.setCreateError(null) }}>Hủy</Button>
                        </form>
                        {crud.createError && <Text type="danger" style={{ fontSize: 12 }}>{crud.createError}</Text>}
                    </div>
                )}

                {notebooks.length === 0 && !creating ? (
                    <div className={styles.emptyWrap}>
                        <BookOpen size={36} className={styles.emptyIcon} />
                        <p className={styles.emptyTitle}>Bạn chưa có sổ tay nào</p>
                        <p className={styles.emptyDesc}>Hãy tạo sổ tay và thêm từ để bắt đầu ôn luyện.</p>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>
                            Tạo sổ tay
                        </Button>
                    </div>
                ) : (
                    <div className={styles.lists}>
                        {/* Nhóm */}
                        {sortedGroups.map(group => {
                            const children  = byGroup(group.id)
                            const isExpanded = !collapsedGroups.has(group.id)
                            return (
                                <div key={group.id} className={styles.groupSection}>
                                    <div className={styles.groupHeader}>
                                        {editingGroupId === group.id ? (
                                            <form className={styles.editGroupForm} onSubmit={handleRenameGroup}>
                                                <Input
                                                    ref={editGroupInputRef}
                                                    value={editGroupName}
                                                    onChange={e => setEditGroupName(e.target.value)}
                                                    maxLength={80}
                                                    disabled={crud.renameGroupLoading}
                                                    autoFocus
                                                    onKeyDown={e => { if (e.key === "Escape") setEditingGroupId(null) }}
                                                    style={{ width: 200 }}
                                                />
                                                <Button type="primary" htmlType="submit" size="small" loading={crud.renameGroupLoading} disabled={!editGroupName.trim()}>
                                                    {crud.renameGroupLoading ? "..." : "Lưu"}
                                                </Button>
                                                <Button size="small" onClick={() => setEditingGroupId(null)}>Hủy</Button>
                                            </form>
                                        ) : (
                                            <>
                                            <Button type="text" className={styles.groupToggle} onClick={() => toggleGroup(group.id)}>
                                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                <FolderOpen size={14} className={styles.groupFolderIcon} />
                                                <span className={styles.groupName}>{group.name}</span>
                                                <span className={styles.groupCount}>{children.length} sổ tay</span>
                                            </Button>
                                            <div className={styles.groupActions}>
                                                <Button type="text" size="small" icon={<Pencil size={13} />} title="Đổi tên nhóm"
                                                    onClick={() => { setEditingGroupId(group.id); setEditGroupName(group.name) }}
                                                    className={styles.groupAddBtn}
                                                />
                                                <Button type="text" size="small" icon={<Plus size={13} />} title="Thêm sổ tay vào nhóm"
                                                    onClick={() => { setCreateInGroupId(group.id); setCreating(true); setNewName(""); if (!isExpanded) toggleGroup(group.id) }}
                                                    className={styles.groupAddBtn}
                                                />
                                                <Button type="text" size="small" danger icon={<Trash2 size={13} />} title="Xóa nhóm"
                                                    onClick={() => setConfirmDeleteGroupId(group.id)}
                                                    loading={crud.deletingGroupId === group.id}
                                                    className={styles.groupDeleteBtn}
                                                />
                                            </div>
                                            </>
                                        )}
                                    </div>

                                    {isExpanded && (
                                        <div className={styles.groupBody}>
                                            {creating && createInGroupId === group.id && (
                                                <div>
                                                    <form className={styles.createFormInline} onSubmit={e => handleCreate(e, group.id)}>
                                                        <Input
                                                            ref={createInputRef}
                                                            placeholder="Tên sổ tay..."
                                                            value={newName}
                                                            onChange={e => { setNewName(e.target.value); crud.setCreateError(null) }}
                                                            maxLength={80}
                                                            disabled={crud.createLoading}
                                                            status={crud.createError ? "error" : undefined}
                                                            autoFocus
                                                            style={{ flex: 1 }}
                                                        />
                                                        <Button type="primary" htmlType="submit" size="small" loading={crud.createLoading} disabled={!newName.trim()}>
                                                            Tạo
                                                        </Button>
                                                        <Button size="small" onClick={() => { setCreating(false); setCreateInGroupId(null); setNewName(""); crud.setCreateError(null) }}>
                                                            Hủy
                                                        </Button>
                                                    </form>
                                                    {crud.createError && <Text type="danger" style={{ fontSize: 12 }}>{crud.createError}</Text>}
                                                </div>
                                            )}
                                            <div className={styles.grid}>
                                                {children.map((nb, i) => (
                                                    <NotebookListCard key={nb.id} nb={nb} index={i} groups={groups}
                                                        onOpen={() => { setSelectedId(nb.id); setView("detail") }}
                                                        onPractice={() => setPracticeId(nb.id)}
                                                        onDelete={() => setConfirmDeleteId(nb.id)}
                                                        onRename={() => setRenameId(nb.id)}
                                                        onMove={gid => handleMoveNotebook(nb.id, gid)}
                                                        menuOpen={menuOpenId === nb.id}
                                                        onMenuToggle={() => setMenuOpenId(menuOpenId === nb.id ? null : nb.id)} />
                                                ))}
                                                {children.length === 0 && !(creating && createInGroupId === group.id) && (
                                                    <Button
                                                        type="dashed"
                                                        icon={<Plus size={14} />}
                                                        onClick={() => { setCreateInGroupId(group.id); setCreating(true); setNewName("") }}
                                                        className={styles.groupAddPlaceholder}
                                                    >
                                                        Thêm sổ tay
                                                    </Button>
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
                                {groups.length > 0 && <div className={styles.ungroupedLabel}>Không có nhóm</div>}
                                <div className={styles.grid}>
                                    {ungrouped.map((nb, i) => (
                                        <NotebookListCard key={nb.id} nb={nb} index={i} groups={groups}
                                            onOpen={() => { setSelectedId(nb.id); setView("detail") }}
                                            onPractice={() => setPracticeId(nb.id)}
                                            onDelete={() => setConfirmDeleteId(nb.id)}
                                            onRename={() => setRenameId(nb.id)}
                                            onMove={gid => handleMoveNotebook(nb.id, gid)}
                                            menuOpen={menuOpenId === nb.id}
                                            onMenuToggle={() => setMenuOpenId(menuOpenId === nb.id ? null : nb.id)} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Phân trang ── */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <Button
                            icon={<ChevronLeft size={14} />}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            className={styles.pageBtn}
                        >
                            Trước
                        </Button>
                        <span className={styles.pageInfo}>{safePage} / {totalPages}</span>
                        <Button
                            iconPosition="end"
                            icon={<ChevronRight size={14} />}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                            className={styles.pageBtn}
                        >
                            Tiếp
                        </Button>
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

                <NotebookSidebarWidgets
                    userId={user.id}
                    totalItems={totalItems}
                    firstNotebookId={notebooks[0]?.id ?? null}
                    onStartPractice={() => notebooks.length > 0 && setPracticeId(notebooks[0].id)}
                    onViewFirst={() => { setSelectedId(notebooks[0].id); setView("detail") }}
                />
            </div>

            {/* ── Modals & dialogs ── */}

            <PracticeModeModal open={practiceId !== null} onClose={() => setPracticeId(null)} onSelect={handleSelectMode} />

            {renameId !== null && (() => {
                const nb = notebooks.find(n => n.id === renameId)
                return nb ? (
                    <RenameModal currentName={nb.name}
                        onClose={() => setRenameId(null)}
                        onSave={name => crud.handleRenameNotebook(renameId, name).then(err => { if (!err) setRenameId(null); return err })} />
                ) : null
            })()}

            {confirmDeleteId !== null && (
                <ConfirmDialog icon={<Trash2 size={22} />}
                    title="Xóa sổ tay?"
                    desc="Hành động này không thể hoàn tác. Tất cả từ trong sổ tay sẽ bị xóa vĩnh viễn."
                    okLabel="Xóa" okStyle={{ background: "var(--color-danger)" }}
                    loading={crud.deletingNbId === confirmDeleteId}
                    onCancel={() => setConfirmDeleteId(null)}
                    onOk={async () => { await crud.handleDeleteNotebook(confirmDeleteId); setConfirmDeleteId(null) }} />
            )}

            {confirmDeleteGroupId !== null && (
                <ConfirmDialog icon={<Trash2 size={22} />}
                    title="Xóa nhóm?"
                    desc="Các sổ tay trong nhóm sẽ không bị xóa mà chuyển về danh sách không có nhóm."
                    okLabel="Xóa nhóm" okStyle={{ background: "var(--color-danger)" }}
                    loading={crud.deletingGroupId === confirmDeleteGroupId}
                    onCancel={() => setConfirmDeleteGroupId(null)}
                    onOk={async () => { await crud.handleDeleteGroup(confirmDeleteGroupId); setConfirmDeleteGroupId(null) }} />
            )}

            {confirmUngroupId !== null && (() => {
                const nb = notebooks.find(n => n.id === confirmUngroupId)
                return (
                    <ConfirmDialog icon={<FolderOpen size={22} />}
                        iconStyle={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
                        title="Bỏ khỏi nhóm?"
                        desc={nb ? <><strong>{nb.name}</strong> sẽ được chuyển về danh sách không có nhóm.</> : "Sổ tay sẽ được chuyển về danh sách không có nhóm."}
                        okLabel="Bỏ khỏi nhóm" okStyle={{ background: "var(--color-primary)" }}
                        onCancel={() => setConfirmUngroupId(null)}
                        onOk={() => crud.handleUngroup(confirmUngroupId).then(() => setConfirmUngroupId(null))} />
                )
            })()}
        </>
    )
}
