"use client"

import { Button, Progress, Tag, Typography } from "antd"
import { ArrowLeftOutlined } from "@ant-design/icons"
import { NOTEBOOK_ITEM_TYPE_LABELS } from "@/shared/constants/search-tabs"

const { Text } = Typography

export function PracticeHeader({
    onBack,
    index,
    total,
    extra,
}: {
    onBack: () => void
    index: number
    total: number
    extra?: React.ReactNode
}) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                style={{ color: "#6B7280", fontSize: 13 }}
            >
                Đổi chế độ
            </Button>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {extra}
                <Text type="secondary" style={{ fontSize: 13 }}>
                    {index + 1} / {total}
                </Text>
            </div>
        </div>
    )
}

export function ProgressBar({ index, total }: { index: number; total: number }) {
    return (
        <Progress
            percent={Math.round(((index + 1) / total) * 100)}
            showInfo={false}
            strokeColor="#2563EB"
            trailColor="#E5EAF2"
            style={{ marginBottom: 20 }}
        />
    )
}

const TYPE_COLORS: Record<string, string> = {
    vocabulary: "blue",
    kanji: "purple",
    grammar: "green",
}

export function TypeBadge({ type }: { type: string }) {
    return (
        <Tag color={TYPE_COLORS[type] ?? "default"} style={{ margin: 0 }}>
            {NOTEBOOK_ITEM_TYPE_LABELS[type]}
        </Tag>
    )
}
