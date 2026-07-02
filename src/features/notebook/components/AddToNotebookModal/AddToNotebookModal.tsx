"use client"

import {
    FormEvent,
    useEffect,
    useRef,
    useState,
} from "react"

import { Check, Plus, X } from "lucide-react"

import { useAuth } from "@/features/auth/hooks/useAuth"
import { useNotebookCheck } from "@/features/notebook/hooks/useNotebookCheck"
import { useNotebooks } from "@/features/notebook/hooks/useNotebooks"

import type { NotebookItemType } from "@/domain/notebook/notebook.type"

import styles from "./AddToNotebookModal.module.css"

type AddToNotebookModalProps = {
    open: boolean
    onClose: () => void
    itemType: NotebookItemType
    itemId: string
    onLoginRequired: () => void
}

export default function AddToNotebookModal({
    open,
    onClose,
    itemType,
    itemId,
    onLoginRequired,
}: AddToNotebookModalProps) {
    const { user, loading: authLoading } = useAuth()

    const isLoggedIn = !authLoading && Boolean(user)

    const { notebooks, loading: notebooksLoading, mutate: mutateNotebooks } =
        useNotebooks(isLoggedIn && open)

    const { notebookIds, mutate: mutateCheck } =
        useNotebookCheck(itemType, itemId, isLoggedIn && open)

    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
    const [creating, setCreating] = useState(false)
    const [newName, setNewName] = useState("")
    const [createLoading, setCreateLoading] = useState(false)
    const createInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (creating) createInputRef.current?.focus()
    }, [creating])

    useEffect(() => {
        if (!open) return
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") handleClose()
        }
        document.addEventListener("keydown", handleKey)
        return () => document.removeEventListener("keydown", handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    function handleClose() {
        setCreating(false)
        setNewName("")
        setCreateLoading(false)
        setPendingIds(new Set())
        onClose()
    }

    async function toggleNotebook(notebookId: string) {
        if (pendingIds.has(notebookId)) return

        const alreadyIn = notebookIds.includes(notebookId)
        const method = alreadyIn ? "DELETE" : "POST"

        // Optimistic update
        const nextIds = alreadyIn
            ? notebookIds.filter((id) => id !== notebookId)
            : [...notebookIds, notebookId]

        setPendingIds((prev) => new Set(prev).add(notebookId))
        await mutateCheck({ notebookIds: nextIds }, false)

        try {
            const res = await fetch(`/api/notebooks/${notebookId}/items`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_type: itemType, item_id: itemId }),
            })

            if (!res.ok && res.status !== 409) {
                // Revert on error
                await mutateCheck({ notebookIds }, false)
            }
        } catch {
            await mutateCheck({ notebookIds }, false)
        } finally {
            setPendingIds((prev) => {
                const next = new Set(prev)
                next.delete(notebookId)
                return next
            })
        }
    }

    async function handleCreate(e: FormEvent) {
        e.preventDefault()
        const name = newName.trim()
        if (!name || createLoading) return

        setCreateLoading(true)

        try {
            const res = await fetch("/api/notebooks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            })

            if (!res.ok) return

            const created = await res.json()

            // Add item to new notebook immediately
            await fetch(`/api/notebooks/${created.id}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_type: itemType, item_id: itemId }),
            })

            await Promise.all([
                mutateNotebooks(),
                mutateCheck(),
            ])

            setNewName("")
            setCreating(false)
        } finally {
            setCreateLoading(false)
        }
    }

    if (!open) return null

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Thêm vào sổ tay"
            >
                <div className={styles.header}>
                    <h2>Thêm vào sổ tay</h2>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={handleClose}
                        aria-label="Đóng"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className={styles.body}>
                    {authLoading ? (
                        <p className={styles.hint}>Đang tải...</p>
                    ) : !isLoggedIn ? (
                        <LoginPrompt onLogin={onLoginRequired} />
                    ) : notebooksLoading ? (
                        <p className={styles.hint}>Đang tải sổ tay...</p>
                    ) : notebooks.length === 0 && !creating ? (
                        <EmptyState onCreateClick={() => setCreating(true)} />
                    ) : (
                        <>
                            <ul className={styles.notebookList}>
                                {notebooks.map((nb) => {
                                    const checked = notebookIds.includes(nb.id)
                                    const pending = pendingIds.has(nb.id)
                                    return (
                                        <li key={nb.id}>
                                            <button
                                                type="button"
                                                className={`${styles.notebookRow} ${checked ? styles.checked : ""}`}
                                                onClick={() => toggleNotebook(nb.id)}
                                                disabled={pending}
                                            >
                                                <span className={styles.notebookName}>
                                                    {nb.name}
                                                </span>
                                                <span className={styles.checkIcon}>
                                                    {checked && <Check size={15} />}
                                                </span>
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>

                            <div className={styles.divider} />

                            {creating ? (
                                <form
                                    className={styles.createForm}
                                    onSubmit={handleCreate}
                                >
                                    <input
                                        ref={createInputRef}
                                        className={styles.createInput}
                                        type="text"
                                        placeholder="Tên sổ tay..."
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        maxLength={80}
                                        disabled={createLoading}
                                    />
                                    <button
                                        className={styles.createSubmit}
                                        type="submit"
                                        disabled={!newName.trim() || createLoading}
                                    >
                                        {createLoading ? "..." : "Tạo"}
                                    </button>
                                    <button
                                        className={styles.createCancel}
                                        type="button"
                                        onClick={() => {
                                            setCreating(false)
                                            setNewName("")
                                        }}
                                    >
                                        Hủy
                                    </button>
                                </form>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.addNotebookButton}
                                    onClick={() => setCreating(true)}
                                >
                                    <Plus size={15} />
                                    Tạo sổ tay mới
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

function LoginPrompt({ onLogin }: { onLogin: () => void }) {
    return (
        <div className={styles.loginPrompt}>
            <p>Đăng nhập để lưu từ vựng, hán tự và ngữ pháp vào sổ tay cá nhân.</p>
            <button type="button" className={styles.loginButton} onClick={onLogin}>
                Đăng nhập
            </button>
        </div>
    )
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
    return (
        <div className={styles.emptyState}>
            <p>Bạn chưa có sổ tay nào.</p>
            <button type="button" className={styles.loginButton} onClick={onCreateClick}>
                <Plus size={15} />
                Tạo sổ tay đầu tiên
            </button>
        </div>
    )
}
