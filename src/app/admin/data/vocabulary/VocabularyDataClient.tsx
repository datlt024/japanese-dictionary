"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Plus, Search, X, Trash2 } from "lucide-react"
import styles from "../shared.module.css"

export type VocabRow = {
    id: number
    primary_word: string
    primary_kana: string | null
    romaji: string | null
    jlpt: string | null
    is_common: boolean | null
    verb_group: string | null
    created_at: string | null
    vocabulary_senses?: { meaning_vi: string | null; meaning_en: string | null }[] | null
}

const JLPT_OPTIONS = ["N5", "N4", "N3", "N2", "N1"]

function JlptBadge({ level }: { level: string | null }) {
    if (!level) return <span style={{ color: "var(--color-text-muted)" }}>—</span>
    return <span className={`${styles.jlptBadge} ${styles[`jlpt${level}`]}`}>{level}</span>
}

/* ── Edit / Create Modal ── */
function VocabModal({
    row, onClose, onSaved, onDeleted,
}: {
    row: VocabRow | null
    onClose: () => void
    onSaved: (r: VocabRow) => void
    onDeleted?: (id: number) => void
}) {
    const isNew = row === null
    const [primaryWord, setPrimaryWord] = useState(row?.primary_word ?? "")
    const [primaryKana, setPrimaryKana] = useState(row?.primary_kana ?? "")
    const [romaji, setRomaji] = useState(row?.romaji ?? "")
    const [jlpt, setJlpt] = useState(row?.jlpt ?? "")
    const [isCommon, setIsCommon] = useState(row?.is_common ?? false)
    const [verbGroup, setVerbGroup] = useState(row?.verb_group ?? "")
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const firstRef = useRef<HTMLInputElement>(null)

    useEffect(() => { firstRef.current?.focus() }, [])
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
        document.addEventListener("keydown", h)
        return () => document.removeEventListener("keydown", h)
    }, [onClose])

    async function save() {
        setSaving(true); setError(null)
        try {
            const body = {
                primary_word: primaryWord, primary_kana: primaryKana || null, romaji: romaji || null,
                jlpt: jlpt || null, is_common: isCommon, verb_group: verbGroup || null,
            }
            const url  = isNew ? "/api/admin/data/vocabulary" : `/api/admin/data/vocabulary/${row!.id}`
            const res  = await fetch(url, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
            const json = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(json.error ?? "Lỗi không xác định")
            onSaved(json as VocabRow)
        } catch (e) { setError(e instanceof Error ? e.message : "Lỗi không xác định") }
        finally { setSaving(false) }
    }

    async function doDelete() {
        setDeleting(true); setError(null)
        try {
            const res = await fetch(`/api/admin/data/vocabulary/${row!.id}`, { method: "DELETE" })
            if (!res.ok && res.status !== 204) { const j = await res.json().catch(() => ({})); throw new Error(j.error ?? "Lỗi") }
            onDeleted?.(row!.id)
        } catch (e) { setError(e instanceof Error ? e.message : "Lỗi không xác định"); setDeleting(false); setConfirmDelete(false) }
    }

    return (
        <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
            <div className={styles.modal} role="dialog" aria-modal="true">
                <div className={styles.modalHeader}>
                    <p className={styles.modalTitle}>{isNew ? "Thêm từ vựng" : `Sửa #${row!.id}`}</p>
                    <button className={styles.modalClose} onClick={onClose}><X size={16} /></button>
                </div>

                <div className={styles.modalForm}>
                    <div className={styles.fieldRow}>
                        <label className={styles.fieldLabel}>Từ (Kanji / chữ gốc) *</label>
                        <input ref={firstRef} className={styles.fieldInput} value={primaryWord} onChange={e => setPrimaryWord(e.target.value)} placeholder="例: 食べる" />
                    </div>
                    <div className={styles.fieldRow2}>
                        <div className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>Kana</label>
                            <input className={styles.fieldInput} value={primaryKana} onChange={e => setPrimaryKana(e.target.value)} placeholder="例: たべる" />
                        </div>
                        <div className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>Romaji</label>
                            <input className={styles.fieldInput} value={romaji} onChange={e => setRomaji(e.target.value)} placeholder="taberu" />
                        </div>
                    </div>
                    <div className={styles.fieldRow2}>
                        <div className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>JLPT</label>
                            <select className={styles.fieldSelect} value={jlpt} onChange={e => setJlpt(e.target.value)}>
                                <option value="">— Chưa xác định —</option>
                                {JLPT_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>Nhóm động từ</label>
                            <select className={styles.fieldSelect} value={verbGroup} onChange={e => setVerbGroup(e.target.value)}>
                                <option value="">— Không phải ĐT —</option>
                                <option value="v1">v1 (Nhóm 2 / る)</option>
                                <option value="v5">v5 (Nhóm 1 / う)</option>
                                <option value="vs">vs (する)</option>
                                <option value="vi">vi (くる)</option>
                            </select>
                        </div>
                    </div>
                    <label className={styles.checkRow}>
                        <input type="checkbox" checked={isCommon} onChange={e => setIsCommon(e.target.checked)} />
                        <span className={styles.checkLabel}>Từ phổ biến</span>
                    </label>
                </div>

                {confirmDelete && (
                    <div className={styles.deleteSection}>
                        <p className={styles.deleteWarn}>Xóa từ vựng <strong>{row!.primary_word}</strong>? Không thể hoàn tác.</p>
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
                        <button className={styles.btnPrimary} onClick={save} disabled={saving || !primaryWord.trim()}>
                            {saving ? "Đang lưu…" : isNew ? "Thêm" : "Lưu"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ── Main component ── */
export default function VocabularyDataClient({ initialRows, initialTotal }: { initialRows: VocabRow[]; initialTotal: number }) {
    const [rows, setRows] = useState(initialRows)
    const [total, setTotal] = useState(initialTotal)
    const [page, setPage] = useState(0)
    const [query, setQuery] = useState("")
    const [jlptFilter, setJlptFilter] = useState("")
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState<VocabRow | null | "new">(null)
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const fetchRows = useCallback(async (q: string, jlpt: string, p: number) => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(p) })
            if (q) params.set("q", q)
            if (jlpt) params.set("jlpt", jlpt)
            const res = await fetch(`/api/admin/data/vocabulary?${params}`)
            if (!res.ok) return
            const json = await res.json()
            setRows(json.rows ?? [])
            setTotal(json.total ?? 0)
        } finally { setLoading(false) }
    }, [])

    function onSearch(v: string) {
        setQuery(v); setPage(0)
        if (searchTimer.current) clearTimeout(searchTimer.current)
        searchTimer.current = setTimeout(() => fetchRows(v, jlptFilter, 0), 300)
    }

    function onJlpt(v: string) {
        setJlptFilter(v); setPage(0); fetchRows(query, v, 0)
    }

    function goPage(p: number) {
        setPage(p); fetchRows(query, jlptFilter, p)
    }

    function handleSaved(r: VocabRow) {
        if (selected === "new") {
            setRows(prev => [r, ...prev])
            setTotal(t => t + 1)
        } else {
            setRows(prev => prev.map(x => x.id === r.id ? r : x))
        }
        setSelected(null)
    }

    function handleDeleted(id: number) {
        setRows(prev => prev.filter(x => x.id !== id))
        setTotal(t => t - 1)
        setSelected(null)
    }

    const totalPages = Math.max(1, Math.ceil(total / 50))

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h2 className={styles.pageTitle}>Từ vựng</h2>
                    <p className={styles.pageSubtitle}>{total.toLocaleString("vi-VN")} từ</p>
                </div>
                <button className={styles.addBtn} onClick={() => setSelected("new")}>
                    <Plus size={14} /> Thêm từ
                </button>
            </div>

            <div className={styles.filterBar}>
                <div className={styles.searchWrap}>
                    <Search size={14} className={styles.searchIcon} />
                    <input className={styles.searchInput} placeholder="Tìm từ, kana, romaji…" value={query} onChange={e => onSearch(e.target.value)} />
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
                            <th className={styles.th}>Từ</th>
                            <th className={styles.th}>Kana</th>
                            <th className={styles.th}>Nghĩa</th>
                            <th className={`${styles.th} ${styles.thCenter}`}>JLPT</th>
                            <th className={`${styles.th} ${styles.thCenter}`}>Phổ biến</th>
                            <th className={styles.th}>Nhóm ĐT</th>
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
                                <td className={`${styles.td} ${styles.monoCell}`}>{r.primary_word}</td>
                                <td className={styles.td}>{r.primary_kana ?? "—"}</td>
                                <td className={`${styles.td} ${styles.meaningCell}`}>
                                    {r.vocabulary_senses?.map(s => s.meaning_vi ?? s.meaning_en).filter(Boolean).join("; ") || "—"}
                                </td>
                                <td className={`${styles.td} ${styles.tdCenter}`}><JlptBadge level={r.jlpt} /></td>
                                <td className={`${styles.td} ${styles.tdCenter}`}>
                                    {r.is_common ? <span className={styles.commonBadge}>Phổ biến</span> : "—"}
                                </td>
                                <td className={styles.td}>{r.verb_group ?? "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button className={styles.pageBtn} disabled={page === 0} onClick={() => goPage(page - 1)}>← Trước</button>
                    <span className={styles.pageInfo}>Trang {page + 1} / {totalPages}<span className={styles.pageCount}>({total.toLocaleString("vi-VN")} kết quả)</span></span>
                    <button className={styles.pageBtn} disabled={page >= totalPages - 1} onClick={() => goPage(page + 1)}>Tiếp →</button>
                </div>
            )}

            {selected !== null && (
                <VocabModal
                    row={selected === "new" ? null : selected}
                    onClose={() => setSelected(null)}
                    onSaved={handleSaved}
                    onDeleted={handleDeleted}
                />
            )}
        </div>
    )
}
