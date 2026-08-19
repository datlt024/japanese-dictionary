"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { AlertCircle, BookOpen, Check, ExternalLink, X } from "lucide-react"
import type { EnrichedNotebookItem, NotebookWithCount } from "@/domain/notebook/notebook.type"
import styles from "./ExploreTab.module.css"

import { useFocusTrap } from "@/shared/hooks/useFocusTrap"

interface Props {
    items: EnrichedNotebookItem[]
    notebooks: NotebookWithCount[]
    onClose: () => void
}

export default function AddToNotebookModal({ items, notebooks, onClose }: Props) {
    const [selected,    setSelected]    = useState<string | null>(null)
    const [loading,     setLoading]     = useState(false)
    const [done,        setDone]        = useState(false)
    const [addedCount,  setAddedCount]  = useState(0)
    const titleId  = "add-notebook-modal-title"
    const firstRef = useRef<HTMLButtonElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)

    useFocusTrap(modalRef, true, onClose)

    useEffect(() => { firstRef.current?.focus() }, [])
    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onClose])

    async function handleAdd() {
        if (!selected) return
        setLoading(true)
        const results = await Promise.allSettled(
            items.map((item) =>
                fetch(`/api/notebooks/${selected}/items`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ item_type: item.item_type, item_id: item.item_id }),
                })
            )
        )
        const succeeded = results.filter((r) => r.status === "fulfilled" && (r.value as Response).ok).length
        setAddedCount(succeeded)
        setLoading(false)
        setDone(true)
    }

    const selectedNb = notebooks.find((nb) => nb.id === selected)

    return (
        <div className={styles.modalOverlay} onClick={onClose} role="presentation">
            <div
                className={styles.modal}
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <div className={styles.modalHeader}>
                    <p id={titleId} className={styles.modalTitle}>Thêm vào sổ tay</p>
                    <button ref={firstRef} type="button" className={styles.modalClose} onClick={onClose} aria-label="Đóng">
                        <X size={16} />
                    </button>
                </div>

                {done ? (
                    <div className={styles.modalDone}>
                        <Check size={28} className={styles.modalDoneIcon} />
                        <p className={styles.modalDoneTitle}>Đã thêm {addedCount}/{items.length} mục</p>
                        {selectedNb && (
                            <Link href={`/notebooks/${selected}`} className={styles.modalDoneLink} onClick={onClose}>
                                Xem sổ tay &ldquo;{selectedNb.name}&rdquo;
                                <ExternalLink size={12} />
                            </Link>
                        )}
                        <button type="button" className={styles.btnSecondary} onClick={onClose}>Đóng</button>
                    </div>
                ) : (
                    <>
                        <p className={styles.modalDesc}>
                            Chọn sổ tay cá nhân để thêm {items.length} mục từ bộ sưu tập này.
                        </p>
                        {notebooks.length === 0 ? (
                            <div className={styles.modalEmpty}>
                                <AlertCircle size={18} />
                                <p>Bạn chưa có sổ tay nào. Hãy tạo sổ tay trước.</p>
                                <Link href="/study?tab=so-tay" className={styles.btnPrimary} onClick={onClose}>
                                    Tạo sổ tay
                                </Link>
                            </div>
                        ) : (
                            <div className={styles.nbList}>
                                {notebooks.map((nb) => (
                                    <button
                                        key={nb.id}
                                        type="button"
                                        className={styles.nbOption}
                                        data-selected={selected === nb.id || undefined}
                                        onClick={() => setSelected(nb.id)}
                                    >
                                        <BookOpen size={14} />
                                        <span className={styles.nbOptionName}>{nb.name}</span>
                                        <span className={styles.nbOptionCount}>{nb.item_count} mục</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.btnSecondary} onClick={onClose}>Hủy</button>
                            <button type="button" className={styles.btnPrimary} disabled={!selected || loading} onClick={handleAdd}>
                                {loading ? "Đang thêm…" : "Thêm vào sổ tay"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
