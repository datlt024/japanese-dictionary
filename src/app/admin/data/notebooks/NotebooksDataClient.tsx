"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Search, X, BookOpen, Eye, EyeOff, Trash2, Pencil } from "lucide-react"
import styles from "@/app/admin/data/shared.module.css"

type NotebookRow = {
    id: string
    name: string
    description: string | null
    is_public: boolean
    public_category: string | null
    public_description: string | null
    display_order: number
    user_id: string
    created_at: string
    item_count: number
}

type Props = {
    initialRows: NotebookRow[]
    initialTotal: number
}

const PAGE_SIZE = 50
const CATEGORIES = ["N5", "N4", "N3", "N2", "N1", "Tổng hợp", "Chủ đề", "Khác"]

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
    })
}

// ── Modal ────────────────────────────────────────────────────────────────────

function NotebookModal({
    row,
    onClose,
    onSaved,
    onDeleted,
}: {
    row: NotebookRow
    onClose: () => void
    onSaved: (updated: NotebookRow) => void
    onDeleted: (id: string) => void
}) {
    const [name, setName] = useState(row.name)
    const [publicCategory, setPublicCategory] = useState(row.public_category ?? "")
    const [publicDescription, setPublicDescription] = useState(row.public_description ?? "")
    const [displayOrder, setDisplayOrder] = useState(String(row.display_order))
    const [isPublic, setIsPublic] = useState(row.is_public)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose()
        }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [onClose])

    async function save() {
        const trimName = name.trim()
        if (!trimName) { setError("Tên sổ tay không được để trống."); return }
        setSaving(true)
        setError(null)
        try {
            const res = await fetch(`/api/admin/notebooks/${row.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: trimName,
                    is_public: isPublic,
                    public_category: publicCategory.trim() || null,
                    public_description: publicDescription.trim() || null,
                    display_order: Number(displayOrder) || 0,
                }),
            })
            if (!res.ok) { setError("Lưu thất bại. Vui lòng thử lại."); return }
            const updated = await res.json() as NotebookRow
            onSaved({ ...updated, item_count: row.item_count })
        } catch {
            setError("Đã xảy ra lỗi. Vui lòng thử lại.")
        } finally {
            setSaving(false)
        }
    }

    async function doDelete() {
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/notebooks/${row.id}`, { method: "DELETE" })
            if (res.ok || res.status === 204) {
                onDeleted(row.id)
            } else {
                setError("Xóa thất bại.")
                setConfirmDelete(false)
            }
        } catch {
            setError("Đã xảy ra lỗi khi xóa.")
            setConfirmDelete(false)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Chỉnh sửa sổ tay</h3>
                    <button type="button" className={styles.modalClose} onClick={onClose}><X size={16} /></button>
                </div>

                <div className={styles.modalForm}>
                    {/* is_public toggle */}
                    <label className={styles.checkRow}>
                        <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                        <span className={styles.checkLabel}>Hiển thị công khai trong tab Khám phá</span>
                    </label>

                    <div className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>Tên sổ tay</span>
                        <input className={styles.fieldInput} value={name} onChange={e => setName(e.target.value)} />
                    </div>

                    <div className={styles.fieldRow2}>
                        <div className={styles.fieldRow}>
                            <span className={styles.fieldLabel}>Danh mục công khai</span>
                            <select
                                className={styles.fieldSelect}
                                value={publicCategory}
                                onChange={e => setPublicCategory(e.target.value)}
                                disabled={!isPublic}
                            >
                                <option value="">— Chưa phân loại —</option>
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.fieldRow}>
                            <span className={styles.fieldLabel}>Thứ tự hiển thị</span>
                            <input
                                className={styles.fieldInput}
                                type="number"
                                min={0}
                                value={displayOrder}
                                onChange={e => setDisplayOrder(e.target.value)}
                                disabled={!isPublic}
                            />
                        </div>
                    </div>

                    <div className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>Mô tả công khai</span>
                        <textarea
                            className={styles.fieldTextarea}
                            rows={3}
                            value={publicDescription}
                            onChange={e => setPublicDescription(e.target.value)}
                            placeholder="Mô tả ngắn hiển thị trong tab Khám phá..."
                            disabled={!isPublic}
                        />
                    </div>
                </div>

                {error && <p className={styles.modalError}>{error}</p>}

                {confirmDelete ? (
                    <div className={styles.deleteSection}>
                        <p className={styles.deleteWarn}>
                            Xóa sổ tay <strong>{row.name}</strong>? Tất cả {row.item_count} mục bên trong cũng sẽ bị xóa. Không thể hoàn tác.
                        </p>
                        <div className={styles.deleteActions}>
                            <button type="button" className={styles.btnGhost} onClick={() => setConfirmDelete(false)}>Hủy</button>
                            <button type="button" className={styles.btnDanger} onClick={doDelete} disabled={deleting}>
                                {deleting ? "Đang xóa…" : "Xác nhận xóa"}
                            </button>
                        </div>
                    </div>
                ) : null}

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

// ── Main client ──────────────────────────────────────────────────────────────

export default function NotebooksDataClient({ initialRows, initialTotal }: Props) {
    const [rows, setRows] = useState(initialRows)
    const [total, setTotal] = useState(initialTotal)
    const [search, setSearch] = useState("")
    const [filterPublic, setFilterPublic] = useState<"all" | "public" | "private">("all")
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState<NotebookRow | null>(null)
    const [togglingId, setTogglingId] = useState<string | null>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const load = useCallback(async (q: string, pub: typeof filterPublic, p: number) => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ q, page: String(p), limit: String(PAGE_SIZE) })
            if (pub !== "all") params.set("is_public", pub === "public" ? "true" : "false")
            const res = await fetch(`/api/admin/notebooks?${params}`)
            if (!res.ok) return
            const json = await res.json() as { data: NotebookRow[]; total: number } | NotebookRow[]
            if (Array.isArray(json)) {
                setRows(json)
                setTotal(json.length)
            } else {
                setRows(json.data)
                setTotal(json.total)
            }
        } finally {
            setLoading(false)
        }
    }, [])

    function onSearchChange(v: string) {
        setSearch(v)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            setPage(0)
            load(v, filterPublic, 0)
        }, 300)
    }

    function onFilterChange(pub: typeof filterPublic) {
        setFilterPublic(pub)
        setPage(0)
        load(search, pub, 0)
    }

    async function togglePublic(row: NotebookRow) {
        setTogglingId(row.id)
        try {
            const res = await fetch(`/api/admin/notebooks/${row.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_public: !row.is_public }),
            })
            if (res.ok) {
                setRows(prev => prev.map(r => r.id === row.id ? { ...r, is_public: !r.is_public } : r))
            }
        } finally {
            setTogglingId(null)
        }
    }

    const totalPages = Math.ceil(total / PAGE_SIZE)

    return (
        <>
            <div className={styles.page}>
                {/* Header */}
                <div className={styles.pageHeader}>
                    <div>
                        <h2 className={styles.pageTitle}>Sổ tay công khai</h2>
                        <p className={styles.pageSubtitle}>{total.toLocaleString("vi-VN")} sổ tay</p>
                    </div>
                </div>

                {/* Filter bar */}
                <div className={styles.filterBar}>
                    <div className={styles.searchWrap}>
                        <Search size={14} className={styles.searchIcon} />
                        <input
                            className={styles.searchInput}
                            placeholder="Tìm theo tên sổ tay..."
                            value={search}
                            onChange={e => onSearchChange(e.target.value)}
                        />
                        {search && (
                            <button className={styles.searchClear} onClick={() => onSearchChange("")}>
                                <X size={12} />
                            </button>
                        )}
                    </div>
                    <select
                        className={styles.filterSelect}
                        value={filterPublic}
                        onChange={e => onFilterChange(e.target.value as typeof filterPublic)}
                    >
                        <option value="all">Tất cả</option>
                        <option value="public">Công khai</option>
                        <option value="private">Riêng tư</option>
                    </select>
                </div>

                {/* Table */}
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Tên sổ tay</th>
                                <th className={styles.th}>Danh mục</th>
                                <th className={`${styles.th} ${styles.thCenter}`}>Số mục</th>
                                <th className={`${styles.th} ${styles.thCenter}`}>Thứ tự</th>
                                <th className={styles.th}>Ngày tạo</th>
                                <th className={`${styles.th} ${styles.thCenter}`}>Công khai</th>
                                <th className={`${styles.th} ${styles.thCenter}`}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className={styles.emptyRow}>Đang tải…</td></tr>
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className={styles.emptyRow}>
                                        <BookOpen size={28} style={{ opacity: 0.3, margin: "0 auto 8px", display: "block" }} />
                                        Không có sổ tay nào
                                    </td>
                                </tr>
                            ) : rows.map(row => (
                                <tr key={row.id} className={styles.tr} onClick={() => setSelected(row)}>
                                    <td className={styles.td} style={{ maxWidth: 280 }}>
                                        <span title={row.name}>{row.name}</span>
                                    </td>
                                    <td className={styles.td}>
                                        {row.public_category ? (
                                            <span className={styles.commonBadge}>{row.public_category}</span>
                                        ) : (
                                            <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>—</span>
                                        )}
                                    </td>
                                    <td className={`${styles.td} ${styles.tdCenter}`}>
                                        <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 13 }}>{row.item_count}</span>
                                    </td>
                                    <td className={`${styles.td} ${styles.tdCenter}`}>
                                        <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 13, color: "var(--color-text-muted)" }}>{row.display_order}</span>
                                    </td>
                                    <td className={styles.td}>
                                        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{fmtDate(row.created_at)}</span>
                                    </td>
                                    <td className={`${styles.td} ${styles.tdCenter}`} onClick={e => { e.stopPropagation(); togglePublic(row) }}>
                                        <button
                                            type="button"
                                            title={row.is_public ? "Đang công khai — nhấn để ẩn" : "Đang ẩn — nhấn để công khai"}
                                            disabled={togglingId === row.id}
                                            style={{
                                                display: "inline-flex", alignItems: "center", gap: 4,
                                                height: 28, padding: "0 10px", borderRadius: 8,
                                                border: "1.5px solid",
                                                borderColor: row.is_public ? "var(--color-success)" : "var(--color-border)",
                                                background: row.is_public ? "var(--color-success-soft)" : "transparent",
                                                color: row.is_public ? "var(--color-success)" : "var(--color-text-muted)",
                                                fontSize: 11, fontWeight: 700, cursor: "pointer",
                                                transition: "all 0.15s",
                                                opacity: togglingId === row.id ? 0.5 : 1,
                                            }}
                                        >
                                            {row.is_public ? <Eye size={12} /> : <EyeOff size={12} />}
                                            {row.is_public ? "Công khai" : "Riêng tư"}
                                        </button>
                                    </td>
                                    <td className={`${styles.td} ${styles.tdCenter}`} onClick={e => { e.stopPropagation(); setSelected(row) }}>
                                        <button
                                            type="button"
                                            style={{
                                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                width: 28, height: 28, borderRadius: 7,
                                                border: "1.5px solid transparent", background: "transparent",
                                                color: "var(--color-text-muted)", cursor: "pointer",
                                                transition: "all 0.12s",
                                            }}
                                            title="Chỉnh sửa"
                                        >
                                            <Pencil size={13} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button
                            type="button"
                            className={styles.pageBtn}
                            disabled={page <= 0}
                            onClick={() => { const p = page - 1; setPage(p); load(search, filterPublic, p) }}
                        >
                            ← Trang trước
                        </button>
                        <span className={styles.pageInfo}>Trang {page + 1} / {totalPages}</span>
                        <button
                            type="button"
                            className={styles.pageBtn}
                            disabled={page >= totalPages - 1}
                            onClick={() => { const p = page + 1; setPage(p); load(search, filterPublic, p) }}
                        >
                            Trang tiếp →
                        </button>
                    </div>
                )}
            </div>

            {selected && (
                <NotebookModal
                    row={selected}
                    onClose={() => setSelected(null)}
                    onSaved={updated => {
                        setRows(prev => prev.map(r => r.id === updated.id ? updated : r))
                        setSelected(null)
                    }}
                    onDeleted={id => {
                        setRows(prev => prev.filter(r => r.id !== id))
                        setTotal(t => t - 1)
                        setSelected(null)
                    }}
                />
            )}
        </>
    )
}
