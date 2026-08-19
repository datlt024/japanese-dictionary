import { FormEvent, useEffect, useRef, useState } from "react"
import { Pencil } from "lucide-react"
import styles from "./StudyNotebooksTab.module.css"

import { useFocusTrap } from "@/shared/hooks/useFocusTrap"

interface Props {
    currentName: string
    onClose: () => void
    onSave: (name: string) => Promise<string | null>
}

export default function RenameModal({ currentName, onClose, onSave }: Props) {
    const [name, setName] = useState(currentName)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)

    useFocusTrap(modalRef, true, onClose)

    useEffect(() => { inputRef.current?.focus(); inputRef.current?.select() }, [])
    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onClose])

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        const trimmed = name.trim()
        if (!trimmed || trimmed === currentName) { onClose(); return }
        setSaving(true)
        setError(null)
        const err = await onSave(trimmed)
        setSaving(false)
        if (err) { setError(err) } else { onClose() }
    }

    return (
        <div className={styles.confirmOverlay} onClick={onClose} role="presentation">
            <div className={styles.confirmBox} ref={modalRef} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Đổi tên sổ tay">
                <div className={styles.confirmIcon} style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}>
                    <Pencil size={20} />
                </div>
                <h3 className={styles.confirmTitle}>Đổi tên sổ tay</h3>
                <form style={{ width: "100%" }} onSubmit={handleSubmit}>
                    <label htmlFor="rename-notebook-input" className="sr-only">Tên sổ tay</label>
                    <input
                        id="rename-notebook-input"
                        ref={inputRef}
                        className={`${styles.renameModalInput} ${error ? styles.renameModalInputError : ""}`}
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(null) }}
                        maxLength={80}
                        placeholder="Tên sổ tay..."
                        disabled={saving}
                    />
                    {error && <p className={styles.formError}>{error}</p>}
                    <div className={styles.confirmActions}>
                        <button type="button" className={styles.confirmCancel} onClick={onClose}>Hủy</button>
                        <button type="submit" className={styles.confirmOk} disabled={!name.trim() || saving}>
                            {saving ? "..." : "Lưu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
