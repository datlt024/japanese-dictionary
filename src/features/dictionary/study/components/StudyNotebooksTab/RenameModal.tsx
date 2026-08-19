import { useState } from "react"
import { Alert, Button, Form, Input, Modal, Space } from "antd"

interface Props {
    currentName: string
    onClose: () => void
    onSave: (name: string) => Promise<string | null>
}

export default function RenameModal({ currentName, onClose, onSave }: Props) {
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [form] = Form.useForm()

    async function handleSubmit(values: { name: string }) {
        const trimmed = values.name.trim()
        if (!trimmed || trimmed === currentName) { onClose(); return }
        setSaving(true)
        setError(null)
        const err = await onSave(trimmed)
        setSaving(false)
        if (err) { setError(err) } else { onClose() }
    }

    return (
        <Modal
            open
            onCancel={onClose}
            title={
                <Space>
                    <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28, borderRadius: "50%",
                        background: "var(--color-primary-soft, #EFF6FF)",
                        color: "var(--color-primary, #2563EB)", fontSize: 14,
                    }}>
                        ✏️
                    </span>
                    Đổi tên sổ tay
                </Space>
            }
            footer={null}
            width={400}
            centered
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ name: currentName }}
                requiredMark={false}
                style={{ marginTop: 8 }}
            >
                <Form.Item
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập tên sổ tay" }]}
                >
                    <Input
                        placeholder="Tên sổ tay..."
                        maxLength={80}
                        disabled={saving}
                        autoFocus
                        onFocus={(e) => e.target.select()}
                        onChange={() => setError(null)}
                    />
                </Form.Item>

                {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 12 }} />}

                <Space style={{ justifyContent: "flex-end", width: "100%" }}>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={saving}>Lưu</Button>
                </Space>
            </Form>
        </Modal>
    )
}
