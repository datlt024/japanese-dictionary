"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { RotateCcw, ClipboardList, BookOpen } from "lucide-react"
import { Button, Card, Progress, Space, Tag, Typography } from "antd"
import type { EnrichedNotebookItem } from "@/domain/notebook/notebook.type"
import { NOTEBOOK_ITEM_TYPE_LABELS } from "@/shared/constants/search-tabs"
import type { PracticeMode, SummaryData } from "./practice.types"
import { MODE_LABEL } from "./practice.constants"
import { formatTime } from "./practice.utils"

const { Title, Text } = Typography

const TYPE_COLORS: Record<string, string> = {
    vocabulary: "blue",
    kanji: "purple",
    grammar: "green",
}

async function savePracticeSession(
    notebookId: string,
    mode: PracticeMode,
    summary: SummaryData,
    totalItems: number
) {
    try {
        await fetch("/api/practice/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                notebook_id: notebookId,
                mode,
                known_ids: summary.known,
                unknown_ids: summary.unknown,
                total_items: totalItems,
                time_taken: summary.timeTaken ?? null,
            }),
        })
    } catch {
        // fire-and-forget
    }
}

export default function Summary({
    items,
    summary,
    mode,
    notebookId,
    onRestart,
    onChangeMode,
}: {
    items: EnrichedNotebookItem[]
    summary: SummaryData
    mode: PracticeMode
    notebookId: string
    onRestart: () => void
    onChangeMode: () => void
}) {
    const saved = useRef(false)

    useEffect(() => {
        if (saved.current) return
        saved.current = true
        savePracticeSession(notebookId, mode, summary, items.length)
    }, [notebookId, mode, summary, items.length])

    const total = summary.known.length + summary.unknown.length
    const percent = total > 0 ? Math.round((summary.known.length / total) * 100) : 0
    const unknownItems = items.filter((i) => summary.unknown.includes(i.id))

    return (
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
            <Card
                style={{ borderColor: "#E5EAF2", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
                <Title level={4} style={{ margin: "0 0 24px", textAlign: "center" }}>
                    Kết quả · {MODE_LABEL[mode]}
                </Title>

                <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 24 }}>
                    {[
                        { label: "Đúng", value: summary.known.length, color: "#16A34A" },
                        { label: "Sai", value: summary.unknown.length, color: "#EF4444" },
                        { label: "Chính xác", value: `${percent}%`, color: "#2563EB" },
                        ...(summary.timeTaken !== undefined ? [{ label: "Thời gian", value: formatTime(summary.timeTaken), color: "#F59E0B" }] : []),
                    ].map((item, i, arr) => (
                        <div key={item.label} style={{
                            flex: 1, textAlign: "center", padding: "12px 8px",
                            borderRight: i < arr.length - 1 ? "1px solid #E5EAF2" : "none",
                        }}>
                            <div style={{ fontSize: 26, fontWeight: 700, color: item.color, lineHeight: 1, marginBottom: 4 }}>
                                {item.value}
                            </div>
                            <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
                        </div>
                    ))}
                </div>

                <Progress
                    percent={percent}
                    strokeColor={percent >= 70 ? "#16A34A" : percent >= 40 ? "#F59E0B" : "#EF4444"}
                    style={{ marginBottom: 24 }}
                />

                {unknownItems.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <Text strong style={{ display: "block", marginBottom: 12, fontSize: 13 }}>
                            Cần ôn lại ({unknownItems.length})
                        </Text>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto" }}>
                            {unknownItems.map((item) => (
                                <Link key={item.id} href={item.display.href} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, border: "1px solid #E5EAF2", background: "#FAFAFA", textDecoration: "none" }}>
                                    <Tag color={TYPE_COLORS[item.item_type] ?? "default"} style={{ margin: 0, fontSize: 11, flexShrink: 0 }}>
                                        {NOTEBOOK_ITEM_TYPE_LABELS[item.item_type]}
                                    </Tag>
                                    <Text strong style={{ fontSize: 14, color: "#1F2937" }}>{item.display.title}</Text>
                                    {item.display.meaning && (
                                        <Text type="secondary" style={{ fontSize: 12, marginLeft: "auto" }}>{item.display.meaning}</Text>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <Space style={{ justifyContent: "center", width: "100%" }}>
                    <Button icon={<RotateCcw size={14} />} onClick={onRestart}>Luyện lại</Button>
                    <Button icon={<ClipboardList size={14} />} onClick={onChangeMode}>Đổi chế độ</Button>
                    <Link href="/study?tab=so-tay">
                        <Button type="primary" icon={<BookOpen size={14} />}>Về sổ tay</Button>
                    </Link>
                </Space>
            </Card>
        </div>
    )
}
