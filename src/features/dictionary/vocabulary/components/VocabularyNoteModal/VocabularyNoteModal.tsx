"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Alert, Button, Input, Modal, Skeleton, Space } from "antd"
import { DeleteOutlined } from "@ant-design/icons"

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
    const [noteLoaded, setNoteLoaded] = useState<NoteLoaded | null>(null)
    const [text, setText] = useState("")
    const [saving, setSaving] = useState(false)

    const loading = open && noteLoaded === null
    const saved = noteLoaded?.saved ?? ""
    const error = noteLoaded?.error ?? null
    const isDirty = text !== saved

    const onCloseRef = useRef(onClose)
    useLayoutEffect(() => { onCloseRef.current = onClose })

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
            const res = await fetch(`/api/vocabulary/${vocabularyId}/note`, { method: "DELETE" })
            if (!res.ok) {
                setNoteLoaded((prev) => prev ? { ...prev, error: "Có lỗi xảy ra, thử lại sau" } : prev)
                return
            }
            onCloseRef.current()
        } catch {
            setNoteLoaded((prev) => prev ? { ...prev, error: "Có lỗi xảy ra, thử lại sau" } : prev)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title="GHI CHÚ"
            footer={null}
            width={480}
            destroyOnHidden
        >
            {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
                <div>
                    {error && (
                        <Alert message={error} type="error" showIcon style={{ marginBottom: 12 }} />
                    )}

                    <Input.TextArea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Viết ghi chú cho từ này... (mẹo nhớ, cách dùng, ví dụ riêng...)"
                        maxLength={2000}
                        showCount
                        rows={6}
                        autoFocus
                        style={{ marginBottom: 16 }}
                    />

                    <Space style={{ justifyContent: "space-between", width: "100%" }}>
                        <div>
                            {saved && (
                                <Button
                                    danger
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    onClick={handleDelete}
                                    disabled={saving}
                                    size="small"
                                >
                                    Xóa ghi chú
                                </Button>
                            )}
                        </div>
                        <Space>
                            <Button onClick={onClose} disabled={saving}>Hủy</Button>
                            <Button
                                type="primary"
                                onClick={handleSave}
                                loading={saving}
                                disabled={!isDirty || !text.trim()}
                            >
                                Lưu
                            </Button>
                        </Space>
                    </Space>
                </div>
            )}
        </Modal>
    )
}
