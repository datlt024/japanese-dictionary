"use client"

import { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import {
    BookOpen,
    ChevronRight,
    Folder,
    FolderOpen,
    Save,
} from "lucide-react"
import {
    Alert,
    Button,
    Card,
    Form,
    Input,
    InputNumber,
    Modal,
    Skeleton,
    Space,
    Tag,
    Tooltip,
    Typography,
    message,
} from "antd"
import { PlusOutlined, EyeOutlined, EyeInvisibleOutlined, EditOutlined, RightOutlined } from "@ant-design/icons"

const { Title, Text } = Typography

interface AdminGroup {
    id: string
    name: string
    description: string | null
    is_public: boolean
    public_description: string | null
    display_order: number
    notebook_count: number
}

interface AdminNotebook {
    id: string
    name: string
    description: string | null
    is_public: boolean
    public_category: string | null
    public_description: string | null
    display_order: number
    item_count: number
    group_id: string | null
}

async function fetchGroups(): Promise<AdminGroup[]> {
    const res = await fetch("/api/admin/groups")
    if (!res.ok) throw new Error("fetch failed")
    return res.json()
}

async function fetchNotebooks(): Promise<AdminNotebook[]> {
    const res = await fetch("/api/admin/notebooks")
    if (!res.ok) throw new Error("fetch failed")
    return res.json()
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [form] = Form.useForm()

    async function handleCreate(values: { name: string }) {
        const trimmed = values.name.trim()
        if (!trimmed) { setError("Tên không được để trống"); return }
        setLoading(true)
        setError(null)
        const res = await fetch("/api/admin/notebooks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: trimmed }),
        })
        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            setError(data.error ?? "Lỗi khi tạo sổ tay")
            setLoading(false)
            return
        }
        setLoading(false)
        onCreated()
        onClose()
    }

    return (
        <Modal
            open
            title="Tạo sổ tay mới"
            onCancel={onClose}
            footer={null}
            width={400}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" onFinish={handleCreate} requiredMark={false} style={{ marginTop: 8 }}>
                <Form.Item
                    label="Tên sổ tay"
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập tên sổ tay" }]}
                >
                    <Input placeholder="Ví dụ: Bài 1–10" autoFocus disabled={loading} />
                </Form.Item>
                {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 12 }} />}
                <Space style={{ justifyContent: "flex-end", width: "100%" }}>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>Tạo sổ tay</Button>
                </Space>
            </Form>
        </Modal>
    )
}

interface GroupRowProps {
    group: AdminGroup
    notebooks: AdminNotebook[]
    onTogglePublic: (id: string, value: boolean) => Promise<void>
    onSaveGroup: (id: string, updates: Partial<AdminGroup>) => Promise<void>
    onCreateNotebook: () => void
}

