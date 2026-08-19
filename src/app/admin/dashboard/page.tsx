import { redirect } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import {
    GraduationCap, Dumbbell, BookOpen, MessageSquare,
    BookText, Pen, RefreshCw,
    TrendingUp, TrendingDown, Minus,
} from "lucide-react"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { isAdminUserId } from "@/server/utils/admin"
import AppLayout from "@/shared/components/layout/AppLayout"

import styles from "./page.module.css"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Dashboard | Yomi Admin" }

function fmt(n: number): string {
    return n.toLocaleString("vi-VN")
}

function pctChange(current: number, prev: number): { label: string; dir: "up" | "down" | "flat" } {
    if (prev === 0 && current === 0) return { label: "—", dir: "flat" }
    if (prev === 0) return { label: "+mới", dir: "up" }
    const d = ((current - prev) / prev) * 100
    if (Math.abs(d) < 1) return { label: "≈ 0%", dir: "flat" }
    return { label: `${d > 0 ? "+" : ""}${d.toFixed(0)}%`, dir: d > 0 ? "up" : "down" }
}

function SparkArea({ data, color, w = 80, h = 40 }: {
    data: number[]; color: string; w?: number; h?: number
}) {
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

function SparkBars({ data, color, w = 80, h = 40 }: {
    data: number[]; color: string; w?: number; h?: number
}) {
    const max = Math.max(...data, 1)
    const gap = 3
    const bw = Math.max(Math.floor(w / data.length) - gap, 2)
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
            {data.map((v, i) => {
                const bh = Math.max((v / max) * h, 2)
                return <rect key={i} x={i * (bw + gap)} y={h - bh} width={bw} height={bh} fill={color} rx="1" />
            })}
        </svg>
    )
}

function BarChart({ data, color }: { data: { label: string; count: number }[]; color: string }) {
    const CW = 600
    const CH = 160
    const LH = 22
    const YW = 48
    const TW = CW + YW

    const maxVal = Math.max(...data.map(d => d.count), 1)
    const mag = Math.pow(10, Math.floor(Math.log10(Math.max(maxVal, 5))))
    const niceMax = Math.ceil(maxVal / mag) * mag || 10
    const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(f * niceMax))

    const slot = CW / data.length
    const bw = slot * 0.52

    return (
        <svg viewBox={`0 0 ${TW} ${CH + LH}`} width="100%" className={styles.chartSvg} aria-label="Biểu đồ">
            {ticks.map(t => {
                const y = CH - (t / niceMax) * CH
                return (
                    <g key={t}>
                        <line x1={YW} y1={y} x2={TW} y2={y} stroke="#E5EAF2" strokeWidth="1" />
                        <text x={YW - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#9CA3AF">
                            {fmt(t)}
                        </text>
                    </g>
                )
            })}
            {data.map(({ label, count }, i) => {
                const bh = Math.max((count / niceMax) * CH, count > 0 ? 2 : 0)
                const cx = YW + i * slot + slot / 2
                const x = cx - bw / 2
                return (
                    <g key={label}>
                        {bh > 0 && <rect x={x} y={CH - bh} width={bw} height={bh} fill={color} rx="3" />}
                        <text x={cx} y={CH + LH / 2 + 4} textAnchor="middle" fontSize="10" fill="#9CA3AF">
                            {label}
                        </text>
                    </g>
                )
            })}
        </svg>
    )
}

