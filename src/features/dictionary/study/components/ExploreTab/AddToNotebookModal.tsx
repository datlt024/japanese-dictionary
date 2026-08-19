"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOutlined, CheckCircleFilled, ExportOutlined } from "@ant-design/icons"
import { Alert, Button, Modal, Radio, Space, Typography } from "antd"
import type { EnrichedNotebookItem, NotebookWithCount } from "@/domain/notebook/notebook.type"

const { Text } = Typography

interface Props {
    items: EnrichedNotebookItem[]
    notebooks: NotebookWithCount[]
    onClose: () => void
}

export default function AddToNotebookModal({ items, notebooks, onClose }: Props) {
    const [selected, setSelected] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [addedCount, setAddedCount] = useState(0)

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
        <Modal
            open
            onCancel={onClose}
            title="Thêm vào sổ tay"
            footer={null}
            width={400}
            destroyOnHidden
        >
            {done ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <CheckCircleFilled style={{ fontSize: 36, color: "#16A34A", marginBottom: 12, display: "block" }} />
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                        Đã thêm {addedCount}/{items.length} mục
                    </Text>
                    {selectedNb && (
                        <Link href={`/notebooks/${selected}`} onClick={onClose} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, marginBottom: 16 }}>
                            Xem sổ tay &ldquo;{selectedNb.name}&rdquo;
                            <ExportOutlined style={{ fontSize: 11 }} />
                        </Link>
                    )}
                    <br />
                    <Button onClick={onClose}>Đóng</Button>
                </div>
            ) : (
                <>
                    <Text type="secondary" style={{ display: "block", marginBottom: 16, fontSize: 13 }}>
                        Chọn sổ tay cá nhân để thêm {items.length} mục từ bộ sưu tập này.
                    </Text>

                    {notebooks.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "16px 0" }}>
                            <Alert
                                type="info"
                                message="Bạn chưa có sổ tay nào. Hãy tạo sổ tay trước."
                                style={{ marginBottom: 12 }}
                            />
                            <Link href="/study?tab=so-tay" onClick={onClose}>
                                <Button type="primary">Tạo sổ tay</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Radio.Group
                                value={selected}
                                onChange={(e) => setSelected(e.target.value)}
                                style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}
                            >
                                {notebooks.map((nb) => (
                                    <Radio
                                        key={nb.id}
                                        value={nb.id}
                                        style={{
                                            border: `1px solid ${selected === nb.id ? "#BFDBFE" : "#E5EAF2"}`,
                                            borderRadius: 8,
                                            padding: "8px 12px",
                                            background: selected === nb.id ? "#EFF6FF" : "#fff",
                                            transition: "all 0.1s",
                                            margin: 0,
                                            width: "100%",
                                        }}
                                    >
                                        <Space>
                                            <BookOutlined style={{ color: "#9CA3AF" }} />
                                            <Text style={{ fontSize: 13 }}>{nb.name}</Text>
                                            <Text type="secondary" style={{ fontSize: 12 }}>{nb.item_count} mục</Text>
                                        </Space>
                                    </Radio>
                                ))}
                            </Radio.Group>
                            <Space style={{ justifyContent: "flex-end", width: "100%" }}>
                                <Button onClick={onClose}>Hủy</Button>
                                <Button type="primary" disabled={!selected} loading={loading} onClick={handleAdd}>
                                    Thêm vào sổ tay
                                </Button>
                            </Space>
                        </>
                    )}
                </>
            )}
        </Modal>
    )
}
