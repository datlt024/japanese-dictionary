"use client"

import { useState, useRef, useEffect } from "react"
import { useFocusTrap } from "@/shared/hooks/useFocusTrap"
import useSWR from "swr"
import Link from "next/link"
import {
    BookOpen,
    Check,
    ChevronRight,
    Eye,
    EyeOff,
    Folder,
    FolderOpen,
    Pencil,
    Plus,
    Save,
    X,
} from "lucide-react"
import styles from "./AdminClient.module.css"

interface AdminGroup {
    id: string
    name: string
    description: string | null
    is_public: boolean
    public_description: string | null
    display_order: number
    notebook_count: number
}

interface AdminNotebook {
    id: string
    name: string
    description: string | null
    is_public: boolean
    public_category: string | null
    public_description: string | null
    display_order: number
    item_count: number
    group_id: string | null
}

async function fetchGroups(): Promise<AdminGroup[]> {
    const res = await fetch("/api/admin/groups")
    if (!res.ok) throw new Error("fetch failed")
    return res.json()
}

async function fetchNotebooks(): Promise<AdminNotebook[]> {
    const res = await fetch("/api/admin/notebooks")
    if (!res.ok) throw new Error("fetch failed")
    return res.json()
}

// ── Create notebook modal ─────────────────────────

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const modalRef = useRef<HTMLDivElement>(null)
    useFocusTrap(modalRef, true, onClose)

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
            <div ref={modalRef} className={styles.modal} role="dialog" aria-modal="true" aria-label="Tạo sổ tay mới" onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <p className={styles.modalTitle}>Tạo sổ tay mới</p>
                    <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Đóng">
                        <X size={16} />
                    </button>
                </div>
                <div className={styles.modalBody}>
                    <label className={styles.label} htmlFor="create-notebook-name">Tên sổ tay</label>
                    <input
                        id="create-notebook-name"
                        className={styles.input}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ví dụ: Bài 1–10"
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

// ── Group row ─────────────────────────────────────

interface GroupRowProps {
    group: AdminGroup
    notebooks: AdminNotebook[]
    onTogglePublic: (id: string, value: boolean) => Promise<void>
    onSaveGroup: (id: string, updates: Partial<AdminGroup>) => Promise<void>
    onCreateNotebook: () => void
}