export default async function AdminDashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ view?: string }>
}) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminUserId(user.id)) redirect("/")

    const { view = "users" } = await searchParams

    const now = new Date()
    const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
        return {
            label: d.toLocaleDateString("vi-VN", { month: "short", year: "2-digit" }),
            start: d.toISOString(),
            end: new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString(),
        }
    })

    const [userCounts, practiceCounts, notebookCounts, commentCounts, contentTotals] = await Promise.all([
        Promise.all(months.map(m =>
            supabase.from("user_profiles").select("id", { count: "exact", head: true })
                .gte("created_at", m.start).lt("created_at", m.end)
                .then(({ count }) => count ?? 0)
        )),
        Promise.all(months.map(m =>
            supabase.from("practice_sessions").select("id", { count: "exact", head: true })
                .gte("created_at", m.start).lt("created_at", m.end)
                .then(({ count }) => count ?? 0)
        )),
        Promise.all(months.map(m =>
            supabase.from("notebooks").select("id", { count: "exact", head: true })
                .gte("created_at", m.start).lt("created_at", m.end)
                .then(({ count }) => count ?? 0)
        )),
        Promise.all(months.map(m =>
            supabase.from("word_comments").select("id", { count: "exact", head: true })
                .gte("created_at", m.start).lt("created_at", m.end)
                .then(({ count }) => count ?? 0)
        )),
        Promise.all([
            supabase.from("vocabularies").select("id", { count: "exact", head: true }).then(({ count }) => count ?? 0),
            supabase.from("kanjis").select("id", { count: "exact", head: true }).then(({ count }) => count ?? 0),
            supabase.from("grammars").select("id", { count: "exact", head: true }).then(({ count }) => count ?? 0),
            supabase.from("user_profiles").select("id", { count: "exact", head: true }).then(({ count }) => count ?? 0),
        ]),
    ])

    const [vocabTotal, kanjiTotal, grammarTotal, userTotal] = contentTotals

    const toSeries = (counts: number[]) =>
        months.map((m, i) => ({ label: m.label, count: counts[i] }))

    const chartSeries = view === "practice" ? toSeries(practiceCounts) : toSeries(userCounts)
    const chartColor  = view === "practice" ? "#2563EB" : "#10B981"

    const updatedAt = new Date().toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit", minute: "2-digit",
        day: "2-digit", month: "2-digit", year: "numeric",
    })
    const monthLabel = now.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })

    const kpis = [
        {
            label: "Người dùng mới",
            icon: <GraduationCap size={14} />,
            current: userCounts[5],
            prev: userCounts[4],
            spark: "area" as const,
            sparkData: userCounts,
            color: "#10B981",
            note: `Tổng: ${fmt(userTotal)}`,
        },
        {
            label: "Phiên luyện tập",
            icon: <Dumbbell size={14} />,
            current: practiceCounts[5],
            prev: practiceCounts[4],
            spark: "bar" as const,
            sparkData: practiceCounts,
            color: "#2563EB",
            note: `Tháng trước: ${fmt(practiceCounts[4])}`,
        },
        {
            label: "Sổ tay tạo mới",
            icon: <BookOpen size={14} />,
            current: notebookCounts[5],
            prev: notebookCounts[4],
            spark: "area" as const,
            sparkData: notebookCounts,
            color: "#F59E0B",
            note: `Tháng trước: ${fmt(notebookCounts[4])}`,
        },
        {
            label: "Bình luận",
            icon: <MessageSquare size={14} />,
            current: commentCounts[5],
            prev: commentCounts[4],
            spark: "bar" as const,
            sparkData: commentCounts,
            color: "#8B5CF6",
            note: `Tháng trước: ${fmt(commentCounts[4])}`,
        },
    ]

    return (
        <AppLayout title="Dashboard" hideSearch>
            <div className={styles.page}>

                <div className={styles.pageHeader}>
                    <div>
                        <h2 className={styles.pageTitle}>Tổng quan hoạt động</h2>
                        <p className={styles.pageSubtitle}>Cập nhật lúc {updatedAt}</p>
                    </div>
                    <Link href="/admin/dashboard" className={styles.refreshBtn}>
                        <RefreshCw size={13} />
                        Làm mới
                    </Link>
                </div>

                {/* ── KPI cards ── */}
                <div className={styles.kpiRow}>
                    {kpis.map(({ label, icon, current, prev, spark, sparkData, color, note }) => {
                        const ch = pctChange(current, prev)
                        return (
                            <div key={label} className={styles.kpiCard}>
                                <div className={styles.kpiHead}>
                                    <span className={styles.kpiLabel}>{label}</span>
                                    <span className={styles.kpiHeadIcon}>{icon}</span>
                                </div>
                                <div className={styles.kpiMid}>
                                    <p className={styles.kpiValue}>{fmt(current)}</p>
                                    <div className={styles.kpiSparkWrap}>
                                        {spark === "area"
                                            ? <SparkArea data={sparkData} color={color} />
                                            : <SparkBars data={sparkData} color={color} />
                                        }
                                    </div>
                                </div>
                                <div className={styles.kpiDivider} />
                                <div className={styles.kpiFoot}>
                                    <span className={styles.kpiFootLabel}>{monthLabel}</span>
                                    <span className={`${styles.kpiChange} ${styles[`dir_${ch.dir}`]}`}>
                                        {ch.dir === "up"   && <TrendingUp size={11} />}
                                        {ch.dir === "down" && <TrendingDown size={11} />}
                                        {ch.dir === "flat" && <Minus size={11} />}
                                        {ch.label}
                                    </span>
                                </div>
                                <p className={styles.kpiNote}>{note}</p>
                            </div>
                        )
                    })}
                </div>

                {/* ── Chart ── */}
                <div className={styles.chartCard}>
                    <div className={styles.tabBar}>
                        <Link
                            href="/admin/dashboard?view=users"
                            className={view !== "practice" ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                        >
                            Người dùng mới
                        </Link>
                        <Link
                            href="/admin/dashboard?view=practice"
                            className={view === "practice" ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                        >
                            Phiên luyện tập
                        </Link>
                    </div>
                    <div className={styles.chartBody}>
                        <BarChart data={chartSeries} color={chartColor} />
                    </div>
                </div>

                {/* ── Content totals ── */}
                <div className={styles.totalsRow}>
                    {[
                        { icon: <BookText size={15} />, label: "Từ vựng",      value: fmt(vocabTotal) },
                        { icon: <span className={styles.kanjiGlyph}>字</span>,  label: "Hán tự",       value: fmt(kanjiTotal) },
                        { icon: <Pen size={15} />,       label: "Ngữ pháp",    value: fmt(grammarTotal) },
                        { icon: <GraduationCap size={15} />, label: "Người dùng", value: fmt(userTotal) },
                    ].map(({ icon, label, value }) => (
                        <div key={label} className={styles.totalCard}>
                            <span className={styles.totalIcon}>{icon}</span>
                            <div>
                                <p className={styles.totalValue}>{value}</p>
                                <p className={styles.totalLabel}>{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </AppLayout>
    )
}
