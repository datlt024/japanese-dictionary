"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Heart, MessageSquare, Search } from "lucide-react"
import styles from "./page.module.css"

export type CommentRecord = {
    id: string
    user_id: string
    display_name: string
    entry_type: string
    entry_id: number
    content: string
    likes_count: number
    created_at: string
}

type Props = {
    comments: CommentRecord[]
    total: number
    page: number
    totalPages: number
    currentEntryType: string
}

const ENTRY_TYPE_LABEL: Record<string, string> = {
    vocabulary: "Từ vựng",
    kanji: "Hán tự",
    grammar: "Ngữ pháp",
}

const ENTRY_TYPE_HREF: Record<string, string> = {
    vocabulary: "/vocabulary",
    kanji: "/kanji",
    grammar: "/grammar",
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    })
}

export default function CommentsClient({ comments: initial, page, totalPages, currentEntryType }: Props) {
    const [comments, setComments] = useState(initial)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [confirmId, setConfirmId] = useState<string | null>(null)
    const [, startTransition] = useTransition()
    const router = useRouter()

    async function handleDelete(id: string) {
        setDeleting(id)
        setConfirmId(null)
        try {
            const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" })
            if (res.ok || res.status === 204) {
                setComments((prev) => prev.filter((c) => c.id !== id))
            }
        } finally {
            setDeleting(null)
        }
    }

    function navigate(newPage: number, entryType: string) {
        const params = new URLSearchParams()
        if (newPage > 0) params.set("page", String(newPage))
        if (entryType) params.set("entry_type", entryType)
        startTransition(() => router.push(`/admin/comments?${params.toString()}`))
    }

    return (
        <>
            {/* Filter bar */}
            <div className={styles.filterBar}>
                <div className={styles.filterLabel}><Search size={14} /> Lọc:</div>
                {["", "vocabulary", "kanji", "grammar"].map((t) => (
                    <button
                        key={t}
                        type="button"
                        className={`${styles.filterBtn} ${currentEntryType === t ? styles.filterBtnActive : ""}`}
                        onClick={() => navigate(0, t)}
                    >
                        {t ? ENTRY_TYPE_LABEL[t] : "Tất cả"}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className={styles.tableWrap}>
                <table className={styles.table} aria-label="Danh sách bình luận">
                    <thead>
                        <tr>
                            <th className={styles.th}>Người dùng</th>
                            <th className={styles.th}>Loại</th>
                            <th className={styles.th}>Nội dung</th>
                            <th className={`${styles.th} ${styles.thCenter}`}><Heart size={12} /></th>
                            <th className={styles.th}>Thời gian</th>
                            <th className={`${styles.th} ${styles.thCenter}`}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments.length === 0 ? (
                            <tr>
                                <td colSpan={6} className={styles.emptyRow}>
                                    <MessageSquare size={28} style={{ opacity: 0.3 }} />
                                    <span>Không có bình luận nào</span>
                                </td>
                            </tr>
                        ) : comments.map((c) => (
                            confirmId === c.id ? (
                                <tr key={c.id} className={`${styles.tr} ${styles.trConfirm}`}>
                                    <td colSpan={6} className={`${styles.td} ${styles.confirmCell}`}>
                                        <Trash2 size={14} className={styles.confirmIcon} />
                                        <span className={styles.confirmText}>
                                            Xóa bình luận của <strong>{c.display_name}</strong>? Không thể hoàn tác.
                                        </span>
                                        <button
                                            type="button"
                                            className={styles.confirmCancelBtn}
                                            onClick={() => setConfirmId(null)}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.confirmDeleteBtn}
                                            onClick={() => handleDelete(c.id)}
                                            disabled={deleting === c.id}
                                        >
                                            {deleting === c.id ? "Đang xóa…" : "Xác nhận xóa"}
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={c.id} className={styles.tr}>
                                    <td className={styles.td}>
                                        <span className={styles.userName}>{c.display_name}</span>
                                    </td>
                                    <td className={styles.td}>
                                        <a
                                            href={`${ENTRY_TYPE_HREF[c.entry_type] ?? ""}/${c.entry_id}`}
                                            className={styles.entryLink}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <span className={`${styles.entryBadge} ${styles[`entry_${c.entry_type}`]}`}>
                                                {ENTRY_TYPE_LABEL[c.entry_type] ?? c.entry_type}
                                            </span>
                                            <span className={styles.entryId}>#{c.entry_id}</span>
                                        </a>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={styles.contentCell}>{c.content}</span>
                                    </td>
                                    <td className={`${styles.td} ${styles.tdCenter}`}>
                                        <span className={styles.likeCount}>{c.likes_count}</span>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={styles.dateCell}>{fmtDate(c.created_at)}</span>
                                    </td>
                                    <td className={`${styles.td} ${styles.tdCenter}`}>
                                        <button
                                            type="button"
                                            className={styles.deleteBtn}
                                            onClick={() => setConfirmId(c.id)}
                                            disabled={deleting === c.id}
                                            aria-label="Xóa bình luận"
                                            title="Xóa"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            )
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
                        onClick={() => navigate(page - 1, currentEntryType)}
                    >
                        ← Trang trước
                    </button>
                    <span className={styles.pageInfo}>Trang {page + 1} / {totalPages}</span>
                    <button
                        type="button"
                        className={styles.pageBtn}
                        disabled={page >= totalPages - 1}
                        onClick={() => navigate(page + 1, currentEntryType)}
                    >
                        Trang tiếp →
                    </button>
                </div>
            )}
        </>
    )
}