function GroupRow({ group, notebooks, onTogglePublic, onSaveGroup, onCreateNotebook }: GroupRowProps) {
    const [expanded, setExpanded] = useState(false)
    const [editing, setEditing] = useState(false)
    const [toggling, setToggling] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form] = Form.useForm()

    const groupNotebooks = notebooks.filter((nb) => nb.group_id === group.id)

    async function handleToggle() {
        setToggling(true)
        await onTogglePublic(group.id, !group.is_public)
        setToggling(false)
    }

    async function handleSave(values: { public_description?: string; display_order?: number }) {
        setSaving(true)
        await onSaveGroup(group.id, {
            public_description: values.public_description?.trim() || null,
            display_order: values.display_order ?? 0,
        })
        setSaving(false)
        setEditing(false)
    }

    return (
        <Card
            size="small"
            style={{ marginBottom: 8, borderColor: group.is_public ? "#BFDBFE" : "#E5EAF2" }}
            styles={{ body: { padding: 0 } }}
        >
            <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 8 }}>
                <Button
                    type="text"
                    size="small"
                    icon={expanded ? <FolderOpen size={14} /> : <Folder size={14} />}
                    onClick={() => setExpanded(!expanded)}
                    style={{ flex: 1, justifyContent: "flex-start", height: "auto", padding: "2px 4px" }}
                >
                    <Text strong style={{ fontSize: 13 }}>{group.name}</Text>
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                        {groupNotebooks.length} sổ tay
                    </Text>
                    <ChevronRight size={12} style={{ marginLeft: 4, transform: expanded ? "rotate(90deg)" : undefined, transition: "transform 0.2s" }} />
                </Button>
                <Space size={4}>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => setEditing(!editing)}
                        />
                    </Tooltip>
                    <Button
                        size="small"
                        type={group.is_public ? "primary" : "default"}
                        icon={group.is_public ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        onClick={handleToggle}
                        loading={toggling}
                    >
                        {group.is_public ? "Công khai" : "Riêng tư"}
                    </Button>
                </Space>
            </div>

            {editing && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid #F3F4F6" }}>
                    <Form
                        form={form}
                        layout="inline"
                        onFinish={handleSave}
                        initialValues={{ public_description: group.public_description ?? "", display_order: group.display_order }}
                        style={{ marginTop: 12, gap: 8, flexWrap: "wrap" }}
                    >
                        <Form.Item name="public_description" style={{ flex: 1, minWidth: 200 }}>
                            <Input placeholder="Mô tả công khai..." size="small" />
                        </Form.Item>
                        <Form.Item name="display_order" label="Thứ tự">
                            <InputNumber size="small" min={0} style={{ width: 70 }} />
                        </Form.Item>
                        <Form.Item>
                            <Space size={4}>
                                <Button size="small" onClick={() => setEditing(false)}>Hủy</Button>
                                <Button size="small" type="primary" htmlType="submit" loading={saving} icon={<Save size={12} />}>Lưu</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </div>
            )}

            {expanded && (
                <div style={{ padding: "0 16px 12px", borderTop: "1px solid #F3F4F6" }}>
                    {groupNotebooks.length === 0 ? (
                        <Text type="secondary" style={{ fontSize: 12, display: "block", padding: "8px 0" }}>
                            Nhóm này chưa có sổ tay nào.
                        </Text>
                    ) : (
                        <div style={{ marginTop: 8 }}>
                            {groupNotebooks.map((nb) => (
                                <div key={nb.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                                    <BookOpen size={12} style={{ color: "#9CA3AF", flexShrink: 0 }} />
                                    <Text style={{ fontSize: 12, flex: 1 }}>{nb.name}</Text>
                                    <Text type="secondary" style={{ fontSize: 11 }}>{nb.item_count} mục</Text>
                                    <Link href={`/notebooks/${nb.id}`} target="_blank">
                                        <Button type="text" size="small" icon={<RightOutlined />} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                    <Button
                        type="dashed"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={onCreateNotebook}
                        style={{ marginTop: 8 }}
                    >
                        Thêm sổ tay vào nhóm
                    </Button>
                </div>
            )}
        </Card>
    )
}

function NotebookRow({ nb, onTogglePublic }: { nb: AdminNotebook; onTogglePublic: (id: string, value: boolean) => Promise<void> }) {
    const [toggling, setToggling] = useState(false)

    async function handleToggle() {
        setToggling(true)
        await onTogglePublic(nb.id, !nb.is_public)
        setToggling(false)
    }

    return (
        <Card
            size="small"
            style={{ marginBottom: 8, borderColor: nb.is_public ? "#BFDBFE" : "#E5EAF2" }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BookOpen size={13} style={{ color: "#9CA3AF", flexShrink: 0 }} />
                <Text style={{ flex: 1, fontSize: 13 }}>{nb.name}</Text>
                <Space size={8} align="center">
                    {nb.public_category && <Tag style={{ margin: 0 }}>{nb.public_category}</Tag>}
                    <Text type="secondary" style={{ fontSize: 12 }}>{nb.item_count} mục</Text>
                    <Link href={`/notebooks/${nb.id}`} target="_blank">
                        <Button type="text" size="small" icon={<RightOutlined />} />
                    </Link>
                    <Button
                        size="small"
                        type={nb.is_public ? "primary" : "default"}
                        icon={nb.is_public ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        onClick={handleToggle}
                        loading={toggling}
                    >
                        {nb.is_public ? "Công khai" : "Riêng tư"}
                    </Button>
                </Space>
            </div>
        </Card>
    )
}

export default function AdminClient() {
    const { data: groups, isLoading: groupsLoading, mutate: mutateGroups } = useSWR<AdminGroup[]>(
        "/api/admin/groups", fetchGroups, { revalidateOnFocus: false }
    )
    const { data: notebooks, isLoading: nbsLoading, mutate: mutateNbs } = useSWR<AdminNotebook[]>(
        "/api/admin/notebooks", fetchNotebooks, { revalidateOnFocus: false }
    )

    const [showCreate, setShowCreate] = useState(false)
    const [messageApi, contextHolder] = message.useMessage()
    const savedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    useEffect(() => () => clearTimeout(savedTimerRef.current), [])

    const allGroups = groups ?? []
    const allNbs = notebooks ?? []
    const standaloneNbs = allNbs.filter((nb) => !nb.group_id)
    const isLoading = groupsLoading || nbsLoading

    async function toggleGroupPublic(id: string, value: boolean) {
        const res = await fetch(`/api/admin/groups/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_public: value }),
        })
        if (!res.ok) return
        mutateGroups()
    }

    async function saveGroup(id: string, updates: Partial<AdminGroup>) {
        const res = await fetch(`/api/admin/groups/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        })
        if (!res.ok) return
        messageApi.success("Đã lưu thay đổi")
        mutateGroups()
    }

    async function toggleNbPublic(id: string, value: boolean) {
        const res = await fetch(`/api/admin/notebooks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_public: value }),
        })
        if (!res.ok) return
        mutateNbs()
    }

    const publicGroupCount = allGroups.filter((g) => g.is_public).length
    const publicNbCount = allNbs.filter((nb) => nb.is_public).length

    return (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 64px" }}>
            {contextHolder}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
                <div>
                    <Title level={3} style={{ margin: "0 0 4px" }}>Quản lý nội dung Khám phá</Title>
                    <Text type="secondary">
                        {allGroups.length} nhóm ({publicGroupCount} công khai) ·{" "}
                        {allNbs.length} sổ tay ({publicNbCount} công khai)
                    </Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreate(true)}>
                    Tạo sổ tay
                </Button>
            </div>

            {isLoading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[1, 2, 3].map((i) => <Skeleton key={i} active paragraph={{ rows: 1 }} />)}
                </div>
            )}

            {!isLoading && allGroups.length > 0 && (
                <section style={{ marginBottom: 32 }}>
                    <div style={{ marginBottom: 12 }}>
                        <Text strong style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Folder size={14} /> Nhóm sổ tay
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Bật &ldquo;Công khai&rdquo; cho một nhóm để toàn bộ sổ tay trong nhóm đó hiện trong tab Khám phá.
                        </Text>
                    </div>
                    {allGroups.map((g) => (
                        <GroupRow
                            key={g.id}
                            group={g}
                            notebooks={allNbs}
                            onTogglePublic={toggleGroupPublic}
                            onSaveGroup={saveGroup}
                            onCreateNotebook={() => setShowCreate(true)}
                        />
                    ))}
                </section>
            )}

            {!isLoading && standaloneNbs.length > 0 && (
                <section>
                    <div style={{ marginBottom: 12 }}>
                        <Text strong style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <BookOpen size={14} /> Sổ tay riêng lẻ
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Bật &ldquo;Công khai&rdquo; để hiện từng sổ tay riêng lẻ trong tab Khám phá.
                        </Text>
                    </div>
                    {standaloneNbs.map((nb) => (
                        <NotebookRow key={nb.id} nb={nb} onTogglePublic={toggleNbPublic} />
                    ))}
                </section>
            )}

            {!isLoading && allGroups.length === 0 && standaloneNbs.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                    <Text type="secondary">Chưa có nhóm hay sổ tay nào. Hãy tạo sổ tay đầu tiên.</Text>
                </div>
            )}

            {showCreate && (
                <CreateModal
                    onClose={() => setShowCreate(false)}
                    onCreated={() => mutateNbs()}
                />
            )}
        </div>
    )
}
