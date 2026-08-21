"use client"

import { useState } from "react"
import {
    Search, X, Eye, EyeOff, Trash2, Pencil,
    ChevronDown, ChevronRight, Layers, BookOpen,
} from "lucide-react"
import styles from "@/app/admin/data/shared.module.css"
import nb from "./notebooks.module.css"

// ── Types ─────────────────────────────────────────────────────────────────────

type GroupRow = {
    id: string
    name: string
    description: string | null
    is_public: boolean
    public_description: string | null
    display_order: number
    user_id: string
    created_at: string
    notebook_count: number
}

type NotebookRow = {
    id: string
    name: string
    description: string | null
    group_id: string | null
    is_public: boolean
    public_category: string | null
    public_description: string | null
    display_order: number
    user_id: string
    created_at: string
    item_count: number
}

type Props = {
    initialGroups: GroupRow[]
    initialNotebooks: NotebookRow[]
}

const CATEGORIES = ["N5", "N4", "N3", "N2", "N1", "Tổng hợp", "Chủ đề", "Khác"]

// ── Modals ────────────────────────────────────────────────────────────────────

function GroupModal({ row, onClose, onSaved, onDeleted }: {
    row: GroupRow
    onClose: () => void
    onSaved: (g: GroupRow) => void
    onDeleted: (id: string) => void
}) {
    const [name, setName] = useState(row.name)
    const [publicDesc, setPublicDesc] = useState(row.public_description ?? "")
    const [displayOrder, setDisplayOrder] = useState(String(row.display_order))
    const [isPublic, setIsPublic] = useState(row.is_public)
    const [saving, setSaving] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function save() {
        const trimName = name.trim()
        if (!trimName) { setError("Tên nhóm không được để trống."); return }
        setSaving(true); setError(null)
        try {
            const res = await fetch(`/api/admin/groups/${row.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: trimName, is_public: isPublic, public_description: publicDesc.trim() || null, display_order: Number(displayOrder) || 0 }),
            })
            if (!res.ok) { setError("Lưu thất bại."); return }
            onSaved({ ...(await res.json() as GroupRow), notebook_count: row.notebook_count })
        } catch { setError("Đã xảy ra lỗi.") }
        finally { setSaving(false) }
    }

    async function doDelete() {
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/groups/${row.id}`, { method: "DELETE" })
            if (res.ok || res.status === 204) onDeleted(row.id)
            else { setError("Xóa thất bại."); setConfirmDelete(false) }
        } catch { setError("Đã xảy ra lỗi."); setConfirmDelete(false) }
        finally { setDeleting(false) }
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Chỉnh sửa nhóm sổ tay</h3>
                    <button type="button" className={styles.modalClose} onClick={onClose}><X size={16} /></button>
                </div>
                <div className={styles.modalForm}>
                    <label className={styles.checkRow}>
                        <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                        <span className={styles.checkLabel}>Hiển thị công khai trong tab Khám phá</span>
                    </label>
                    <div className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>Tên nhóm</span>
                        <input className={styles.fieldInput} value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className={styles.fieldRow2}>
                        <div className={styles.fieldRow}>
                            <span className={styles.fieldLabel}>Thứ tự hiển thị</span>
                            <input className={styles.fieldInput} type="number" min={0} value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} />
                        </div>
                        <div className={styles.fieldRow}>
                            <span className={styles.fieldLabel}>Số sổ tay con</span>
                            <input className={styles.fieldInput} value={row.notebook_count} disabled style={{ opacity: 0.5 }} />
                        </div>
                    </div>
                    <div className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>Mô tả công khai</span>
                        <textarea className={styles.fieldTextarea} rows={3} value={publicDesc}
                            onChange={e => setPublicDesc(e.target.value)}
                            placeholder="Mô tả ngắn hiển thị trong tab Khám phá..."
                            disabled={!isPublic} />
                    </div>
                </div>
                {error && <p className={styles.modalError}>{error}</p>}
                {confirmDelete && (
                    <div className={styles.deleteSection}>
                        <p className={styles.deleteWarn}>
                            Xóa nhóm <strong>{row.name}</strong>? Các sổ tay con sẽ không bị xóa nhưng sẽ không còn thuộc nhóm này. Không thể hoàn tác.
                        </p>
                        <div className={styles.deleteActions}>
                            <button type="button" className={styles.btnGhost} onClick={() => setConfirmDelete(false)}>Hủy</button>
                            <button type="button" className={styles.btnDanger} onClick={doDelete} disabled={deleting}>
                                {deleting ? "Đang xóa…" : "Xác nhận xóa"}
                            </button>
                        </div>
                    </div>
                )}
                <div className={styles.modalFooter}>
                    <button type="button" className={styles.btnDanger} onClick={() => setConfirmDelete(true)} disabled={saving || deleting}>
                        <Trash2 size={14} /> Xóa nhóm
                    </button>
                    <div className={styles.modalFooterRight}>
                        <button type="button" className={styles.btnGhost} onClick={onClose}>Hủy</button>
                        <button type="button" className={styles.btnPrimary} onClick={save} disabled={saving}>
                            {saving ? "Đang lưu…" : "Lưu"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function NotebookModal({ row, groups, groupIsPublic, onClose, onSaved, onDeleted }: {
    row: NotebookRow
    groups: GroupRow[]
    groupIsPublic: boolean
    onClose: () => void
    onSaved: (nb: NotebookRow) => void
    onDeleted: (id: string) => void
}) {
    const [name, setName] = useState(row.name)
    const [groupId, setGroupId] = useState(row.group_id ?? "")
    const [publicCategory, setPublicCategory] = useState(row.public_category ?? "")
    const [publicDesc, setPublicDesc] = useState(row.public_description ?? "")
    const [displayOrder, setDisplayOrder] = useState(String(row.display_order))
    const [isPublic, setIsPublic] = useState(row.is_public)
    const [saving, setSaving] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function save() {
        const trimName = name.trim()
        if (!trimName) { setError("Tên sổ tay không được để trống."); return }
        setSaving(true); setError(null)
        try {
            const res = await fetch(`/api/admin/notebooks/${row.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: trimName, is_public: isPublic,
                    group_id: groupId || null,
                    public_category: publicCategory || null,
                    public_description: publicDesc.trim() || null,
                    display_order: Number(displayOrder) || 0,
                }),
            })
            if (!res.ok) { setError("Lưu thất bại."); return }
            onSaved({ ...(await res.json() as NotebookRow), item_count: row.item_count })
        } catch { setError("Đã xảy ra lỗi.") }
        finally { setSaving(false) }
    }

    async function doDelete() {
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/notebooks/${row.id}`, { method: "DELETE" })
            if (res.ok || res.status === 204) onDeleted(row.id)
            else { setError("Xóa thất bại."); setConfirmDelete(false) }
        } catch { setError("Đã xảy ra lỗi."); setConfirmDelete(false) }
        finally { setDeleting(false) }
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Chỉnh sửa sổ tay</h3>
                    <button type="button" className={styles.modalClose} onClick={onClose}><X size={16} /></button>
                </div>
                <div className={styles.modalForm}>
                    <label className={styles.checkRow}>
                        <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                        <span className={styles.checkLabel}>
                            Hiển thị công khai trong tab Khám phá
                            {groupIsPublic && !isPublic && (
                                <span style={{ marginLeft: 6, fontSize: 11, color: "var(--color-text-muted)", fontWeight: 500 }}>
                                    (nhóm cha đang công khai nhưng sổ này sẽ bị ẩn)
                                </span>
                            )}
                        </span>
                    </label>
                    <div className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>Tên sổ tay</span>
                        <input className={styles.fieldInput} value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>Thuộc nhóm</span>
                        <select className={styles.fieldSelect} value={groupId} onChange={e => setGroupId(e.target.value)}>
                            <option value="">— Không thuộc nhóm nào —</option>
                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                    {!groupId && (
                        <div className={styles.fieldRow}>
                            <span className={styles.fieldLabel}>Danh mục công khai</span>
                            <select className={styles.fieldSelect} value={publicCategory}
                                onChange={e => setPublicCategory(e.target.value)} disabled={!isPublic}>
                                <option value="">— Chưa phân loại —</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    )}
                    <div className={styles.fieldRow2}>
                        <div className={styles.fieldRow}>
                            <span className={styles.fieldLabel}>{groupId ? "Thứ tự trong nhóm" : "Thứ tự hiển thị"}</span>
                            <input className={styles.fieldInput} type="number" min={0} value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} />
                        </div>
                        <div className={styles.fieldRow}>
                            <span className={styles.fieldLabel}>Số mục từ vựng</span>
                            <input className={styles.fieldInput} value={row.item_count} disabled style={{ opacity: 0.5 }} />
                        </div>
                    </div>
                    <div className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>Mô tả công khai</span>
                        <textarea className={styles.fieldTextarea} rows={3} value={publicDesc}
                            onChange={e => setPublicDesc(e.target.value)}
                            placeholder="Mô tả ngắn hiển thị trong tab Khám phá..." />
                    </div>
                </div>
                {error && <p className={styles.modalError}>{error}</p>}
                {confirmDelete && (
                    <div className={styles.deleteSection}>
                        <p className={styles.deleteWarn}>
                            Xóa sổ tay <strong>{row.name}</strong>? {row.item_count} mục từ vựng cũng sẽ bị xóa. Không thể hoàn tác.
                        </p>
                        <div className={styles.deleteActions}>
                            <button type="button" className={styles.btnGhost} onClick={() => setConfirmDelete(false)}>Hủy</button>
                            <button type="button" className={styles.btnDanger} onClick={doDelete} disabled={deleting}>
                                {deleting ? "Đang xóa…" : "Xác nhận xóa"}
                            </button>
                        </div>
                    </div>
                )}
                <div className={styles.modalFooter}>
                    <button type="button" className={styles.btnDanger} onClick={() => setConfirmDelete(true)} disabled={saving || deleting}>
                        <Trash2 size={14} /> Xóa
                    </button>
                    <div className={styles.modalFooterRight}>
                        <button type="button" className={styles.btnGhost} onClick={onClose}>Hủy</button>
                        <button type="button" className={styles.btnPrimary} onClick={save} disabled={saving}>
                            {saving ? "Đang lưu…" : "Lưu"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Public badge ──────────────────────────────────────────────────────────────

function PublicBadge({ isPublic, loading, onToggle }: { isPublic: boolean; loading: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={e => { e.stopPropagation(); onToggle() }}
            disabled={loading}
            className={isPublic ? nb.badgePublic : nb.badgePrivate}
        >
            {isPublic ? <Eye size={11} /> : <EyeOff size={11} />}
            {isPublic ? "Công khai" : "Riêng tư"}
        </button>
    )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function NotebooksDataClient({ initialGroups, initialNotebooks }: Props) {
    const [groups, setGroups] = useState(initialGroups)
    const [notebooks, setNotebooks] = useState(initialNotebooks)
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
    const [search, setSearch] = useState("")
    const [selectedGroup, setSelectedGroup] = useState<GroupRow | null>(null)
    const [selectedNotebook, setSelectedNotebook] = useState<NotebookRow | null>(null)
    const [togglingGroup, setTogglingGroup] = useState<string | null>(null)
    const [togglingNb, setTogglingNb] = useState<string | null>(null)

    const q = search.toLowerCase()

    // Build tree: groups with their child notebooks
    const groupMap = new Map(groups.map(g => [g.id, g]))
    const notebooksByGroup = new Map<string, NotebookRow[]>()
    const standaloneNotebooks: NotebookRow[] = []

    for (const nb of notebooks) {
        if (nb.group_id && groupMap.has(nb.group_id)) {
            const list = notebooksByGroup.get(nb.group_id) ?? []
            list.push(nb)
            notebooksByGroup.set(nb.group_id, list)
        } else {
            standaloneNotebooks.push(nb)
        }
    }

    // Filter logic
    function groupMatches(g: GroupRow) {
        if (!q) return true
        if (g.name.toLowerCase().includes(q)) return true
        return (notebooksByGroup.get(g.id) ?? []).some(n => n.name.toLowerCase().includes(q))
    }
    function nbMatches(n: NotebookRow) {
        return !q || n.name.toLowerCase().includes(q)
    }

    const visibleGroups = groups.filter(groupMatches)
    const visibleStandalone = standaloneNotebooks.filter(nbMatches)

    function toggleCollapse(id: string) {
        setCollapsed(prev => {
            const next = new Set(prev)
            if (next.has(id)) { next.delete(id) } else { next.add(id) }
            return next
        })
    }

    async function toggleGroupPublic(row: GroupRow) {
        setTogglingGroup(row.id)
        try {
            const res = await fetch(`/api/admin/groups/${row.id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_public: !row.is_public }),
            })
            if (res.ok) setGroups(prev => prev.map(g => g.id === row.id ? { ...g, is_public: !g.is_public } : g))
        } finally { setTogglingGroup(null) }
    }

    async function toggleNotebookPublic(row: NotebookRow) {
        const nextPublic = !row.is_public
        setTogglingNb(row.id)
        try {
            const res = await fetch(`/api/admin/notebooks/${row.id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_public: nextPublic }),
            })
            if (!res.ok) return

            const updatedNotebooks = notebooks.map(n => n.id === row.id ? { ...n, is_public: nextPublic } : n)
            setNotebooks(updatedNotebooks)

            // Auto-set group to public when ALL siblings become public
            if (nextPublic && row.group_id) {
                const group = groups.find(g => g.id === row.group_id)
                if (group && !group.is_public) {
                    const siblings = updatedNotebooks.filter(n => n.group_id === row.group_id)
                    const allPublic = siblings.length > 0 && siblings.every(n => n.is_public)
                    if (allPublic) {
                        const gRes = await fetch(`/api/admin/groups/${row.group_id}`, {
                            method: "PATCH", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ is_public: true }),
                        })
                        if (gRes.ok) {
                            setGroups(prev => prev.map(g => g.id === row.group_id ? { ...g, is_public: true } : g))
                        }
                    }
                }
            }
        } finally { setTogglingNb(null) }
    }

    const totalGroups = groups.length
    const totalNotebooks = notebooks.length

    return (
        <>
            <div className={styles.page}>
                {/* Header */}
                <div className={styles.pageHeader}>
                    <div>
                        <h2 className={styles.pageTitle}>Sổ tay</h2>
                        <p className={styles.pageSubtitle}>{totalGroups} nhóm · {totalNotebooks} sổ tay</p>
                    </div>
                </div>

                {/* Search */}
                <div className={styles.filterBar}>
                    <div className={styles.searchWrap}>
                        <Search size={14} className={styles.searchIcon} />
                        <input
                            className={styles.searchInput}
                            placeholder="Tìm nhóm hoặc sổ tay..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className={styles.searchClear} onClick={() => setSearch("")}>
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Tree */}
                <div className={nb.tree}>

                    {/* ── Column header ── */}
                    <div className={nb.treeHeader}>
                        <span className={nb.colName}>Tên</span>
                        <span className={nb.colMeta}>Mục / Thứ tự</span>
                        <span className={nb.colStatus}>Trạng thái</span>
                        <span className={nb.colAction}></span>
                    </div>

                    {/* ── Groups ── */}
                    {visibleGroups.map(group => {
                        const allChildren = notebooksByGroup.get(group.id) ?? []
                        const children = allChildren.filter(nbMatches)
                        const isOpen = !collapsed.has(group.id)
                        const publicChildCount = allChildren.filter(n => n.is_public).length

                        return (
                            <div key={group.id} className={nb.groupBlock}>
                                {/* Group row */}
                                <div className={nb.groupRow}>
                                    <button
                                        type="button"
                                        className={nb.collapseBtn}
                                        onClick={() => toggleCollapse(group.id)}
                                        aria-label={isOpen ? "Thu gọn" : "Mở rộng"}
                                    >
                                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </button>
                                    <Layers size={14} className={nb.groupIcon} />
                                    <span className={nb.groupName}>{group.name}</span>
                                    <span className={nb.groupCount}>
                                        {group.is_public
                                            ? `${publicChildCount}/${group.notebook_count} công khai`
                                            : `${group.notebook_count} sổ`}
                                    </span>
                                    <span className={nb.colMeta}>
                                        <span className={nb.orderBadge}>#{group.display_order}</span>
                                    </span>
                                    <span className={nb.colStatus}>
                                        <PublicBadge
                                            isPublic={group.is_public}
                                            loading={togglingGroup === group.id}
                                            onToggle={() => toggleGroupPublic(group)}
                                        />
                                    </span>
                                    <span className={nb.colAction}>
                                        <button type="button" className={nb.editBtn} onClick={() => setSelectedGroup(group)}>
                                            <Pencil size={12} />
                                        </button>
                                    </span>
                                </div>

                                {/* Child notebooks */}
                                {isOpen && (
                                    <div className={nb.children}>
                                        {children.length === 0 ? (
                                            <div className={nb.emptyChildren}>Không có sổ tay nào trong nhóm này</div>
                                        ) : children.map(n => (
                                            <div key={n.id} className={nb.notebookRow}>
                                                <span className={nb.treeConnector} aria-hidden="true" />
                                                <BookOpen size={13} className={nb.nbIcon} />
                                                <span className={nb.nbName}>{n.name}</span>
                                                <span className={nb.colMeta}>
                                                    <span className={nb.itemCount}>{n.item_count} mục</span>
                                                    <span className={nb.orderBadge}>#{n.display_order}</span>
                                                </span>
                                                <span className={nb.colStatus}>
                                                    <PublicBadge
                                                        isPublic={n.is_public}
                                                        loading={togglingNb === n.id}
                                                        onToggle={() => toggleNotebookPublic(n)}
                                                    />
                                                </span>
                                                <span className={nb.colAction}>
                                                    <button type="button" className={nb.editBtn} onClick={() => setSelectedNotebook(n)}>
                                                        <Pencil size={12} />
                                                    </button>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {/* ── Standalone notebooks ── */}
                    {(visibleStandalone.length > 0 || visibleGroups.length === 0) && (
                        <div className={nb.standaloneBlock}>
                            <div className={nb.standaloneHeader}>
                                <BookOpen size={13} className={nb.groupIcon} />
                                <span className={nb.standaloneTitle}>
                                    Sổ tay độc lập
                                    <span className={nb.groupCount}>{standaloneNotebooks.length} sổ</span>
                                </span>
                            </div>
                            {visibleStandalone.length === 0 ? (
                                <div className={nb.emptyChildren}>Không có sổ tay độc lập nào</div>
                            ) : visibleStandalone.map(n => (
                                <div key={n.id} className={nb.notebookRow}>
                                    <span className={nb.treeConnector} aria-hidden="true" />
                                    <BookOpen size={13} className={nb.nbIcon} />
                                    <span className={nb.nbName}>{n.name}</span>
                                    <span className={nb.colMeta}>
                                        <span className={nb.itemCount}>{n.item_count} mục</span>
                                        {n.public_category && <span className={nb.catBadge}>{n.public_category}</span>}
                                        <span className={nb.orderBadge}>#{n.display_order}</span>
                                    </span>
                                    <span className={nb.colStatus}>
                                        <PublicBadge
                                            isPublic={n.is_public}
                                            loading={togglingNb === n.id}
                                            onToggle={() => toggleNotebookPublic(n)}
                                        />
                                    </span>
                                    <span className={nb.colAction}>
                                        <button type="button" className={nb.editBtn} onClick={() => setSelectedNotebook(n)}>
                                            <Pencil size={12} />
                                        </button>
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {visibleGroups.length === 0 && visibleStandalone.length === 0 && (
                        <div className={nb.emptyTree}>Không tìm thấy kết quả nào</div>
                    )}
                </div>
            </div>

            {selectedGroup && (
                <GroupModal
                    row={selectedGroup}
                    onClose={() => setSelectedGroup(null)}
                    onSaved={updated => { setGroups(prev => prev.map(g => g.id === updated.id ? updated : g)); setSelectedGroup(null) }}
                    onDeleted={id => { setGroups(prev => prev.filter(g => g.id !== id)); setSelectedGroup(null) }}
                />
            )}
            {selectedNotebook && (
                <NotebookModal
                    row={selectedNotebook}
                    groups={groups}
                    groupIsPublic={selectedNotebook.group_id
                        ? (groups.find(g => g.id === selectedNotebook.group_id)?.is_public ?? false)
                        : false}
                    onClose={() => setSelectedNotebook(null)}
                    onSaved={updated => { setNotebooks(prev => prev.map(n => n.id === updated.id ? updated : n)); setSelectedNotebook(null) }}
                    onDeleted={id => { setNotebooks(prev => prev.filter(n => n.id !== id)); setSelectedNotebook(null) }}
                />
            )}
        </>
    )
}
