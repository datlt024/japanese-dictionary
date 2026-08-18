"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import {
    BookOpen,
    Check,
    ChevronDown,
    Eye,
    EyeOff,
    Pencil,
    Plus,
    Save,
    Trash2,
    X,
} from "lucide-react"
import styles from "./AdminClient.module.css"

interface AdminNotebook {
    id: string
    name: string
    description: string | null
    is_public: boolean
    public_category: string | null
    public_description: string | null
    display_order: number
    item_count: number
    created_at: string
}

async function fetchAdminNotebooks(): Promise<AdminNotebook[]> {
    const res = await fetch("/api/admin/notebooks")
    if (!res.ok) throw new Error("fetch failed")
    return res.json()
}

const PRESET_CATEGORIES = [
    "Theo đầu sách",
    "Mẹo thi",
    "Ngữ pháp",
    "Từ vựng theo chủ đề",
    "Khác",
]

// ── Create notebook modal ─────────────────────────

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleCreate() {
        const trimmed = name.trim()
        if (!trimmed) { setError("Tên không được để trống"); return }
        setLoading(true)
        setError(null)
        const res = await fetch("/api/admin/notebooks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: trimmed }),
        })
        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            setError(data.error ?? "Lỗi khi tạo sổ tay")
            setLoading(false)
            return
        }
        setLoading(false)
        onCreated()
        onClose()
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <p className={styles.modalTitle}>Tạo sổ tay mới</p>
                    <button type="button" className={styles.iconBtn} onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>
                <div className={styles.modalBody}>
                    <label className={styles.label}>Tên sổ tay</label>
                    <input
                        className={styles.input}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ví dụ: みんなの日本語 N5"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    />
                    {error && <p className={styles.errorMsg}>{error}</p>}
                </div>
                <div className={styles.modalFooter}>
                    <button type="button" className={styles.btnSecondary} onClick={onClose}>Hủy</button>
                    <button type="button" className={styles.btnPrimary} onClick={handleCreate} disabled={loading}>
                        {loading ? "Đang tạo…" : "Tạo sổ tay"}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Edit row ──────────────────────────────────────

interface EditRowProps {
    nb: AdminNotebook
    onSave: (updates: Partial<AdminNotebook>) => Promise<void>
    onDelete: () => void
    onCancel: () => void
}

