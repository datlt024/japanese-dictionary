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
    PlusCircle,
    Trash2,
} from "lucide-react"

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

/* ── Constants ─────────────────────────────────────────────── */

const PAGE_SIZE = 10
const SORT_KEY  = "notebookSortOrder"
const VALID_SORTS = ["newest", "oldest", "az", "za"] as const
type SortOrder = typeof VALID_SORTS[number]

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
        if (!practiceSessions?.length) return { knownCount: null as number | null, ratio: "—", dueCount: null as number | null }
        // Sessions arrive newest-first from the API; first-seen result per item is the most recent one.
        const itemResult = new Map<string, "known" | "unknown">()
        for (const s of practiceSessions) {
            for (const id of s.known_ids)   if (!itemResult.has(id)) itemResult.set(id, "known")
            for (const id of s.unknown_ids) if (!itemResult.has(id)) itemResult.set(id, "unknown")
        }
        const knownCount = [...itemResult.values()].filter(v => v === "known").length
        const total = itemResult.size
        const ratio = total > 0 ? `${Math.round(knownCount / total * 100)}%` : "—"
        return { knownCount, ratio, dueCount: null as number | null }
    }, [practiceSessions])

    const createInputRef      = useRef<HTMLInputElement>(null)
    const createGroupInputRef = useRef<HTMLInputElement>(null)
    const editGroupInputRef   = useRef<HTMLInputElement>(null)

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
    const knownGroupIds  = new Set(groups.map(g => g.id))
    // Notebooks whose group_id doesn't match any loaded group are treated as ungrouped
    // so they're never invisible (e.g. when the groups API returns empty).
    const ungrouped      = pagedNotebooks.filter(nb => !nb.group_id || !knownGroupIds.has(nb.group_id))
    // byGroup uses all notebooks (not just paged) so count and membership are always accurate
    const byGroup        = (gid: string) => notebooks.filter(nb => nb.group_id === gid)
    const sortedGroups   = [...groups].sort((a, b) => {
        if (sortOrder === "az") return compareByName(a.name, b.name)
        if (sortOrder === "za") return compareByName(b.name, a.name)
        return 0
    })

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
                <button type="button" className={styles.loginBtn}
                    onClick={() => { mutateNotebooks(); mutateGroups() }}>
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
    // Items due = total - last-known; if no session data yet, show total (all need review)
    const dueCount = practiceStats.knownCount !== null
        ? Math.max(0, totalItems - practiceStats.knownCount)
        : totalItems

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
                        <input ref={createGroupInputRef} className={styles.createInput}
                            placeholder="Tên nhóm..." value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            maxLength={80} disabled={crud.createGroupLoading} />
                        <button className={styles.createSubmit} type="submit" disabled={!newGroupName.trim() || crud.createGroupLoading}>
                            {crud.createGroupLoading ? "..." : "Tạo"}
                        </button>
                        <button className={styles.createCancel} type="button"
                            onClick={() => { setCreatingGroup(false); setNewGroupName("") }}>
                            Hủy
                        </button>
                    </form>
                )}

                {/* Form tạo sổ tay (không nhóm) */}
                {creating && createInGroupId === null && (
                    <div>
                        <form className={styles.createForm} onSubmit={e => handleCreate(e, null)}>
                            <input ref={createInputRef}
                                className={`${styles.createInput} ${crud.createError ? styles.createInputError : ""}`}
                                placeholder="Tên sổ tay..." value={newName}
                                onChange={e => { setNewName(e.target.value); crud.setCreateError(null) }}
                                maxLength={80} disabled={crud.createLoading} />
                            <button className={styles.createSubmit} type="submit" disabled={!newName.trim() || crud.createLoading}>
                                {crud.createLoading ? "..." : "Tạo"}
                            </button>
                            <button className={styles.createCancel} type="button"
                                onClick={() => { setCreating(false); setNewName(""); crud.setCreateError(null) }}>
                                Hủy
                            </button>
                        </form>
                        {crud.createError && <p className={styles.formError}>{crud.createError}</p>}
                    </div>
                )}

                {notebooks.length === 0 && groups.length === 0 && !creating ? (
                    <div className={styles.emptyWrap}>
                        <BookOpen size={36} className={styles.emptyIcon} />
                        <p className={styles.emptyTitle}>Bạn chưa có sổ tay nào</p>
                        <p className={styles.emptyDesc}>Hãy tạo sổ tay và thêm từ để bắt đầu ôn luyện.</p>
                        <button type="button" className={styles.createBtn} onClick={() => setCreating(true)}>
                            <PlusCircle size={15} /> Tạo sổ tay
                        </button>
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
                                                <input ref={editGroupInputRef} className={styles.editGroupInput}
                                                    value={editGroupName}
                                                    onChange={e => setEditGroupName(e.target.value)}
                                                    maxLength={80} disabled={crud.renameGroupLoading} autoFocus
                                                    onKeyDown={e => { if (e.key === "Escape") setEditingGroupId(null) }} />
                                                <button className={styles.createSubmit} type="submit" disabled={!editGroupName.trim() || crud.renameGroupLoading}>
                                                    {crud.renameGroupLoading ? "..." : "Lưu"}
                                                </button>
                                                <button className={styles.createCancel} type="button" onClick={() => setEditingGroupId(null)}>Hủy</button>
                                            </form>
                                        ) : (
                                            <>
                                            <button type="button" className={styles.groupToggle} onClick={() => toggleGroup(group.id)}>
                                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                <FolderOpen size={14} className={styles.groupFolderIcon} />
                                                <span className={styles.groupName}>{group.name}</span>
                                                <span className={styles.groupCount}>{children.length} sổ tay</span>
                                            </button>
                                            <div className={styles.groupActions}>
                                                <button type="button" className={styles.groupAddBtn} title="Đổi tên nhóm"
                                                    onClick={() => { setEditingGroupId(group.id); setEditGroupName(group.name) }}>
                                                    <Pencil size={13} />
                                                </button>
                                                <button type="button" className={styles.groupAddBtn} title="Thêm sổ tay vào nhóm"
                                                    onClick={() => { setCreateInGroupId(group.id); setCreating(true); setNewName(""); if (!isExpanded) toggleGroup(group.id) }}>
                                                    <Plus size={13} />
                                                </button>
                                                <button type="button" className={styles.groupDeleteBtn} title="Xóa nhóm"
                                                    onClick={() => setConfirmDeleteGroupId(group.id)}
                                                    disabled={crud.deletingGroupId === group.id}>
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
                                                    <form className={styles.createFormInline} onSubmit={e => handleCreate(e, group.id)}>
                                                        <input ref={createInputRef}
                                                            className={`${styles.createInput} ${crud.createError ? styles.createInputError : ""}`}
                                                            placeholder="Tên sổ tay..." value={newName}
                                                            onChange={e => { setNewName(e.target.value); crud.setCreateError(null) }}
                                                            maxLength={80} disabled={crud.createLoading} autoFocus />
                                                        <button className={styles.createSubmit} type="submit" disabled={!newName.trim() || crud.createLoading}>
                                                            {crud.createLoading ? "..." : "Tạo"}
                                                        </button>
                                                        <button className={styles.createCancel} type="button"
                                                            onClick={() => { setCreating(false); setCreateInGroupId(null); setNewName(""); crud.setCreateError(null) }}>
                                                            Hủy
                                                        </button>
                                                    </form>
                                                    {crud.createError && <p className={styles.formError}>{crud.createError}</p>}
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
                                                    <button type="button" className={styles.groupAddPlaceholder}
                                                        onClick={() => { setCreateInGroupId(group.id); setCreating(true); setNewName("") }}>
                                                        <Plus size={14} /> Thêm sổ tay
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
                        <button type="button" className={styles.pageBtn}
                            onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>
                            <ChevronLeft size={14} /> Trước
                        </button>
                        <span className={styles.pageInfo}>{safePage} / {totalPages}</span>
                        <button type="button" className={styles.pageBtn}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
                            Tiếp <ChevronRight size={14} />
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

                <NotebookSidebarWidgets
                    userId={user.id}
                    dueCount={dueCount}
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
