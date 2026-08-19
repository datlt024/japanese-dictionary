"use client"

import { Button, Card, Statistic, Typography } from "antd"
import { BookOutlined } from "@ant-design/icons"
import { useStreak, WEEK_DAYS } from "@/shared/hooks/useStreak"

const { Text } = Typography

interface Props {
    userId: string | null
    totalItems: number
    firstNotebookId: string | null
    onStartPractice: () => void
    onViewFirst: () => void
}

export default function NotebookSidebarWidgets({ userId, totalItems, firstNotebookId, onStartPractice, onViewFirst }: Props) {
    const streak = useStreak(userId)

    return (
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card
                size="small"
                style={{ borderColor: "#E5EAF2" }}
                styles={{ body: { padding: 20 } }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                    <span style={{ fontSize: 16 }}>📅</span>
                    <Text strong style={{ fontSize: 13 }}>Ôn tập hôm nay</Text>
                </div>
                <Statistic
                    value={totalItems}
                    suffix={<Text type="secondary" style={{ fontSize: 14 }}> từ cần ôn</Text>}
                    valueStyle={{ fontSize: 28, fontWeight: 700, color: "#1F2937" }}
                />
                <Button
                    type="primary"
                    block
                    icon={<BookOutlined />}
                    onClick={onStartPractice}
                    disabled={!firstNotebookId}
                    style={{ marginTop: 12 }}
                >
                    Bắt đầu ôn tập
                </Button>
                {firstNotebookId && (
                    <Button type="link" block onClick={onViewFirst} style={{ marginTop: 4, fontSize: 12 }}>
                        Xem chi tiết →
                    </Button>
                )}
            </Card>

            <Card
                size="small"
                style={{ borderColor: "#E5EAF2" }}
                styles={{ body: { padding: 20 } }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                    <span style={{ fontSize: 16 }}>🔥</span>
                    <Text strong style={{ fontSize: 13 }}>Chuỗi học của bạn</Text>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#1F2937", marginBottom: 4 }}>
                    {streak.count > 0 ? `${streak.count} ngày` : "—"}
                </div>
                <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 12 }}>
                    {streak.count > 0
                        ? "Tuyệt vời! Tiếp tục duy trì nhé."
                        : "Đăng nhập mỗi ngày để tăng chuỗi học!"}
                </Text>
                <div style={{ display: "flex", gap: 4, justifyContent: "space-between" }}>
                    {WEEK_DAYS.map((day, i) => (
                        <div key={day} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                            <span style={{ fontSize: 14, opacity: streak.activeDays.includes(i) ? 1 : 0.18 }}>🔥</span>
                            <Text type="secondary" style={{ fontSize: 10 }}>{day}</Text>
                        </div>
                    ))}
                </div>
            </Card>
        </aside>
    )
}
