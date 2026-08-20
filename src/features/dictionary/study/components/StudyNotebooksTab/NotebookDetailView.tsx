"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { BookOpen, Zap, X } from "lucide-react"
import { Button, Input, Skeleton, Space, Tag, Typography } from "antd"
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons"
import type { InputRef } from "antd"
import { NOTEBOOK_ITEM_TYPE_LABELS } from "@/shared/constants/search-tabs"
import type { EnrichedNotebookItem, NotebookWithCount } from "@/domain/notebook/notebook.type"
import { useNotebookItems } from "@/shared/hooks/useNotebookItems"
import QuickLookupModal from "@/features/dictionary/quick-lookup/components/QuickLookupModal"
import { getQuickLookupTarget, type QuickLookupTarget } from "@/features/dictionary/quick-lookup/services/quick-lookup.service"
import styles from "./StudyNotebooksTab.module.css"

const { Text } = Typography

const TYPE_COLORS: Record<string, string> = { vocabulary: "blue", kanji: "purple", grammar: "green" }

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
    const editInputRef = useRef<InputRef | null>(null)
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
            const res = await fetch(`/api/notebooks/${notebook.id}/items`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_type: item.item_type, item_id: item.item_id }),
            })
            if (!res.ok) return
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
            <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                style={{ color: "#6B7280", fontSize: 13, marginBottom: 16, padding: "4px 8px" }}
            >
                Tất cả sổ tay
            </Button>

            <div className={styles.detailHeader}>
                <div className={styles.detailLeft}>
                    {editingName ? (
                        <form onSubmit={handleSaveName} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <Input
                                ref={editInputRef}
                                value={editName}
                                onChange={(e) => { setEditName(e.target.value); setRenameError(null) }}
                                maxLength={80}
                                disabled={saveLoading}
                                status={renameError ? "error" : undefined}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") { setEditingName(false); setEditName(notebook.name); setRenameError(null) }
                                }}
                                style={{ width: 240 }}
                            />
                            {renameError && <Text type="danger" style={{ fontSize: 12, width: "100%" }}>{renameError}</Text>}
                            <Space>
                                <Button type="primary" htmlType="submit" size="small" loading={saveLoading} disabled={!editName.trim()}>
                                    Lưu
                                </Button>
                                <Button size="small" onClick={() => { setEditingName(false); setEditName(notebook.name); setRenameError(null) }}>
                                    Hủy
                                </Button>
                            </Space>
                        </form>
                    ) : (
                        <div className={styles.detailTitleRow}>
                            <h2 className={styles.detailTitle}>{notebook.name}</h2>
                            <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => { setEditName(notebook.name); setEditingName(true) }}
                                title="Đổi tên"
                                style={{ color: "#9CA3AF" }}
                            />
                        </div>
                    )}
                    {!loading && items.length > 0 && (
                        <Tag style={{ marginTop: 4 }}>{items.length} mục</Tag>
                    )}
                </div>

                <div className={styles.detailRight}>
                    <Button
                        type="primary"
                        icon={<Zap size={14} />}
                        onClick={onPractice}
                        disabled={items.length === 0}
                    >
                        Luyện tập
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={onDelete}
                        title="Xóa sổ tay"
                    />
                </div>
            </div>

            {loading ? (
                <div className={styles.skeletonWrap}>
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} active paragraph={{ rows: 1 }} />)}
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
                                    <Button
                                        type="text"
                                        className={styles.itemLink}
                                        onClick={() => handleOpenItem(item)}
                                        style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", height: "auto", flex: 1, gap: 6, padding: 0, textAlign: "left", font: "inherit" }}
                                    >
                                        <Tag color={TYPE_COLORS[item.item_type] ?? "default"} style={{ margin: 0 }}>
                                            {NOTEBOOK_ITEM_TYPE_LABELS[item.item_type]}
                                        </Tag>
                                        <span className={styles.itemTitle}>{item.display.title}</span>
                                        {item.display.subtitle && (
                                            <span className={styles.itemSubtitle}>{item.display.subtitle}</span>
                                        )}
                                        {item.display.meaning && (
                                            <span className={styles.itemMeaning}>{item.display.meaning}</span>
                                        )}
                                    </Button>
                                ) : (
                                    <Link href={item.display.href} className={styles.itemLink}>
                                        <Tag color={TYPE_COLORS[item.item_type] ?? "default"} style={{ margin: 0 }}>
                                            {NOTEBOOK_ITEM_TYPE_LABELS[item.item_type]}
                                        </Tag>
                                        <span className={styles.itemTitle}>{item.display.title}</span>
                                        {item.display.subtitle && (
                                            <span className={styles.itemSubtitle}>{item.display.subtitle}</span>
                                        )}
                                        {item.display.meaning && (
                                            <span className={styles.itemMeaning}>{item.display.meaning}</span>
                                        )}
                                    </Link>
                                )}
                                <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<X size={12} />}
                                    onClick={() => handleRemoveItem(item)}
                                    loading={removingId === item.id}
                                    title="Xóa khỏi sổ tay"
                                    className={styles.removeItemBtn}
                                />
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
