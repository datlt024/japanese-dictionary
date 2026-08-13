"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { Trash2, X } from "lucide-react"

import styles from "./VocabularyNoteModal.module.css"

type Props = {
    open: boolean
    onClose: () => void
    vocabularyId: number
}

type NoteLoaded = {
    text: string
    saved: string
    error: string | null
}

export default function VocabularyNoteModal({ open, onClose, vocabularyId }: Props) {
    // null = not yet fetched (loading); populated = ready
    const [noteLoaded, setNoteLoaded] = useState<NoteLoaded | null>(null)
    const [text, setText] = useState("")
    const [saving, setSaving] = useState(false)

    const loading = open && noteLoaded === null
    const saved = noteLoaded?.saved ?? ""
    const error = noteLoaded?.error ?? null
    const isDirty = text !== saved

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const onCloseRef = useRef(onClose)
    useLayoutEffect(() => { onCloseRef.current = onClose })

    // Fetch note when modal opens; cleanup resets to loading state for next open
    useEffect(() => {
        if (!open) return

        let cancelled = false

        fetch(`/api/vocabulary/${vocabularyId}/note`)
            .then((r) => r.json())
            .then((data) => {
                if (cancelled) return
                const noteText: string = data.note?.note_text ?? ""
                setText(noteText)
                setNoteLoaded({ text: noteText, saved: noteText, error: null })
            })
            .catch(() => {
                if (cancelled) return
                setNoteLoaded({ text: "", saved: "", error: "Không thể tải ghi chú" })
            })

        return () => {
            cancelled = true
            setNoteLoaded(null)
        }
    }, [open, vocabularyId])

    // Auto-focus textarea once loaded
    useEffect(() => {
        if (!loading && open) {
            setTimeout(() => textareaRef.current?.focus(), 60)
        }
    }, [loading, open])

    useEffect(() => {
        if (!open) return
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onCloseRef.current()
        }
        document.addEventListener("keydown", handleKey)
        return () => document.removeEventListener("keydown", handleKey)
    }, [open])

    async function handleSave() {
        if (saving) return
        setSaving(true)

        try {
            const res = await fetch(`/api/vocabulary/${vocabularyId}/note`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note_text: text }),
            })

            const json = await res.json()

            if (!res.ok) {
                setNoteLoaded((prev) => prev ? { ...prev, error: json.error ?? "Có lỗi xảy ra" } : prev)
                return
            }

            onCloseRef.current()
        } catch {
            setNoteLoaded((prev) => prev ? { ...prev, error: "Có lỗi xảy ra, thử lại sau" } : prev)
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete() {
        if (!confirm("Xóa ghi chú này?")) return
        setSaving(true)

        try {
            await fetch(`/api/vocabulary/${vocabularyId}/note`, { method: "DELETE" })
            onCloseRef.current()
        } catch {
            setNoteLoaded((prev) => prev ? { ...prev, error: "Có lỗi xảy ra, thử lại sau" } : prev)
        } finally {
            setSaving(false)
        }
    }

    if (!open) return null

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Ghi chú cá nhân"
            >
                <div className={styles.header}>
                    <h2>GHI CHÚ</h2>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Đóng"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className={styles.body}>
                    {loading ? (
                        <p className={styles.hint}>Đang tải...</p>
                    ) : (
                        <>
                            <textarea
                                ref={textareaRef}
                                className={styles.textarea}
                                placeholder="Viết ghi chú cho từ này... (mẹo nhớ, cách dùng, ví dụ riêng...)"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                maxLength={2000}
                                rows={6}
                            />

                            <div className={styles.footer}>
                                <span className={styles.charCount}>{text.length}/2000</span>

                                <div className={styles.actions}>
                                    {saved && (
                                        <button
                                            type="button"
                                            className={styles.deleteButton}
                                            onClick={handleDelete}
                                            disabled={saving}
                                            title="Xóa ghi chú"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className={styles.cancelButton}
                                        onClick={onClose}
                                        disabled={saving}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.saveButton}
                                        onClick={handleSave}
                                        disabled={saving || !isDirty || !text.trim()}
                                    >
                                        {saving ? "Đang lưu..." : "Lưu"}
                                    </button>
                                </div>
                            </div>

                            {error && <p className={styles.errorText}>{error}</p>}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