function GroupRow({ group, notebooks, onTogglePublic, onSaveGroup, onCreateNotebook }: GroupRowProps) {
    const [expanded, setExpanded] = useState(false)
    const [editing, setEditing] = useState(false)
    const [desc, setDesc] = useState(group.public_description ?? "")
    const [order, setOrder] = useState(String(group.display_order))
    const [toggling, setToggling] = useState(false)
    const [saving, setSaving] = useState(false)

    const groupNotebooks = notebooks.filter((nb) => nb.group_id === group.id)

    async function handleToggle() {
        setToggling(true)
        await onTogglePublic(group.id, !group.is_public)
        setToggling(false)
    }

    async function handleSave() {
        setSaving(true)
        await onSaveGroup(group.id, {
            public_description: desc.trim() || null,
            display_order: parseInt(order, 10) || 0,
        })
        setSaving(false)
        setEditing(false)
    }

    return (
        <div className={styles.groupWrap} data-public={group.is_public || undefined}>
            <div className={styles.groupHeader}>
                <button type="button" className={styles.expandBtn} onClick={() => setExpanded(!expanded)}>
                    {expanded ? <FolderOpen size={15} /> : <Folder size={15} />}
                    <span className={styles.groupName}>{group.name}</span>
                    <span className={styles.nbCount}>{groupNotebooks.length} sổ tay</span>
                    <ChevronRight size={13} className={styles.expandChevron} data-open={expanded || undefined} />
                </button>

                <div className={styles.rowActions}>
                    <button type="button" className={styles.iconBtn} onClick={() => setEditing(!editing)} title="Chỉnh sửa">
                        <Pencil size={13} />
                    </button>
                    <button
                        type="button"
                        className={group.is_public ? styles.btnPublic : styles.btnPrivate}
                        onClick={handleToggle}
                        disabled={toggling}
                        title={group.is_public ? "Đang công khai — nhấn để ẩn cả nhóm" : "Nhấn để công khai cả nhóm"}
                    >
                        {group.is_public ? <Eye size={13} /> : <EyeOff size={13} />}
                        {group.is_public ? "Công khai" : "Riêng tư"}
                    </button>
                </div>
            </div>

            {editing && (
                <div className={styles.editRow}>
                    <div className={styles.editGrid}>
                        <div className={styles.editField}>
                            <label className={styles.label} htmlFor={`group-desc-${group.id}`}>Mô tả công khai</label>
                            <input
                                id={`group-desc-${group.id}`}
                                className={styles.input}
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                placeholder="Mô tả hiển thị trong tab Khám phá"
                            />
                        </div>
                        <div className={styles.editField}>
                            <label className={styles.label} htmlFor={`group-order-${group.id}`}>Thứ tự</label>
                            <input
                                id={`group-order-${group.id}`}
                                className={styles.input}
                                type="number"
                                min={0}
                                value={order}
                                onChange={(e) => setOrder(e.target.value)}
                                style={{ width: 80 }}
                            />
                        </div>
                    </div>
                    <div className={styles.editActions}>
                        <div style={{ flex: 1 }} />
                        <button type="button" className={styles.btnSecondary} onClick={() => setEditing(false)}>Hủy</button>
                        <button type="button" className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
                            <Save size={13} />
                            {saving ? "Đang lưu…" : "Lưu"}
                        </button>
                    </div>
                </div>
            )}

            {expanded && (
                <div className={styles.groupNotebooks}>
                    {groupNotebooks.length === 0 ? (
                        <p className={styles.emptyGroupMsg}>Nhóm này chưa có sổ tay nào.</p>
                    ) : (
                        groupNotebooks.map((nb) => (
                            <div key={nb.id} className={styles.subRow}>
                                <BookOpen size={13} className={styles.rowIcon} />
                                <span className={styles.subRowName}>{nb.name}</span>
                                <span className={styles.itemCount}>{nb.item_count} mục</span>
                                <Link href={`/notebooks/${nb.id}`} className={styles.iconBtn} target="_blank" title="Xem">
                                    <ChevronRight size={13} />
                                </Link>
                            </div>
                        ))
                    )}
                    <button type="button" className={styles.addNbBtn} onClick={onCreateNotebook}>
                        <Plus size={13} />
                        Thêm sổ tay vào nhóm
                    </button>
                </div>
            )}
        </div>
    )
}

// ── Standalone notebook row ───────────────────────

