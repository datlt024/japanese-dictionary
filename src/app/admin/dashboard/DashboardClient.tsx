"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Card, Col, Row, Statistic, Tabs, Typography, Divider, Flex } from "antd"
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined, ReloadOutlined } from "@ant-design/icons"
import Link from "next/link"

// Column chart — canvas, must be client-only
const Column = dynamic(
    () => import("@ant-design/charts").then(m => ({ default: m.Column })),
    { ssr: false, loading: () => <div style={{ height: 220, background: "#F7F8FA", borderRadius: 8 }} /> }
)

const { Title, Text } = Typography

export interface DashboardData {
    months: { label: string }[]
    userCounts: number[]
    practiceCounts: number[]
    notebookCounts: number[]
    commentCounts: number[]
    vocabTotal: number
    kanjiTotal: number
    grammarTotal: number
    userTotal: number
    updatedAt: string
    monthLabel: string
}

function fmt(n: number) {
    return n.toLocaleString("vi-VN")
}

function pct(current: number, prev: number): { label: string; dir: "up" | "down" | "flat" } {
    if (prev === 0 && current === 0) return { label: "—", dir: "flat" }
    if (prev === 0) return { label: "+mới", dir: "up" }
    const d = ((current - prev) / prev) * 100
    if (Math.abs(d) < 1) return { label: "≈ 0%", dir: "flat" }
    return { label: `${d > 0 ? "+" : ""}${d.toFixed(0)}%`, dir: d > 0 ? "up" : "down" }
}

const CHANGE_COLOR = { up: "#059669", down: "#DC2626", flat: "#9CA3AF" } as const
const CHANGE_ICON  = {
    up:   <ArrowUpOutlined   style={{ fontSize: 10 }} />,
    down: <ArrowDownOutlined style={{ fontSize: 10 }} />,
    flat: <MinusOutlined     style={{ fontSize: 10 }} />,
}

// SVG sparklines — server-safe, zero deps
function SparkArea({ data, color, w = 80, h = 40 }: { data: number[]; color: string; w?: number; h?: number }) {
    if (data.length < 2) return <div style={{ width: w, height: h }} />
    const max = Math.max(...data, 1)
    const pad = 3
    const pts: [number, number][] = data.map((v, i) => [
        (i / (data.length - 1)) * w,
        h - pad - (v / max) * (h - pad * 2),
    ])
    const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
    const area = `${pts[0][0]},${h} ${line} ${pts[pts.length - 1][0]},${h}`
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
            <polygon points={area} fill={color} fillOpacity="0.12" />
            <polyline points={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    )
}

function SparkBars({ data, color, w = 80, h = 40 }: { data: number[]; color: string; w?: number; h?: number }) {
    const max = Math.max(...data, 1)
    const gap = 3
    const bw = Math.max(Math.floor(w / data.length) - gap, 2)
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
            {data.map((v, i) => {
                const bh = Math.max((v / max) * h, v > 0 ? 2 : 0)
                return <rect key={i} x={i * (bw + gap)} y={h - bh} width={bw} height={bh} fill={color} rx="1" />
            })}
        </svg>
    )
}

