"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Plus, Search, X, Trash2 } from "lucide-react"
import styles from "../shared.module.css"

export type GrammarRow = {
    id: number
    pattern: string
    display_pattern: string | null
    jlpt_level: string
    meaning_vi: string
    short_meaning_vi: string | null
    is_common: boolean | null
    ai_status: string | null
    slug: string
    created_at: string | null
}

const JLPT_OPTIONS = ["N5", "N4", "N3", "N2", "N1"]

function JlptBadge({ level }: { level: string }) {
    return <span className={`${styles.jlptBadge} ${styles[`jlpt${level}`]}`}>{level}</span>
}

function GrammarModal({
    row, onClose, onSaved, onDeleted,
}: {
    row: GrammarRow | null
    onClose: () => void
    onSaved: (r: GrammarRow) => void
    onDeleted?: (id: number) => void
}) {
    const isNew = row === null
    const [pattern, setPattern] = useState(row?.pattern ?? "")
    const [displayPattern, setDisplayPattern] = useState(row?.display_pattern ?? "")
    const [jlptLevel, setJlptLevel] = useState(row?.jlpt_level ?? "N5")
    const [meaningVi, setMeaningVi] = useState(row?.meaning_vi ?? "")
    const [shortMeaning, setShortMeaning] = useState(row?.short_meaning_vi ?? "")
    const [slug, setSlug] = useState(row?.slug ?? "")
    const [isCommon, setIsCommon] = useState(row?.is_common ?? false)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
        document.addEventListener("keydown", h)
        return () => document.removeEventListener("keydown", h)
    }, [onClose])

    // Auto-generate slug from pattern when new
    function onPatternChange(v: string) {
        setPattern(v)
        if (isNew && !slug) {
            setSlug(v.replace(/[〜～\s]/g, "").replace(/[^a-zA-Z0-9ぁ-んァ-ン一-龯]/g, "").toLowerCase() || v.replace(/[〜～\s]/g, ""))
        }
    }

    async function save() {
        setSaving(true); setError(null)
        try {
            const body = { pattern, display_pattern: displayPattern || null, jlpt_level: jlptLevel, meaning_vi: meaningVi, short_meaning_vi: shortMeaning || null, slug, is_common: isCommon }
            const url  = isNew ? "/api/admin/data/grammar" : `/api/admin/data/grammar/${row!.id}`
            const res  = await fetch(url, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
            const json = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(json.error ?? "Lỗi không xác định")
            onSaved(json as GrammarRow)
        } catch (e) { setError(e instanceof Error ? e.message : "Lỗi") }
        finally { setSaving(false) }
    }

    async function doDelete() {
        setDeleting(true); setError(null)
        try {
            const res = await fetch(`/api/admin/data/grammar/${row!.id}`, { method: "DELETE" })
            if (!res.ok && res.status !== 204) { const j = await res.json().catch(() => ({})); throw new Error(j.error ?? "Lỗi") }
            onDeleted?.(row!.id)
        } catch (e) { setError(e instanceof Error ? e.message : "Lỗi"); setDeleting(false); setConfirmDelete(false) }
    }

    const canSave = pattern.trim() && meaningVi.trim() && slug.trim()

    return (
        <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
            <div className={styles.modal} role="dialog" aria-modal="true">
                <div className={styles.modalHeader}>
                    <p className={styles.modalTitle}>{isNew ? "Thêm ngữ pháp" : `Sửa #${row!.id}`}</p>
                    <button className={styles.modalClose} onClick={onClose}><X size={16} /></button>
                </div>

                <div className={styles.modalForm}>
                    <div className={styles.fieldRow2}>
                        <div className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>Pattern *</label>
                            <input className={styles.fieldInput} value={pattern} onChange={e => onPatternChange(e.target.value)} placeholder="てしまう" />
                        </div>
                        <div className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>Display pattern</label>
                            <input className={styles.fieldInput} value={displayPattern} onChange={e => setDisplayPattern(e.target.value)} placeholder="〜てしまう" />
                        </div>
                    </div>
                    <div className={styles.fieldRow2}>
                        <div className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>JLPT *</label>
                            <select className={styles.fieldSelect} value={jlptLevel} onChange={e => setJlptLevel(e.target.value)}>
                                {JLPT_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>Slug *</label>
                            <input className={styles.fieldInput} value={slug} onChange={e => setSlug(e.target.value)} placeholder="te-shimau" />
                        </div>
                    </div>
                    <div className={styles.fieldRow}>
                        <label className={styles.fieldLabel}>Nghĩa (VI) *</label>
                        <input className={styles.fieldInput} value={meaningVi} onChange={e => setMeaningVi(e.target.value)} placeholder="đã lỡ làm, lỡ tay làm" />
                    </div>
                    <div className={styles.fieldRow}>
                        <label className={styles.fieldLabel}>Nghĩa ngắn</label>
                        <input className={styles.fieldInput} value={shortMeaning} onChange={e => setShortMeaning(e.target.value)} placeholder="lỡ làm" />
                    </div>
                    <label className={styles.checkRow}>
                        <input type="checkbox" checked={isCommon} onChange={e => setIsCommon(e.target.checked)} />
                        <span className={styles.checkLabel}>Ngữ pháp phổ biến</span>
                    </label>
                </div>

                {confirmDelete && (
                    <div className={styles.deleteSection}>
                        <p className={styles.deleteWarn}>Xóa ngữ pháp <strong>{row!.display_pattern ?? row!.pattern}</strong>? Không thể hoàn tác.</p>
                        <div className={styles.deleteActions}>
                            <button className={styles.btnGhost} onClick={() => setConfirmDelete(false)}>Hủy</button>
                            <button className={styles.btnDanger} onClick={doDelete} disabled={deleting}>{deleting ? "Đang xóa…" : "Xác nhận xóa"}</button>
                        </div>
                    </div>
                )}

                {error && <p className={styles.modalError}>{error}</p>}

                <div className={styles.modalFooter}>
                    <div>
                        {!isNew && !confirmDelete && (
                            <button className={styles.btnDelete} onClick={() => setConfirmDelete(true)}>
                                <Trash2 size={14} /> Xóa
                            </button>
                        )}
                    </div>
                    <div className={styles.modalFooterRight}>
                        <button className={styles.btnGhost} onClick={onClose}>Hủy</button>
                        <button className={styles.btnPrimary} onClick={save} disabled={saving || !canSave}>
                            {saving ? "Đang lưu…" : isNew ? "Thêm" : "Lưu"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function GrammarDataClient({ initialRows, initialTotal }: { initialRows: GrammarRow[]; initialTotal: number }) {
    const [rows, setRows] = useState(initialRows)
    const [total, setTotal] = useState(initialTotal)
    const [page, setPage] = useState(0)
    const [query, setQuery] = useState("")
    const [jlptFilter, setJlptFilter] = useState("")
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState<GrammarRow | null | "new">(null)
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const fetchRows = useCallback(async (q: string, jlpt: string, p: number) => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(p) })
            if (q) params.set("q", q)
            if (jlpt) params.set("jlpt", jlpt)
            const res = await fetch(`/api/admin/data/grammar?${params}`)
            if (!res.ok) return
            const json = await res.json()
            setRows(json.rows ?? []); setTotal(json.total ?? 0)
        } finally { setLoading(false) }
    }, [])

    function onSearch(v: string) {
        setQuery(v); setPage(0)
        if (searchTimer.current) clearTimeout(searchTimer.current)
        searchTimer.current = setTimeout(() => fetchRows(v, jlptFilter, 0), 300)
    }

    function onJlpt(v: string) { setJlptFilter(v); setPage(0); fetchRows(query, v, 0) }
    function goPage(p: number) { setPage(p); fetchRows(query, jlptFilter, p) }

    function handleSaved(r: GrammarRow) {
        if (selected === "new") { setRows(prev => [r, ...prev]); setTotal(t => t + 1) }
        else { setRows(prev => prev.map(x => x.id === r.id ? r : x)) }
        setSelected(null)
    }

    function handleDeleted(id: number) { setRows(prev => prev.filter(x => x.id !== id)); setTotal(t => t - 1); setSelected(null) }

    const totalPages = Math.max(1, Math.ceil(total / 50))

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h2 className={styles.pageTitle}>Ngữ pháp</h2>
                    <p className={styles.pageSubtitle}>{total.toLocaleString("vi-VN")} mẫu ngữ pháp</p>
                </div>
                <button className={styles.addBtn} onClick={() => setSelected("new")}><Plus size={14} /> Thêm ngữ pháp</button>
            </div>

            <div className={styles.filterBar}>
                <div className={styles.searchWrap}>
                    <Search size={14} className={styles.searchIcon} />
                    <input className={styles.searchInput} placeholder="Tìm pattern, nghĩa…" value={query} onChange={e => onSearch(e.target.value)} />
                    {query && <button className={styles.searchClear} onClick={() => onSearch("")}><X size={12} /></button>}
                </div>
                <select className={styles.filterSelect} value={jlptFilter} onChange={e => onJlpt(e.target.value)}>
                    <option value="">Tất cả JLPT</option>
                    {JLPT_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>ID</th>
                            <th className={styles.th}>Pattern</th>
                            <th className={`${styles.th} ${styles.thCenter}`}>JLPT</th>
                            <th className={styles.th}>Nghĩa</th>
                            <th className={styles.th}>Nghĩa ngắn</th>
                            <th className={`${styles.th} ${styles.thCenter}`}>Phổ biến</th>
                            <th className={styles.th}>AI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className={styles.loadingRow}>Đang tải…</td></tr>
                        ) : rows.length === 0 ? (
                            <tr><td colSpan={7} className={styles.emptyRow}>Không tìm thấy kết quả</td></tr>
                        ) : rows.map(r => (
                            <tr key={r.id} className={styles.tr} onClick={() => setSelected(r)}>
                                <td className={`${styles.td} ${styles.idCell}`}>#{r.id}</td>
                                <td className={`${styles.td} ${styles.monoCell}`}>{r.display_pattern ?? r.pattern}</td>
                                <td className={`${styles.td} ${styles.tdCenter}`}><JlptBadge level={r.jlpt_level} /></td>
                                <td className={styles.td}>{r.meaning_vi}</td>
                                <td className={styles.td}>{r.short_meaning_vi ?? "—"}</td>
                                <td className={`${styles.td} ${styles.tdCenter}`}>
                                    {r.is_common ? <span className={styles.commonBadge}>Phổ biến</span> : "—"}
                                </td>
                                <td className={styles.td}>{r.ai_status ?? "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button className={styles.pageBtn} disabled={page === 0} onClick={() => goPage(page - 1)}>← Trước</button>
                    <span className={styles.pageInfo}>Trang {page + 1} / {totalPages}<span className={styles.pageCount}>({total.toLocaleString("vi-VN")})</span></span>
                    <button className={styles.pageBtn} disabled={page >= totalPages - 1} onClick={() => goPage(page + 1)}>Tiếp →</button>
                </div>
            )}

            {selected !== null && (
                <GrammarModal
                    row={selected === "new" ? null : selected}
                    onClose={() => setSelected(null)}
                    onSaved={handleSaved}
                    onDeleted={handleDeleted}
                />
            )}
        </div>
    )
}
