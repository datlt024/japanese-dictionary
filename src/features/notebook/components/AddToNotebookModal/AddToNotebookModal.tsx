"use client"

import { useEffect, useRef, useState } from "react"
import { Button, Input, Modal, Skeleton, Space, Typography } from "antd"
import type { InputRef } from "antd"
import { CheckOutlined, PlusOutlined } from "@ant-design/icons"

import { useAuth } from "@/features/auth/hooks/useAuth"
import { useNotebookCheck } from "@/features/notebook/hooks/useNotebookCheck"
import { useNotebooks } from "@/features/notebook/hooks/useNotebooks"

import type { NotebookItemType } from "@/domain/notebook/notebook.type"

const { Text } = Typography

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
    const createInputRef = useRef<InputRef | null>(null)

    useEffect(() => {
        if (creating) createInputRef.current?.focus()
    }, [creating])

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

    async function handleCreate() {
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
            const addRes = await fetch(`/api/notebooks/${created.id}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_type: itemType, item_id: itemId }),
            })

            if (!addRes.ok && addRes.status !== 409) {
                await mutateNotebooks()
                return
            }

            await Promise.all([mutateNotebooks(), mutateCheck()])
            setNewName("")
            setCreating(false)
        } finally {
            setCreateLoading(false)
        }
    }

    const renderBody = () => {
        if (authLoading) return <Skeleton active paragraph={{ rows: 3 }} />

        if (!isLoggedIn) {
            return (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                        Đăng nhập để lưu từ vựng, hán tự và ngữ pháp vào sổ tay cá nhân.
                    </Text>
                    <Button type="primary" onClick={onLoginRequired}>Đăng nhập</Button>
                </div>
            )
        }

        if (notebooksLoading) return <Skeleton active paragraph={{ rows: 3 }} />

        if (notebooks.length === 0 && !creating) {
            return (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>Bạn chưa có sổ tay nào.</Text>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>
                        Tạo sổ tay đầu tiên
                    </Button>
                </div>
            )
        }

        return (
            <div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 12 }}>
                    {notebooks.map((nb) => {
                        const checked = notebookIds.includes(nb.id)
                        const pending = pendingIds.has(nb.id)
                        return (
                            <Button
                                key={nb.id}
                                type="text"
                                onClick={() => toggleNotebook(nb.id)}
                                disabled={pending}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "9px 12px", borderRadius: 8,
                                    border: checked ? "1px solid #BFDBFE" : "1px solid transparent",
                                    background: checked ? "#EFF6FF" : "transparent",
                                    color: checked ? "#1D4ED8" : "#374151",
                                    fontWeight: checked ? 600 : 400, fontSize: 13,
                                    width: "100%", height: "auto",
                                    transition: "all 0.1s",
                                }}
                            >
                                <span>{nb.name}</span>
                                {checked && <CheckOutlined style={{ fontSize: 12, color: "#2563EB" }} />}
                            </Button>
                        )
                    })}
                </div>

                <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 12 }}>
                    {creating ? (
                        <Space.Compact style={{ width: "100%" }}>
                            <Input
                                ref={createInputRef}
                                placeholder="Tên sổ tay..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                maxLength={80}
                                disabled={createLoading}
                                onPressEnter={handleCreate}
                                autoFocus
                            />
                            <Button
                                type="primary"
                                loading={createLoading}
                                disabled={!newName.trim()}
                                onClick={handleCreate}
                            >
                                Tạo
                            </Button>
                            <Button onClick={() => { setCreating(false); setNewName("") }}>Hủy</Button>
                        </Space.Compact>
                    ) : (
                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            block
                            onClick={() => setCreating(true)}
                        >
                            Tạo sổ tay mới
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <Modal
            open={open}
            onCancel={handleClose}
            title="Thêm vào sổ tay"
            footer={null}
            width={360}
            destroyOnHidden
        >
            {renderBody()}
        </Modal>
    )
}
