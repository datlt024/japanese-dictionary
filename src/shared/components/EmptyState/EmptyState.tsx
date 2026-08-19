import Link from "next/link"
import { Button, Space, Typography } from "antd"

const { Title, Text } = Typography

type EmptyStateProps = {
    title: string
    description?: string
    keyword?: string
    backHref?: string
    backLabel?: string
    googleTranslateKeyword?: string
}

export default function EmptyState({
    title,
    description,
    keyword,
    backHref = "/",
    backLabel = "Quay lại trang chủ",
    googleTranslateKeyword,
}: EmptyStateProps) {
    const googleTranslateUrl = googleTranslateKeyword
        ? `https://translate.google.com/?sl=ja&tl=vi&text=${encodeURIComponent(googleTranslateKeyword)}&op=translate`
        : null

    return (
        <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 8 }}>
                <span>🐱</span>
                <span style={{ marginLeft: -12, fontSize: 32 }}>📦</span>
            </div>

            <Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>{title}</Title>

            <Text type="secondary" style={{ display: "block", marginBottom: 24, fontSize: 14 }}>
                {description || `Không có dữ liệu${keyword ? ` cho "${keyword}"` : ""}.`}
            </Text>

            <Space>
                <Link href={backHref}>
                    <Button type="primary">{backLabel}</Button>
                </Link>

                {googleTranslateUrl && (
                    <a href={googleTranslateUrl} target="_blank" rel="noopener noreferrer">
                        <Button>Tra trên Google Dịch</Button>
                    </a>
                )}
            </Space>
        </div>
    )
}