function EditRow({ nb, onSave, onDelete, onCancel }: EditRowProps) {
    const [category, setCategory] = useState(nb.public_category ?? "")
    const [desc, setDesc] = useState(nb.public_description ?? "")
    const [order, setOrder] = useState(String(nb.display_order))
    const [loading, setLoading] = useState(false)
    const [showCategoryDrop, setShowCategoryDrop] = useState(false)

    async function handleSave() {
        setLoading(true)
        await onSave({
            public_category: category.trim() || null,
            public_description: desc.trim() || null,
            display_order: parseInt(order, 10) || 0,
        })
        setLoading(false)
    }

    return (
        <div className={styles.editRow}>
            <div className={styles.editGrid}>
                <div className={styles.editField}>
                    <label className={styles.label}>Danh mục</label>
                    <div className={styles.dropWrap}>
                        <input
                            className={styles.input}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Ví dụ: Theo đầu sách"
                            onFocus={() => setShowCategoryDrop(true)}
                            onBlur={() => setTimeout(() => setShowCategoryDrop(false), 150)}
                        />
                        {showCategoryDrop && (
                            <ul className={styles.dropList}>
                                {PRESET_CATEGORIES.map((c) => (
                                    <li key={c}>
                                        <button
                                            type="button"
                                            className={styles.dropItem}
                                            onMouseDown={() => { setCategory(c); setShowCategoryDrop(false) }}
                                        >
                                            {c}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <div className={styles.editField}>
                    <label className={styles.label}>Thứ tự hiển thị</label>
                    <input
                        className={styles.input}
                        type="number"
                        min={0}
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                    />
                </div>
            </div>
            <div className={styles.editField}>
                <label className={styles.label}>Mô tả công khai</label>
                <input
                    className={styles.input}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Mô tả ngắn hiển thị cho người dùng"
                />
            </div>
            <div className={styles.editActions}>
                <button type="button" className={styles.btnDanger} onClick={onDelete}>
                    <Trash2 size={13} /> Xóa
                </button>
                <div style={{ flex: 1 }} />
                <button type="button" className={styles.btnSecondary} onClick={onCancel}>Hủy</button>
                <button type="button" className={styles.btnPrimary} onClick={handleSave} disabled={loading}>
                    <Save size={13} />
                    {loading ? "Đang lưu…" : "Lưu"}
                </button>
            </div>
        </div>
    )
}

// ── Main notebook row ─────────────────────────────

interface RowProps {
    nb: AdminNotebook
    onTogglePublic: (id: string, value: boolean) => Promise<void>
    onSave: (id: string, updates: Partial<AdminNotebook>) => Promise<void>
    onDelete: (id: string) => Promise<void>
}

function NotebookRow({ nb, onTogglePublic, onSave, onDelete }: RowProps) {
    const [editing, setEditing] = useState(false)
    const [toggling, setToggling] = useState(false)

    async function handleToggle() {
        setToggling(true)
        await onTogglePublic(nb.id, !nb.is_public)
        setToggling(false)
    }

    if (editing) {
        return (
            <div className={styles.rowWrap}>
                <div className={styles.rowHeader}>
                    <BookOpen size={14} className={styles.rowIcon} />
                    <span className={styles.rowName}>{nb.name}</span>
                    <span className={styles.itemCount}>{nb.item_count} mục</span>
                </div>
                <EditRow
                    nb={nb}
                    onSave={async (updates) => { await onSave(nb.id, updates); setEditing(false) }}
                    onDelete={async () => { await onDelete(nb.id) }}
                    onCancel={() => setEditing(false)}
                />
            </div>
        )
    }

    return (
        <div className={styles.rowWrap} data-public={nb.is_public || undefined}>
            <div className={styles.rowMain}>
                <BookOpen size={14} className={styles.rowIcon} />
                <div className={styles.rowInfo}>
                    <span className={styles.rowName}>{nb.name}</span>
                    <div className={styles.rowMeta}>
                        {nb.public_category && <span className={styles.catTag}>{nb.public_category}</span>}
                        {nb.public_description && (
                            <span className={styles.rowDesc}>{nb.public_description}</span>
                        )}
                        <span className={styles.itemCount}>{nb.item_count} mục</span>
                    </div>
                </div>
                <div className={styles.rowActions}>
                    <Link
                        href={`/notebooks/${nb.id}`}
                        className={styles.iconBtn}
                        title="Xem sổ tay"
                        target="_blank"
                    >
                        <ChevronDown size={14} style={{ transform: "rotate(-90deg)" }} />
                    </Link>
                    <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => setEditing(true)}
                        title="Chỉnh sửa"
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        type="button"
                        className={nb.is_public ? styles.btnPublic : styles.btnPrivate}
                        onClick={handleToggle}
                        disabled={toggling}
                        title={nb.is_public ? "Đang công khai — nhấn để ẩn" : "Nhấn để công khai"}
                    >
                        {nb.is_public ? <Eye size={13} /> : <EyeOff size={13} />}
                        {nb.is_public ? "Công khai" : "Riêng tư"}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Main admin client ─────────────────────────────

export default function AdminClient() {
    const { data, isLoading, error, mutate } = useSWR<AdminNotebook[]>(
        "/api/admin/notebooks",
        fetchAdminNotebooks,
        { revalidateOnFocus: false }
    )
    const [showCreate, setShowCreate] = useState(false)
    const [saved, setSaved] = useState<string | null>(null)

    async function togglePublic(id: string, value: boolean) {
        await fetch(`/api/admin/notebooks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_public: value }),
        })
        mutate()
    }

    async function saveNotebook(id: string, updates: Partial<AdminNotebook>) {
        await fetch(`/api/admin/notebooks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        })
        setSaved(id)
        setTimeout(() => setSaved(null), 2000)
        mutate()
    }

    async function deleteNotebook(id: string) {
        if (!confirm("Xóa sổ tay này? Hành động không thể hoàn tác.")) return
        await fetch(`/api/admin/notebooks/${id}`, { method: "DELETE" })
        mutate()
    }

    const notebooks = data ?? []
    const publicCount = notebooks.filter((nb) => nb.is_public).length

    return (
        <main className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.pageTitle}>Quản lý sổ tay</h1>
                    <p className={styles.pageMeta}>
                        {notebooks.length} sổ tay — {publicCount} công khai
                    </p>
                </div>
                <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={() => setShowCreate(true)}
                >
                    <Plus size={14} />
                    Tạo sổ tay
                </button>
            </div>

            {saved && (
                <div className={styles.toast}>
                    <Check size={14} /> Đã lưu thay đổi
                </div>
            )}

            {isLoading && (
                <div className={styles.skeletonList}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={styles.skeletonRow} />
                    ))}
                </div>
            )}

            {error && (
                <div className={styles.errorState}>
                    Không thể tải danh sách sổ tay.
                </div>
            )}

            {!isLoading && notebooks.length === 0 && (
                <div className={styles.emptyState}>
                    <p>Chưa có sổ tay nào. Tạo sổ tay đầu tiên để bắt đầu.</p>
                </div>
            )}

            <div className={styles.notebookList}>
                {notebooks.map((nb) => (
                    <NotebookRow
                        key={nb.id}
                        nb={nb}
                        onTogglePublic={togglePublic}
                        onSave={saveNotebook}
                        onDelete={deleteNotebook}
                    />
                ))}
            </div>

            {showCreate && (
                <CreateModal
                    onClose={() => setShowCreate(false)}
                    onCreated={() => mutate()}
                />
            )}
        </main>
    )
}