export default function DashboardClient({ data }: { data: DashboardData }) {
    const [tab, setTab] = useState("users")

    const chartData = (tab === "practice" ? data.practiceCounts : data.userCounts)
        .map((count, i) => ({ label: data.months[i].label, count }))

    const chartColor = tab === "practice" ? "#2563EB" : "#10B981"

    const kpis = [
        {
            title: "Người dùng mới",
            current: data.userCounts[5],
            prev: data.userCounts[4],
            note: `Tổng: ${fmt(data.userTotal)}`,
            spark: "area" as const,
            sparkData: data.userCounts,
            color: "#10B981",
        },
        {
            title: "Phiên luyện tập",
            current: data.practiceCounts[5],
            prev: data.practiceCounts[4],
            note: `Tháng trước: ${fmt(data.practiceCounts[4])}`,
            spark: "bar" as const,
            sparkData: data.practiceCounts,
            color: "#2563EB",
        },
        {
            title: "Sổ tay tạo mới",
            current: data.notebookCounts[5],
            prev: data.notebookCounts[4],
            note: `Tháng trước: ${fmt(data.notebookCounts[4])}`,
            spark: "area" as const,
            sparkData: data.notebookCounts,
            color: "#F59E0B",
        },
        {
            title: "Bình luận",
            current: data.commentCounts[5],
            prev: data.commentCounts[4],
            note: `Tháng trước: ${fmt(data.commentCounts[4])}`,
            spark: "bar" as const,
            sparkData: data.commentCounts,
            color: "#8B5CF6",
        },
    ]

    const totals = [
        { label: "Từ vựng",    value: data.vocabTotal,   glyph: "語" },
        { label: "Hán tự",     value: data.kanjiTotal,   glyph: "字" },
        { label: "Ngữ pháp",   value: data.grammarTotal, glyph: "文" },
        { label: "Người dùng", value: data.userTotal,    glyph: "人" },
    ]

    return (
        <div style={{ padding: "24px 0 64px" }}>

            {/* ── Header ── */}
            <Flex justify="space-between" align="flex-start" style={{ marginBottom: 20 }}>
                <div>
                    <Title level={4} style={{ margin: "0 0 2px", fontWeight: 700 }}>Tổng quan hoạt động</Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>Cập nhật lúc {data.updatedAt}</Text>
                </div>
                <Link href="/admin/dashboard" style={{ textDecoration: "none" }}>
                    <span style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        height: 32, padding: "0 14px",
                        border: "1px solid #E5EAF2", borderRadius: 8,
                        background: "#fff", color: "#6B7280",
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}>
                        <ReloadOutlined style={{ fontSize: 12 }} />
                        Làm mới
                    </span>
                </Link>
            </Flex>

            {/* ── Section label ── */}
            <Text style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#9CA3AF", display: "block", marginBottom: 12 }}>
                {data.monthLabel} — so với tháng trước
            </Text>

            {/* ── KPI cards ── */}
            <Row
                gutter={0}
                style={{
                    marginBottom: 20,
                    border: "1px solid #E5EAF2",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    background: "#E5EAF2",
                }}
            >
                {kpis.map(({ title, current, prev, note, spark, sparkData, color }, idx) => {
                    const ch = pct(current, prev)
                    return (
                        <Col key={title} span={6}
                            style={{
                                background: "#fff",
                                padding: "20px 24px 16px",
                                borderRight: idx < 3 ? "1px solid #E5EAF2" : "none",
                            }}
                        >
                            <Flex justify="space-between" align="center" style={{ marginBottom: 14 }}>
                                <Text style={{ fontSize: 13, color: "#6B7280" }}>{title}</Text>
                            </Flex>
                            <Flex justify="space-between" align="flex-end" style={{ marginBottom: 16 }}>
                                <Statistic
                                    value={current}
                                    formatter={v => fmt(v as number)}
                                    valueStyle={{ fontSize: 28, fontWeight: 700, lineHeight: 1, color: "#1F2937" }}
                                />
                                <div style={{ lineHeight: 0, flexShrink: 0, marginLeft: 8 }}>
                                    {spark === "area"
                                        ? <SparkArea data={sparkData} color={color} />
                                        : <SparkBars data={sparkData} color={color} />
                                    }
                                </div>
                            </Flex>
                            <Divider style={{ margin: "0 0 12px" }} />
                            <Flex justify="space-between" align="center" style={{ marginBottom: 5 }}>
                                <Text style={{ fontSize: 12, color: "#9CA3AF" }}>{data.monthLabel}</Text>
                                <Text style={{ fontSize: 12, fontWeight: 700, color: CHANGE_COLOR[ch.dir], display: "flex", alignItems: "center", gap: 3 }}>
                                    {CHANGE_ICON[ch.dir]}{ch.label}
                                </Text>
                            </Flex>
                            <Text style={{ fontSize: 12, color: "#9CA3AF" }}>{note}</Text>
                        </Col>
                    )
                })}
            </Row>

            {/* ── Trend chart ── */}
            <Card
                style={{ marginBottom: 20, borderColor: "#E5EAF2", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                styles={{ body: { padding: 0 } }}
            >
                <Tabs
                    activeKey={tab}
                    onChange={setTab}
                    style={{ padding: "0 20px" }}
                    items={[
                        { key: "users",    label: "Người dùng mới" },
                        { key: "practice", label: "Phiên luyện tập" },
                    ]}
                />
                <div style={{ padding: "4px 24px 20px" }}>
                    <Column
                        data={chartData}
                        xField="label"
                        yField="count"
                        height={220}
                        autoFit={true}
                        style={{ fill: chartColor, radius: [4, 4, 0, 0] }}
                        axis={{
                            x: { label: { style: { fontSize: 11, fill: "#9CA3AF" } }, line: null, tick: null },
                            y: { label: { style: { fontSize: 11, fill: "#9CA3AF" } }, grid: { line: { style: { stroke: "#E5EAF2", strokeWidth: 1 } } } },
                        }}
                        tooltip={{ items: [{ channel: "y", name: "Số lượng", valueFormatter: (v: number) => fmt(v) }] }}
                    />
                </div>
            </Card>

            {/* ── Content totals ── */}
            <Text style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#9CA3AF", display: "block", marginBottom: 12 }}>
                Nội dung (tổng cộng)
            </Text>
            <Row
                gutter={0}
                style={{
                    border: "1px solid #E5EAF2",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    background: "#E5EAF2",
                }}
            >
                {totals.map(({ label, value, glyph }, idx) => (
                    <Col key={label} span={6}
                        style={{
                            background: "#fff",
                            padding: "16px 24px",
                            borderRight: idx < 3 ? "1px solid #E5EAF2" : "none",
                        }}
                    >
                        <Flex align="center" gap={14}>
                            <span style={{ fontSize: 26, fontWeight: 900, color: "#D1D5DB", lineHeight: 1 }}>{glyph}</span>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, marginBottom: 3, fontVariantNumeric: "tabular-nums", color: "#1F2937" }}>
                                    {fmt(value)}
                                </div>
                                <div style={{ fontSize: 12, color: "#9CA3AF" }}>{label}</div>
                            </div>
                        </Flex>
                    </Col>
                ))}
            </Row>

        </div>
    )
}
