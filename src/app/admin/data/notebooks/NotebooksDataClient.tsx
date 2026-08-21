"use client"

import { useState, useRef, useCallback } from "react"
import { Search, X, BookOpen, Eye, EyeOff, Trash2, Pencil, Layers, Notebook } from "lucide-react"
import styles from "@/app/admin/data/shared.module.css"

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
    initialGroupTotal: number
    initialNotebooks: NotebookRow[]
    initialNotebookTotal: number
}

const CATEGORIES = ["N5", "N4", "N3", "N2", "N1", "Tổng hợp", "Chủ đề", "Khác"]

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

// ── Group modal ───────────────────────────────────────────────────────────────

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
    const [deleting, setDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function save() {
        const trimName = name.trim()
        if (!trimName) { setError("Tên nhóm không được để trống."); return }
        setSaving(true); setError(null)
        try {
            const res = await fetch(`/api/admin/groups/${row.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: trimName,
                    is_public: isPublic,
                    public_description: publicDesc.trim() || null,
                    display_order: Number(displayOrder) || 0,
                }),
            })
            if (!res.ok) { setError("Lưu thất bại."); return }
            const updated = await res.json() as GroupRow
            onSaved({ ...updated, notebook_count: row.notebook_count })
        } catch { setError("Đã xảy ra lỗi.") }
        finally { setSaving(false) }
    }

    async function doDelete() {
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/groups/${row.id}`, { method: "DELETE" })
            if (res.ok || res.status === 204) { onDeleted(row.id) }
            else { setError("Xóa thất bại."); setConfirmDelete(false) }
        } catch { setError("Đã xảy ra lỗi khi xóa."); setConfirmDelete(false) }
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
                        <Trash2 size={14} /> Xóa
                    </button>
                    <div className={styles.modalFooterRight}>
                        <button type="button" className={styles.btnGhost} onClick={onClose}>Hủy</button>
                        <button type="button" className={styles.btnPrimary} onClick={save} disabled={saving || deleting}>
                            {saving ? "Đang lưu…" : "Lưu"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Notebook modal ────────────────────────────────────────────────────────────

function NotebookModal({ row, groups, onClose, onSaved, onDeleted }: {
    row: NotebookRow
    groups: GroupRow[]
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
    const [deleting, setDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
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
                    name: trimName,
                    is_public: isPublic,
                    group_id: groupId || null,
                    public_category: publicCategory.trim() || null,
                    public_description: publicDesc.trim() || null,
                    display_order: Number(displayOrder) || 0,
                }),
            })
            if (!res.ok) { setError("Lưu thất bại."); return }
            const updated = await res.json() as NotebookRow
            onSaved({ ...updated, item_count: row.item_count })
        } catch { setError("Đã xảy ra lỗi.") }
        finally { setSaving(false) }
    }

    async function doDelete() {
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/notebooks/${row.id}`, { method: "DELETE" })
            if (res.ok || res.status === 204) { onDeleted(row.id) }
            else { setError("Xóa thất bại."); setConfirmDelete(false) }
        } catch { setError("Đã xảy ra lỗi khi xóa."); setConfirmDelete(false) }
        finally { setDeleting(false) }
    }

    const hasGroup = !!groupId

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
                        <span className={styles.checkLabel}>Hiển thị công khai trong tab Khám phá</span>
                    </label>
                    <div className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>Tên sổ tay</span>
                        <input className={styles.fieldInput} value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>Thuộc nhóm</span>
                        <select className={styles.fieldSelect} value={groupId} onChange={e => setGroupId(e.target.value)}>
                            <option value="">— Không thuộc nhóm nào —</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                    {!hasGroup && (
                        <div className={styles.fieldRow2}>
                            <div className={styles.fieldRow}>
                                <span className={styles.fieldLabel}>Danh mục công khai</span>
                                <select className={styles.fieldSelect} value={publicCategory}
                                    onChange={e => setPublicCategory(e.target.value)} disabled={!isPublic}>
                                    <option value="">— Chưa phân loại —</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className={styles.fieldRow}>
                                <span className={styles.fieldLabel}>Thứ tự hiển thị</span>
                                <input className={styles.fieldInput} type="number" min={0} value={displayOrder}
                                    onChange={e => setDisplayOrder(e.target.value)} />
                            </div>
                        </div>
                    )}
                    {hasGroup && (
                        <div className={styles.fieldRow}>
                            <span className={styles.fieldLabel}>Thứ tự trong nhóm</span>
                            <input className={styles.fieldInput} type="number" min={0} value={displayOrder}
                                onChange={e => setDisplayOrder(e.target.value)} />
                        </div>
                    )}
                    <div className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>Mô tả công khai</span>
                        <textarea className={styles.fieldTextarea} rows={3} value={publicDesc}
                            onChange={e => setPublicDesc(e.target.value)}
                            placeholder="Mô tả ngắn hiển thị trong tab Khám phá..."
                            disabled={!isPublic && !hasGroup} />
                    </div>
                </div>
                {error && <p className={styles.modalError}>{error}</p>}
                {confirmDelete && (
                    <div className={styles.deleteSection}>
                        <p className={styles.deleteWarn}>
                            Xóa sổ tay <strong>{row.name}</strong>? {row.item_count} mục bên trong cũng sẽ bị xóa. Không thể hoàn tác.
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
                        <button type="button" className={styles.btnPrimary} onClick={save} disabled={saving || deleting}>
                            {saving ? "Đang lưu…" : "Lưu"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Toggle button ─────────────────────────────────────────────────────────────

function PublicToggle({ isPublic, loading, onClick }: { isPublic: boolean; loading: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading}
            title={isPublic ? "Đang công khai — nhấn để ẩn" : "Đang ẩn — nhấn để công khai"}
            style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                height: 28, padding: "0 10px", borderRadius: 8,
                border: "1.5px solid",
                borderColor: isPublic ? "var(--color-success)" : "var(--color-border)",
                background: isPublic ? "var(--color-success-soft)" : "transparent",
                color: isPublic ? "var(--color-success)" : "var(--color-text-muted)",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
                transition: "all 0.15s",
                opacity: loading ? 0.5 : 1,
            }}
        >
            {isPublic ? <Eye size={12} /> : <EyeOff size={12} />}
            {isPublic ? "Công khai" : "Riêng tư"}
        </button>
    )
}

// ── Main client ───────────────────────────────────────────────────────────────

export default function NotebooksDataClient({
    initialGroups, initialGroupTotal,
    initialNotebooks, initialNotebookTotal,
}: Props) {
    const [tab, setTab] = useState<"groups" | "notebooks">("groups")

    // Groups state
    const [groups, setGroups] = useState(initialGroups)
    const [groupTotal, setGroupTotal] = useState(initialGroupTotal)
    const [groupSearch, setGroupSearch] = useState("")
    const [togglingGroupId, setTogglingGroupId] = useState<string | null>(null)
    const [selectedGroup, setSelectedGroup] = useState<GroupRow | null>(null)

    // Notebooks state
    const [notebooks, setNotebooks] = useState(initialNotebooks)
    const [notebookTotal, setNotebookTotal] = useState(initialNotebookTotal)
    const [nbSearch, setNbSearch] = useState("")
    const [nbFilterPublic, setNbFilterPublic] = useState<"all" | "public" | "private">("all")
    const [nbPage, setNbPage] = useState(0)
    const [nbLoading, setNbLoading] = useState(false)
    const [selectedNotebook, setSelectedNotebook] = useState<NotebookRow | null>(null)
    const [togglingNbId, setTogglingNbId] = useState<string | null>(null)
    const nbDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

    const PAGE_SIZE = 50

    const loadNotebooks = useCallback(async (q: string, pub: "all" | "public" | "private", p: number) => {
        setNbLoading(true)
        try {
            const params = new URLSearchParams({ q, page: String(p), limit: String(PAGE_SIZE) })
            if (pub !== "all") params.set("is_public", pub === "public" ? "true" : "false")
            const res = await fetch(`/api/admin/notebooks?${params}`)
            if (!res.ok) return
            const json = await res.json() as { data: NotebookRow[]; total: number }
            setNotebooks(json.data)
            setNotebookTotal(json.total)
        } finally {
            setNbLoading(false) }
    }, [])

    function onNbSearchChange(v: string) {
        setNbSearch(v)
        if (nbDebounce.current) clearTimeout(nbDebounce.current)
        nbDebounce.current = setTimeout(() => { setNbPage(0); loadNotebooks(v, nbFilterPublic, 0) }, 300)
    }

    function onNbFilterChange(pub: "all" | "public" | "private") {
        setNbFilterPublic(pub)
        setNbPage(0)
        loadNotebooks(nbSearch, pub, 0)
    }

    async function toggleGroup(row: GroupRow) {
        setTogglingGroupId(row.id)
        try {
            const res = await fetch(`/api/admin/groups/${row.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_public: !row.is_public }),
            })
            if (res.ok) setGroups(prev => prev.map(g => g.id === row.id ? { ...g, is_public: !g.is_public } : g))
        } finally { setTogglingGroupId(null) }
    }

    async function toggleNotebook(row: NotebookRow) {
        setTogglingNbId(row.id)
        try {
            const res = await fetch(`/api/admin/notebooks/${row.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_public: !row.is_public }),
            })
            if (res.ok) setNotebooks(prev => prev.map(n => n.id === row.id ? { ...n, is_public: !n.is_public } : n))
        } finally { setTogglingNbId(null) }
    }

    const nbPages = Math.ceil(notebookTotal / PAGE_SIZE)

    // Filtered groups (client-side search since count is small)
    const filteredGroups = groupSearch
        ? groups.filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase()))
        : groups

    // Group name map for notebook table
    const groupNameMap = new Map(groups.map(g => [g.id, g.name]))

    return (
        <>
            <div className={styles.page}>
                {/* Header */}
                <div className={styles.pageHeader}>
                    <div>
                        <h2 className={styles.pageTitle}>Sổ tay</h2>
                        <p className={styles.pageSubtitle}>{groupTotal} nhóm · {notebookTotal} sổ tay</p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--color-border)", marginBottom: -4 }}>
                    {(["groups", "notebooks"] as const).map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                height: 36, padding: "0 16px",
                                border: "none", background: "none", cursor: "pointer",
                                fontSize: 13, fontWeight: tab === t ? 700 : 500,
                                color: tab === t ? "var(--color-primary)" : "var(--color-text-secondary)",
                                borderBottom: tab === t ? "2px solid var(--color-primary)" : "2px solid transparent",
                                transition: "color 0.15s, border-color 0.15s",
                            }}
                        >
                            {t === "groups" ? <Layers size={14} /> : <Notebook size={14} />}
                            {t === "groups" ? `Nhóm sổ tay (${groupTotal})` : `Sổ tay (${notebookTotal})`}
                        </button>
                    ))}
                </div>

                {/* ── Groups tab ── */}
                {tab === "groups" && (
                    <>
                        <div className={styles.filterBar}>
                            <div className={styles.searchWrap}>
                                <Search size={14} className={styles.searchIcon} />
                                <input
                                    className={styles.searchInput}
                                    placeholder="Tìm theo tên nhóm..."
                                    value={groupSearch}
                                    onChange={e => setGroupSearch(e.target.value)}
                                />
                                {groupSearch && (
                                    <button className={styles.searchClear} onClick={() => setGroupSearch("")}>
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>Tên nhóm</th>
                                        <th className={`${styles.th} ${styles.thCenter}`}>Số sổ tay</th>
                                        <th className={`${styles.th} ${styles.thCenter}`}>Thứ tự</th>
                                        <th className={styles.th}>Ngày tạo</th>
                                        <th className={`${styles.th} ${styles.thCenter}`}>Công khai</th>
                                        <th className={`${styles.th} ${styles.thCenter}`}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredGroups.length === 0 ? (
                                        <tr><td colSpan={6} className={styles.emptyRow}>
                                            <Layers size={28} style={{ opacity: 0.3, margin: "0 auto 8px", display: "block" }} />
                                            Không có nhóm nào
                                        </td></tr>
                                    ) : filteredGroups.map(row => (
                                        <tr key={row.id} className={styles.tr} onClick={() => setSelectedGroup(row)}>
                                            <td className={styles.td} style={{ maxWidth: 300 }}>
                                                <span title={row.name}>{row.name}</span>
                                            </td>
                                            <td className={`${styles.td} ${styles.tdCenter}`}>
                                                <span style={{ fontVariantNumeric: "tabular-nums" }}>{row.notebook_count}</span>
                                            </td>
                                            <td className={`${styles.td} ${styles.tdCenter}`}>
                                                <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--color-text-muted)" }}>{row.display_order}</span>
                                            </td>
                                            <td className={styles.td}>
                                                <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{fmtDate(row.created_at)}</span>
                                            </td>
                                            <td className={`${styles.td} ${styles.tdCenter}`} onClick={e => { e.stopPropagation(); toggleGroup(row) }}>
                                                <PublicToggle isPublic={row.is_public} loading={togglingGroupId === row.id} onClick={() => {}} />
                                            </td>
                                            <td className={`${styles.td} ${styles.tdCenter}`} onClick={e => { e.stopPropagation(); setSelectedGroup(row) }}>
                                                <button type="button" style={{
                                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                    width: 28, height: 28, borderRadius: 7,
                                                    border: "1.5px solid transparent", background: "transparent",
                                                    color: "var(--color-text-muted)", cursor: "pointer",
                                                }} title="Chỉnh sửa"><Pencil size={13} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ── Notebooks tab ── */}
                {tab === "notebooks" && (
                    <>
                        <div className={styles.filterBar}>
                            <div className={styles.searchWrap}>
                                <Search size={14} className={styles.searchIcon} />
                                <input
                                    className={styles.searchInput}
                                    placeholder="Tìm theo tên sổ tay..."
                                    value={nbSearch}
                                    onChange={e => onNbSearchChange(e.target.value)}
                                />
                                {nbSearch && (
                                    <button className={styles.searchClear} onClick={() => onNbSearchChange("")}>
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                            <select className={styles.filterSelect} value={nbFilterPublic}
                                onChange={e => onNbFilterChange(e.target.value as typeof nbFilterPublic)}>
                                <option value="all">Tất cả</option>
                                <option value="public">Công khai</option>
                                <option value="private">Riêng tư</option>
                            </select>
                        </div>

                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>Tên sổ tay</th>
                                        <th className={styles.th}>Nhóm</th>
                                        <th className={styles.th}>Danh mục</th>
                                        <th className={`${styles.th} ${styles.thCenter}`}>Số mục</th>
                                        <th className={`${styles.th} ${styles.thCenter}`}>Thứ tự</th>
                                        <th className={`${styles.th} ${styles.thCenter}`}>Công khai</th>
                                        <th className={`${styles.th} ${styles.thCenter}`}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nbLoading ? (
                                        <tr><td colSpan={7} className={styles.emptyRow}>Đang tải…</td></tr>
                                    ) : notebooks.length === 0 ? (
                                        <tr><td colSpan={7} className={styles.emptyRow}>
                                            <BookOpen size={28} style={{ opacity: 0.3, margin: "0 auto 8px", display: "block" }} />
                                            Không có sổ tay nào
                                        </td></tr>
                                    ) : notebooks.map(row => (
                                        <tr key={row.id} className={styles.tr} onClick={() => setSelectedNotebook(row)}>
                                            <td className={styles.td} style={{ maxWidth: 260 }}>
                                                <span title={row.name}>{row.name}</span>
                                            </td>
                                            <td className={styles.td}>
                                                {row.group_id && groupNameMap.has(row.group_id) ? (
                                                    <span style={{ fontSize: 12, color: "var(--color-primary)", fontWeight: 600 }}>
                                                        {groupNameMap.get(row.group_id)}
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>—</span>
                                                )}
                                            </td>
                                            <td className={styles.td}>
                                                {row.public_category ? (
                                                    <span className={styles.commonBadge}>{row.public_category}</span>
                                                ) : (
                                                    <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>—</span>
                                                )}
                                            </td>
                                            <td className={`${styles.td} ${styles.tdCenter}`}>
                                                <span style={{ fontVariantNumeric: "tabular-nums" }}>{row.item_count}</span>
                                            </td>
                                            <td className={`${styles.td} ${styles.tdCenter}`}>
                                                <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--color-text-muted)" }}>{row.display_order}</span>
                                            </td>
                                            <td className={`${styles.td} ${styles.tdCenter}`} onClick={e => { e.stopPropagation(); toggleNotebook(row) }}>
                                                <PublicToggle isPublic={row.is_public} loading={togglingNbId === row.id} onClick={() => {}} />
                                            </td>
                                            <td className={`${styles.td} ${styles.tdCenter}`} onClick={e => { e.stopPropagation(); setSelectedNotebook(row) }}>
                                                <button type="button" style={{
                                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                    width: 28, height: 28, borderRadius: 7,
                                                    border: "1.5px solid transparent", background: "transparent",
                                                    color: "var(--color-text-muted)", cursor: "pointer",
                                                }} title="Chỉnh sửa"><Pencil size={13} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {nbPages > 1 && (
                            <div className={styles.pagination}>
                                <button type="button" className={styles.pageBtn} disabled={nbPage <= 0}
                                    onClick={() => { const p = nbPage - 1; setNbPage(p); loadNotebooks(nbSearch, nbFilterPublic, p) }}>
                                    ← Trang trước
                                </button>
                                <span className={styles.pageInfo}>Trang {nbPage + 1} / {nbPages}</span>
                                <button type="button" className={styles.pageBtn} disabled={nbPage >= nbPages - 1}
                                    onClick={() => { const p = nbPage + 1; setNbPage(p); loadNotebooks(nbSearch, nbFilterPublic, p) }}>
                                    Trang tiếp →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {selectedGroup && (
                <GroupModal
                    row={selectedGroup}
                    onClose={() => setSelectedGroup(null)}
                    onSaved={updated => { setGroups(prev => prev.map(g => g.id === updated.id ? updated : g)); setSelectedGroup(null) }}
                    onDeleted={id => { setGroups(prev => prev.filter(g => g.id !== id)); setGroupTotal(t => t - 1); setSelectedGroup(null) }}
                />
            )}

            {selectedNotebook && (
                <NotebookModal
                    row={selectedNotebook}
                    groups={groups}
                    onClose={() => setSelectedNotebook(null)}
                    onSaved={updated => { setNotebooks(prev => prev.map(n => n.id === updated.id ? updated : n)); setSelectedNotebook(null) }}
                    onDeleted={id => { setNotebooks(prev => prev.filter(n => n.id !== id)); setNotebookTotal(t => t - 1); setSelectedNotebook(null) }}
                />
            )}
        </>
    )
}
