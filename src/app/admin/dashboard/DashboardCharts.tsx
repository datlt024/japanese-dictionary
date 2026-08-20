"use client"

import { useId, useRef, useState } from "react"
import styles from "./page.module.css"

type DayPoint = { date: string; count: number }

export interface DashboardChartsProps {
    userDays: DayPoint[]
    practiceDays: DayPoint[]
    commentDays: DayPoint[]
}

/* ── SVG helpers ── */
function toPoints(data: DayPoint[], w: number, h: number, pad: number): [number, number][] {
    const max = Math.max(...data.map(d => d.count), 1)
    return data.map((d, i) => [
        data.length === 1 ? w / 2 : (i / (data.length - 1)) * w,
        pad + (1 - d.count / max) * (h - pad),
    ] as [number, number])
}

function buildLine(pts: [number, number][]): string {
    if (pts.length === 0) return ""
    const parts = [`M ${pts[0][0]} ${pts[0][1]}`]
    for (let i = 1; i < pts.length; i++) {
        const cx = (pts[i - 1][0] + pts[i][0]) / 2
        parts.push(`C ${cx} ${pts[i - 1][1]} ${cx} ${pts[i][1]} ${pts[i][0]} ${pts[i][1]}`)
    }
    return parts.join(" ")
}

/* ── Single sparkline card ── */
function SparkCard({ data, label, colorVar }: {
    data: DayPoint[]
    label: string
    colorVar: string
}) {
    const gid = useId().replace(/:/g, "")
    const svgRef = useRef<SVGSVGElement>(null)
    const [tip, setTip] = useState<number | null>(null)

    const W = 240, H = 56, PAD = 6
    const pts = toPoints(data, W, H, PAD)
    const line = buildLine(pts)
    const area = pts.length > 0
        ? `${line} L ${pts[pts.length - 1][0]} ${H} L ${pts[0][0]} ${H} Z`
        : ""

    function onMove(e: React.MouseEvent<SVGSVGElement>) {
        const rect = svgRef.current?.getBoundingClientRect()
        if (!rect || data.length === 0) return
        const x = ((e.clientX - rect.left) / rect.width) * W
        const idx = Math.max(0, Math.min(Math.round((x / W) * (data.length - 1)), data.length - 1))
        setTip(idx)
    }

    const total = data.reduce((s, d) => s + d.count, 0)
    const tipData = tip !== null ? data[tip] : null

    return (
        <div className={styles.sparkCard}>
            <div className={styles.sparkHeader}>
                <span className={styles.sparkLabel}>{label}</span>
                <span className={styles.sparkCount}>
                    {total.toLocaleString("vi-VN")}
                    <span className={styles.sparkSuffix}>&nbsp;/ 30 ngày</span>
                </span>
            </div>
            <div className={styles.sparkWrap} onMouseLeave={() => setTip(null)}>
                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${W} ${H}`}
                    preserveAspectRatio="none"
                    className={styles.sparkSvg}
                    onMouseMove={onMove}
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={`var(${colorVar})`} stopOpacity="0.22" />
                            <stop offset="100%" stopColor={`var(${colorVar})`} stopOpacity="0.01" />
                        </linearGradient>
                    </defs>
                    {area && <path d={area} fill={`url(#${gid})`} />}
                    {line && (
                        <path
                            d={line}
                            fill="none"
                            stroke={`var(${colorVar})`}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}
                    {tip !== null && pts[tip] && (
                        <>
                            <line
                                x1={pts[tip][0]} y1={0}
                                x2={pts[tip][0]} y2={H}
                                stroke={`var(${colorVar})`}
                                strokeWidth="0.8"
                                strokeOpacity="0.45"
                                strokeDasharray="2 2"
                            />
                            <circle
                                cx={pts[tip][0]}
                                cy={pts[tip][1]}
                                r="3"
                                fill={`var(${colorVar})`}
                                stroke="white"
                                strokeWidth="1.5"
                            />
                        </>
                    )}
                </svg>
                {tipData && tip !== null && pts[tip] && (
                    <div
                        className={styles.sparkTip}
                        style={{ left: `clamp(0px, ${(pts[tip][0] / W) * 100}%, calc(100% - 90px))` }}
                    >
                        <span className={styles.sparkTipDate}>{tipData.date.slice(5)}</span>
                        <span className={styles.sparkTipVal}>{tipData.count}</span>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ── Main export ── */
export default function DashboardCharts({ userDays, practiceDays, commentDays }: DashboardChartsProps) {
    return (
        <>
            <SparkCard data={userDays} label="Người dùng mới" colorVar="--color-jlpt-n4" />
            <SparkCard data={practiceDays} label="Phiên luyện tập" colorVar="--color-success" />
            <SparkCard data={commentDays} label="Bình luận mới" colorVar="--color-warning" />
        </>
    )
}