function NotebookRow({
    nb,
    onTogglePublic,
}: {
    nb: AdminNotebook
    onTogglePublic: (id: string, value: boolean) => Promise<void>
}) {
    const [toggling, setToggling] = useState(false)

    async function handleToggle() {
        setToggling(true)
        await onTogglePublic(nb.id, !nb.is_public)
        setToggling(false)
    }

    return (
        <div className={styles.rowWrap} data-public={nb.is_public || undefined}>
            <div className={styles.rowMain}>
                <BookOpen size={14} className={styles.rowIcon} />
                <div className={styles.rowInfo}>
                    <span className={styles.rowName}>{nb.name}</span>
                    <div className={styles.rowMeta}>
                        {nb.public_category && <span className={styles.catTag}>{nb.public_category}</span>}
                        <span className={styles.itemCount}>{nb.item_count} mục</span>
                    </div>
                </div>
                <div className={styles.rowActions}>
                    <Link href={`/notebooks/${nb.id}`} className={styles.iconBtn} target="_blank" title="Xem">
                        <ChevronRight size={14} />
                    </Link>
                    <button
                        type="button"
                        className={nb.is_public ? styles.btnPublic : styles.btnPrivate}
                        onClick={handleToggle}
                        disabled={toggling}
                    >
                        {nb.is_public ? <Eye size={13} /> : <EyeOff size={13} />}
                        {nb.is_public ? "Công khai" : "Riêng tư"}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Main ──────────────────────────────────────────

export default function AdminClient() {
    const { data: groups, isLoading: groupsLoading, mutate: mutateGroups } = useSWR<AdminGroup[]>(
        "/api/admin/groups", fetchGroups, { revalidateOnFocus: false }
    )
    const { data: notebooks, isLoading: nbsLoading, mutate: mutateNbs } = useSWR<AdminNotebook[]>(
        "/api/admin/notebooks", fetchNotebooks, { revalidateOnFocus: false }
    )

    const [showCreate, setShowCreate] = useState(false)
    const [saved, setSaved] = useState(false)
    const savedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    useEffect(() => () => clearTimeout(savedTimerRef.current), [])

    const allGroups = groups ?? []
    const allNbs = notebooks ?? []
    // standalone = notebooks not in any group
    const standaloneNbs = allNbs.filter((nb) => !nb.group_id)

    const isLoading = groupsLoading || nbsLoading

    async function toggleGroupPublic(id: string, value: boolean) {
        await fetch(`/api/admin/groups/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_public: value }),
        })
        mutateGroups()
    }

    async function saveGroup(id: string, updates: Partial<AdminGroup>) {
        await fetch(`/api/admin/groups/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        })
        setSaved(true)
        clearTimeout(savedTimerRef.current)
        savedTimerRef.current = setTimeout(() => setSaved(false), 2000)
        mutateGroups()
    }

    async function toggleNbPublic(id: string, value: boolean) {
        await fetch(`/api/admin/notebooks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_public: value }),
        })
        mutateNbs()
    }

    const publicGroupCount = allGroups.filter((g) => g.is_public).length
    const publicNbCount = allNbs.filter((nb) => nb.is_public).length

    return (
        <main className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.pageTitle}>Quản lý nội dung Khám phá</h1>
                    <p className={styles.pageMeta}>
                        {allGroups.length} nhóm ({publicGroupCount} công khai) ·{" "}
                        {allNbs.length} sổ tay ({publicNbCount} công khai)
                    </p>
                </div>
                <button type="button" className={styles.btnPrimary} onClick={() => setShowCreate(true)}>
                    <Plus size={14} /> Tạo sổ tay
                </button>
            </div>

            {saved && (
                <div className={styles.toast}>
                    <Check size={14} /> Đã lưu thay đổi
                </div>
            )}

            {isLoading && (
                <div className={styles.skeletonList}>
                    {[1, 2, 3].map((i) => <div key={i} className={styles.skeletonRow} />)}
                </div>
            )}

            {!isLoading && allGroups.length > 0 && (
                <section className={styles.adminSection}>
                    <h2 className={styles.adminSectionTitle}>
                        <Folder size={14} /> Nhóm sổ tay
                    </h2>
                    <p className={styles.adminSectionDesc}>
                        Bật &ldquo;Công khai&rdquo; cho một nhóm để toàn bộ sổ tay trong nhóm đó hiện trong tab Khám phá.
                    </p>
                    <div className={styles.notebookList}>
                        {allGroups.map((g) => (
                            <GroupRow
                                key={g.id}
                                group={g}
                                notebooks={allNbs}
                                onTogglePublic={toggleGroupPublic}
                                onSaveGroup={saveGroup}
                                onCreateNotebook={() => setShowCreate(true)}

                            />
                        ))}
                    </div>
                </section>
            )}

            {!isLoading && standaloneNbs.length > 0 && (
                <section className={styles.adminSection}>
                    <h2 className={styles.adminSectionTitle}>
                        <BookOpen size={14} /> Sổ tay riêng lẻ
                    </h2>
                    <p className={styles.adminSectionDesc}>
                        Bật &ldquo;Công khai&rdquo; để hiện từng sổ tay riêng lẻ trong tab Khám phá.
                    </p>
                    <div className={styles.notebookList}>
                        {standaloneNbs.map((nb) => (
                            <NotebookRow key={nb.id} nb={nb} onTogglePublic={toggleNbPublic} />
                        ))}
                    </div>
                </section>
            )}

            {!isLoading && allGroups.length === 0 && standaloneNbs.length === 0 && (
                <div className={styles.emptyState}>
                    <p>Chưa có nhóm hay sổ tay nào. Hãy tạo sổ tay đầu tiên.</p>
                </div>
            )}

            {showCreate && (
                <CreateModal
                    onClose={() => setShowCreate(false)}
                    onCreated={() => mutateNbs()}
                />
            )}
        </main>
    )
}
