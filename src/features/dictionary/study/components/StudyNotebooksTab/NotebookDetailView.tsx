"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { BookOpen, ChevronLeft, Pencil, Trash2, X, Zap } from "lucide-react"
import { NOTEBOOK_ITEM_TYPE_LABELS } from "@/shared/constants/search-tabs"
import type { EnrichedNotebookItem, NotebookWithCount } from "@/domain/notebook/notebook.type"
import { useNotebookItems } from "@/features/notebook/hooks/useNotebookItems"
import QuickLookupModal from "@/features/dictionary/quick-lookup/components/QuickLookupModal"
import { getQuickLookupTarget, type QuickLookupTarget } from "@/features/dictionary/quick-lookup/services/quick-lookup.service"
import styles from "./StudyNotebooksTab.module.css"

interface Props {
    notebook: NotebookWithCount
    onBack: () => void
    onDelete: () => void
    onPractice: () => void
    onRename: (newName: string) => Promise<string | null>
}

export default function NotebookDetailView({ notebook, onBack, onDelete, onPractice, onRename }: Props) {
    const { items, loading, mutate } = useNotebookItems(notebook.id)
    const [removingId, setRemovingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState(false)
    const [editName, setEditName] = useState(notebook.name)
    const [saveLoading, setSaveLoading] = useState(false)
    const [renameError, setRenameError] = useState<string | null>(null)
    const editInputRef = useRef<HTMLInputElement>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [modalTarget, setModalTarget] = useState<QuickLookupTarget | null>(null)
    const [modalLoadingWord, setModalLoadingWord] = useState<string | null>(null)

    useEffect(() => {
        if (editingName) editInputRef.current?.focus()
    }, [editingName])

    async function handleSaveName(e: FormEvent) {
        e.preventDefault()
        const name = editName.trim()
        if (!name || name === notebook.name) { setEditingName(false); return }
        setSaveLoading(true)
        setRenameError(null)
        try {
            const err = await onRename(name)
            if (err) { setRenameError(err); return }
            setEditingName(false)
        } finally {
            setSaveLoading(false)
        }
    }

    async function handleRemoveItem(item: EnrichedNotebookItem) {
        if (removingId) return
        setRemovingId(item.id)
        try {
            await fetch(`/api/notebooks/${notebook.id}/items`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_type: item.item_type, item_id: item.item_id }),
            })
            await mutate()
        } finally {
            setRemovingId(null)
        }
    }

    async function handleOpenItem(item: EnrichedNotebookItem) {
        setModalTarget(null)
        setModalLoadingWord(item.display.title)
        setModalOpen(true)
        const vocabularyId = item.item_type === "vocabulary" ? parseInt(item.item_id, 10) : undefined
        const result = await getQuickLookupTarget(item.display.title, "vi", vocabularyId)
        setModalTarget(result)
        setModalLoadingWord(null)
    }

    function handleCloseModal() {
        setModalOpen(false)
        setModalTarget(null)
        setModalLoadingWord(null)
    }

    return (
        <div className={styles.detailWrap}>
            <button type="button" className={styles.backBtn} onClick={onBack}>
                <ChevronLeft size={15} />
                Tất cả sổ tay
            </button>

            <div className={styles.detailHeader}>
                <div className={styles.detailLeft}>
                    {editingName ? (
                        <form className={styles.renameTitleForm} onSubmit={handleSaveName}>
                            <input
                                ref={editInputRef}
                                className={`${styles.renameTitleInput} ${renameError ? styles.renameTitleInputError : ""}`}
                                value={editName}
                                onChange={(e) => { setEditName(e.target.value); setRenameError(null) }}
                                maxLength={80}
                                disabled={saveLoading}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") { setEditingName(false); setEditName(notebook.name); setRenameError(null) }
                                }}
                            />
                            {renameError && <span className={styles.renameTitleError}>{renameError}</span>}
                            <button type="submit" className={styles.renameTitleSave} disabled={!editName.trim() || saveLoading}>
                                {saveLoading ? "..." : "Lưu"}
                            </button>
                            <button type="button" className={styles.renameTitleCancel} onClick={() => { setEditingName(false); setEditName(notebook.name); setRenameError(null) }}>
                                Hủy
                            </button>
                        </form>
                    ) : (
                        <div className={styles.detailTitleRow}>
                            <h2 className={styles.detailTitle}>{notebook.name}</h2>
                            <button
                                type="button"
                                className={styles.detailEditBtn}
                                onClick={() => { setEditName(notebook.name); setEditingName(true) }}
                                title="Đổi tên"
                            >
                                <Pencil size={13} />
                            </button>
                        </div>
                    )}
                    {!loading && items.length > 0 && (
                        <span className={styles.countBadge}>{items.length} mục</span>
                    )}
                </div>

                <div className={styles.detailRight}>
                    <button
                        type="button"
                        className={styles.practiceBtn}
                        onClick={onPractice}
                        disabled={items.length === 0}
                    >
                        <Zap size={14} />
                        Luyện tập
                    </button>
                    <button type="button" className={styles.deleteNbBtn} onClick={onDelete}>
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className={styles.skeletonWrap}>
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className={styles.skeleton} />)}
                </div>
            ) : items.length === 0 ? (
                <div className={styles.emptyItems}>
                    <BookOpen size={28} className={styles.emptyItemsIcon} />
                    <p>Sổ tay này chưa có mục nào.</p>
                    <p className={styles.emptyItemsHint}>
                        Bấm <strong>★</strong> trên trang từ vựng, hán tự hoặc ngữ pháp để thêm vào đây.
                    </p>
                </div>
            ) : (
                <>
                    <ul className={styles.itemGrid}>
                        {items.map((item) => (
                            <li key={item.id} className={styles.itemCard}>
                                {item.item_type === "vocabulary" ? (
                                    <button
                                        type="button"
                                        className={styles.itemLink}
                                        onClick={() => handleOpenItem(item)}
                                    >
                                        <span className={`${styles.typeBadge} ${styles[item.item_type]}`}>
                                            {NOTEBOOK_ITEM_TYPE_LABELS[item.item_type]}
                                        </span>
                                        <span className={styles.itemTitle}>{item.display.title}</span>
                                        {item.display.subtitle && (
                                            <span className={styles.itemSubtitle}>{item.display.subtitle}</span>
                                        )}
                                        {item.display.meaning && (
                                            <span className={styles.itemMeaning}>{item.display.meaning}</span>
                                        )}
                                    </button>
                                ) : (
                                    <Link href={item.display.href} className={styles.itemLink}>
                                        <span className={`${styles.typeBadge} ${styles[item.item_type]}`}>
                                            {NOTEBOOK_ITEM_TYPE_LABELS[item.item_type]}
                                        </span>
                                        <span className={styles.itemTitle}>{item.display.title}</span>
                                        {item.display.subtitle && (
                                            <span className={styles.itemSubtitle}>{item.display.subtitle}</span>
                                        )}
                                        {item.display.meaning && (
                                            <span className={styles.itemMeaning}>{item.display.meaning}</span>
                                        )}
                                    </Link>
                                )}
                                <button
                                    type="button"
                                    className={styles.removeItemBtn}
                                    onClick={() => handleRemoveItem(item)}
                                    disabled={removingId === item.id}
                                    title="Xóa khỏi sổ tay"
                                >
                                    <X size={12} />
                                </button>
                            </li>
                        ))}
                    </ul>

                    <QuickLookupModal
                        open={modalOpen}
                        target={modalTarget}
                        loadingTitle={modalLoadingWord ?? undefined}
                        onClose={handleCloseModal}
                    />
                </>
            )}
        </div>
    )
}
