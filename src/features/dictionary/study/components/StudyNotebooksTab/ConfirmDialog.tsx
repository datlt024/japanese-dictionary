import React from "react"
import { Modal, Button, Typography, Space } from "antd"

const { Text } = Typography

interface Props {
    icon: React.ReactNode
    iconStyle?: React.CSSProperties
    title: string
    desc: React.ReactNode
    okLabel: string
    okStyle?: React.CSSProperties
    loading?: boolean
    onCancel: () => void
    onOk: () => void
}

export default function ConfirmDialog({ icon, iconStyle, title, desc, okLabel, okStyle, loading, onCancel, onOk }: Props) {
    return (
        <Modal
            open
            onCancel={onCancel}
            footer={null}
            width={400}
            centered
            destroyOnHidden
        >
            <Space direction="vertical" align="center" style={{ width: "100%", padding: "12px 0 4px", textAlign: "center" }}>
                <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, marginBottom: 4,
                    ...iconStyle,
                }}>
                    {icon}
                </div>
                <Text strong style={{ fontSize: 16 }}>{title}</Text>
                <Text type="secondary" style={{ fontSize: 13 }}>{desc}</Text>
            </Space>
            <Space style={{ justifyContent: "flex-end", width: "100%", marginTop: 24 }}>
                <Button onClick={onCancel}>Hủy</Button>
                <Button
                    type="primary"
                    danger={okStyle?.color === "var(--color-danger)" || (typeof okStyle?.background === "string" && okStyle.background.includes("danger"))}
                    onClick={onOk}
                    loading={loading}
                    style={okStyle}
                >
                    {okLabel}
                </Button>
            </Space>
        </Modal>
    )
}
