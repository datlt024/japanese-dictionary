"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Plus, Search, X, Trash2 } from "lucide-react"
import styles from "../shared.module.css"

export type KanjiRow = {
    id: number
    kanji: string
    meaning_vi: string | null
    meaning_en: string | null
    onyomi: string | null
    kunyomi: string | null
    han_viet: string | null
    jlpt: number | null
    stroke_count: number | null
    created_at: string | null
}

const JLPT_NUM_TO_LABEL: Record<number, string> = { 5: "N5", 4: "N4", 3: "N3", 2: "N2", 1: "N1" }
const JLPT_LABEL_TO_CLASS: Record<string, string> = { N5: "jlptN5", N4: "jlptN4", N3: "jlptN3", N2: "jlptN2", N1: "jlptN1" }

function JlptBadge({ jlpt }: { jlpt: number | null }) {
    if (!jlpt) return <span style={{ color: "var(--color-text-muted)" }}>—</span>
    const label = JLPT_NUM_TO_LABEL[jlpt] ?? String(jlpt)
    return <span className={`${styles.jlptBadge} ${styles[JLPT_LABEL_TO_CLASS[label] ?? ""]}`}>{label}</span>
}

function KanjiModal({
    row, onClose, onSaved, onDeleted,
}: {
    row: KanjiRow | null
    onClose: () => void
    onSaved: (r: KanjiRow) => void
    onDeleted?: (id: number) => void
}) {
    const isNew = row === null
    const [kanji, setKanji] = useState(row?.kanji ?? "")
    const [meaningVi, setMeaningVi] = useState(row?.meaning_vi ?? "")
    const [meaningEn, setMeaningEn] = useState(row?.meaning_en ?? "")
    const [onyomi, setOnyomi] = useState(row?.onyomi ?? "")
    const [kunyomi, setKunyomi] = useState(row?.kunyomi ?? "")
    const [hanViet, setHanViet] = useState(row?.han_viet ?? "")
    const [jlpt, setJlpt] = useState(row?.jlpt !== null ? String(row?.jlpt ?? "") : "")
    const [strokeCount, setStrokeCount] = useState(row?.stroke_count !== null ? String(row?.stroke_count ?? "") : "")
    const [memoryTip, setMemoryTip] = useState("")
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
        document.addEventListener("keydown", h)
        return () => document.removeEventListener("keydown", h)
    }, [onClose])

    async function save() {
        setSaving(true); setError(null)
        try {
            const body = {
                kanji,
                meaning_vi: meaningVi || null,
                meaning_en: meaningEn || null,
                onyomi: onyomi || null,
                kunyomi: kunyomi || null,
                han_viet: hanViet || null,
                jlpt: jlpt ? Number(jlpt) : null,
                stroke_count: strokeCount ? Number(strokeCount) : null,
                memory_tip: memoryTip || null,
            }
            const url  = isNew ? "/api/admin/data/kanji" : `/api/admin/data/kanji/${row!.id}`
            const res  = await fetch(url, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
            const json = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(json.error ?? "Lỗi không xác định")
            onSaved(json as KanjiRow)
        } catch (e) { setError(e instanceof Error ? e.message : "Lỗi") }
        finally { setSaving(false) }
    }

    async function doDelete() {
        setDeleting(true); setError(null)
        try {
            const res = await fetch(`/api/admin/data/kanji/${row!.id}`, { method: "DELETE" })
            if (!res.ok && res.status !== 204) { const j = await res.json().catch(() => ({})); throw new Error(j.error ?? "Lỗi") }
            onDeleted?.(row!.id)
        } catch (e) { setError(e instanceof Error ? e.message : "Lỗi"); setDeleting(false); setConfirmDelete(false) }
    }

    return (
        <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
            <div className={styles.modal} role="dialog" aria-modal="true">
                <div className={styles.modalHeader}>
                    <p className={styles.modalTitle}>{isNew ? "Thêm hán tự" : `Sửa #${row!.id} — ${row!.kanji}`}</p>
                    <button className={styles.modalClose} onClick={onClose}><X size={16} /></button>
                </div>

                <div className={styles.modalForm}>
                    <div className={styles.fieldRow2}>
                        <div className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>Kanji *</label>
                            <input className={styles.fieldInput} value={kanji} onChange={e => setKanji(e.target.value)} placeholder="食" style={{ fontSize: 22, textAlign: "center" }} />
                        </div>
                        <div className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>JLPT (1–5)</label>
                            <select className={styles.fieldSelect} value={jlpt} onChange={e => setJlpt(e.target.value)}>
                                <option value="">— Chưa xác định —</option>
                                <option value="5">N5</option>
                                <option value="4">N4</option>
                                <option value="3">N3</option>
                                <option value="2">N2</option>
                                <option value="1">N1</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.fieldRow2}>
                        <div className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>Nghĩa (VI)</label>
                            <input className={styles.fieldInput} value={meaningVi} onChange={e => setMeaningVi(e.target.value)} placeholder="ăn, thực phẩm" />
                        </div>
                        <div className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>Nghĩa (EN)</label>
                            <input className={styles.fieldInput} value={meaningEn} onChange={e => setMeaningEn(e.target.value)} placeholder="eat, food" />
                        </div>
                    </div>
                    <div className={styles.fieldRow2}>
                        <div className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>Âm on</label>
                            <input className={styles.fieldInput} value={onyomi} onChange={e => setOnyomi(e.target.value)} placeholder="ショク、ジキ" />
                        </div>
                        <div className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>Âm kun</label>
                            <input className={styles.fieldInput} value={kunyomi} onChange={e => setKunyomi(e.target.value)} placeholder="た.べる、く.う" />
                        </div>
                    </div>
                    <div className={styles.fieldRow2}>
                        <div className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>Hán Việt</label>
                            <input className={styles.fieldInput} value={hanViet} onChange={e => setHanViet(e.target.value)} placeholder="THỰC" />
                        </div>
                        <div className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>Số nét</label>
                            <input className={styles.fieldInput} type="number" min={1} max={64} value={strokeCount} onChange={e => setStrokeCount(e.target.value)} placeholder="9" />
                        </div>
                    </div>
                    {isNew && (
                        <div className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>Gợi nhớ</label>
                            <textarea className={styles.fieldTextarea} value={memoryTip} onChange={e => setMemoryTip(e.target.value)} placeholder="Mẹo ghi nhớ…" />
                        </div>
                    )}
                </div>

                {confirmDelete && (
                    <div className={styles.deleteSection}>
                        <p className={styles.deleteWarn}>Xóa hán tự <strong>{row!.kanji}</strong>? Không thể hoàn tác.</p>
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
                        <button className={styles.btnPrimary} onClick={save} disabled={saving || !kanji.trim()}>
                            {saving ? "Đang lưu…" : isNew ? "Thêm" : "Lưu"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function KanjiDataClient({ initialRows, initialTotal }: { initialRows: KanjiRow[]; initialTotal: number }) {
    const [rows, setRows] = useState(initialRows)
    const [total, setTotal] = useState(initialTotal)
    const [page, setPage] = useState(0)
    const [query, setQuery] = useState("")
    const [jlptFilter, setJlptFilter] = useState("")
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState<KanjiRow | null | "new">(null)
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const fetchRows = useCallback(async (q: string, jlpt: string, p: number) => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(p) })
            if (q) params.set("q", q)
            if (jlpt) params.set("jlpt", jlpt)
            const res = await fetch(`/api/admin/data/kanji?${params}`)
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

    function handleSaved(r: KanjiRow) {
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
                    <h2 className={styles.pageTitle}>Hán tự</h2>
                    <p className={styles.pageSubtitle}>{total.toLocaleString("vi-VN")} hán tự</p>
                </div>
                <button className={styles.addBtn} onClick={() => setSelected("new")}><Plus size={14} /> Thêm hán tự</button>
            </div>

            <div className={styles.filterBar}>
                <div className={styles.searchWrap}>
                    <Search size={14} className={styles.searchIcon} />
                    <input className={styles.searchInput} placeholder="Tìm kanji, nghĩa, hán việt, on/kun…" value={query} onChange={e => onSearch(e.target.value)} />
                    {query && <button className={styles.searchClear} onClick={() => onSearch("")}><X size={12} /></button>}
                </div>
                <select className={styles.filterSelect} value={jlptFilter} onChange={e => onJlpt(e.target.value)}>
                    <option value="">Tất cả JLPT</option>
                    <option value="5">N5</option>
                    <option value="4">N4</option>
                    <option value="3">N3</option>
                    <option value="2">N2</option>
                    <option value="1">N1</option>
                </select>
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>ID</th>
                            <th className={`${styles.th} ${styles.thCenter}`}>Kanji</th>
                            <th className={`${styles.th} ${styles.thCenter}`}>JLPT</th>
                            <th className={styles.th}>Nghĩa (VI)</th>
                            <th className={styles.th}>Hán Việt</th>
                            <th className={styles.th}>Âm on</th>
                            <th className={styles.th}>Âm kun</th>
                            <th className={`${styles.th} ${styles.thCenter}`}>Nét</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} className={styles.loadingRow}>Đang tải…</td></tr>
                        ) : rows.length === 0 ? (
                            <tr><td colSpan={8} className={styles.emptyRow}>Không tìm thấy kết quả</td></tr>
                        ) : rows.map(r => (
                            <tr key={r.id} className={styles.tr} onClick={() => setSelected(r)}>
                                <td className={`${styles.td} ${styles.idCell}`}>#{r.id}</td>
                                <td className={`${styles.td} ${styles.tdCenter} ${styles.monoCell}`} style={{ fontSize: 20 }}>{r.kanji}</td>
                                <td className={`${styles.td} ${styles.tdCenter}`}><JlptBadge jlpt={r.jlpt} /></td>
                                <td className={styles.td}>{r.meaning_vi ?? "—"}</td>
                                <td className={styles.td}>{r.han_viet ?? "—"}</td>
                                <td className={styles.td}>{r.onyomi ?? "—"}</td>
                                <td className={styles.td}>{r.kunyomi ?? "—"}</td>
                                <td className={`${styles.td} ${styles.tdCenter}`}>{r.stroke_count ?? "—"}</td>
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
                <KanjiModal
                    row={selected === "new" ? null : selected}
                    onClose={() => setSelected(null)}
                    onSaved={handleSaved}
                    onDeleted={handleDeleted}
                />
            )}
        </div>
    )
}
