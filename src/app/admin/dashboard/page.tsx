import { redirect } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import {
    BookText, Pen, GraduationCap,
    BookOpen, Dumbbell, MessageSquare,
    ArrowRight, RefreshCw, TrendingUp, TrendingDown, Minus,
} from "lucide-react"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { isAdminUserId } from "@/server/utils/admin"
import AppLayout from "@/shared/components/layout/AppLayout"

import styles from "./page.module.css"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Dashboard | Yomi Admin",
}

function fmt(n: number | null): string {
    if (n === null) return "—"
    return n.toLocaleString("vi-VN")
}

function pct(current: number, prev: number): { label: string; dir: "up" | "down" | "flat" } {
    if (prev === 0 && current === 0) return { label: "—", dir: "flat" }
    if (prev === 0) return { label: "mới", dir: "up" }
    const delta = ((current - prev) / prev) * 100
    if (Math.abs(delta) < 1) return { label: "≈ 0%", dir: "flat" }
    return {
        label: `${delta > 0 ? "+" : ""}${delta.toFixed(0)}%`,
        dir: delta > 0 ? "up" : "down",
    }
}

export default async function AdminDashboardPage() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminUserId(user.id)) redirect("/")

    // ── Date ranges ──
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

    // Last 6 months for trend
    const trendMonths = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
        return {
            label: d.toLocaleDateString("vi-VN", { month: "short", year: "2-digit" }),
            start: d.toISOString(),
            end: new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString(),
        }
    })

    // ── All queries in parallel ──
    const [
        // This month
        { count: usersThisMonth },
        { count: practiceThisMonth },
        { count: notebooksThisMonth },
        { count: commentsThisMonth },
        // Last month
        { count: usersLastMonth },
        { count: practiceLastMonth },
        { count: notebooksLastMonth },
        { count: commentsLastMonth },
        // Content totals
        { count: vocabTotal },
        { count: kanjiTotal },
        { count: grammarTotal },
        { count: userTotal },
        // Trend: new users per month
        ...trendCounts
    ] = await Promise.all([
        supabase.from("user_profiles").select("id", { count: "exact", head: true }).gte("created_at", thisMonthStart).lt("created_at", nextMonthStart),
        supabase.from("practice_sessions").select("id", { count: "exact", head: true }).gte("created_at", thisMonthStart).lt("created_at", nextMonthStart),
        supabase.from("notebooks").select("id", { count: "exact", head: true }).gte("created_at", thisMonthStart).lt("created_at", nextMonthStart),
        supabase.from("word_comments").select("id", { count: "exact", head: true }).gte("created_at", thisMonthStart).lt("created_at", nextMonthStart),

        supabase.from("user_profiles").select("id", { count: "exact", head: true }).gte("created_at", lastMonthStart).lt("created_at", thisMonthStart),
        supabase.from("practice_sessions").select("id", { count: "exact", head: true }).gte("created_at", lastMonthStart).lt("created_at", thisMonthStart),
        supabase.from("notebooks").select("id", { count: "exact", head: true }).gte("created_at", lastMonthStart).lt("created_at", thisMonthStart),
        supabase.from("word_comments").select("id", { count: "exact", head: true }).gte("created_at", lastMonthStart).lt("created_at", thisMonthStart),

        supabase.from("vocabularies").select("id", { count: "exact", head: true }),
        supabase.from("kanjis").select("id", { count: "exact", head: true }),
        supabase.from("grammars").select("id", { count: "exact", head: true }),
        supabase.from("user_profiles").select("id", { count: "exact", head: true }),

        ...trendMonths.map(m =>
            supabase.from("user_profiles").select("id", { count: "exact", head: true }).gte("created_at", m.start).lt("created_at", m.end)
        ),
    ])

    const trend = trendMonths.map((m, i) => ({
        label: m.label,
        count: (trendCounts[i] as { count: number | null }).count ?? 0,
    }))
    const maxTrend = Math.max(...trend.map(t => t.count), 1)

    const thisMonth = new Date().toLocaleDateString("vi-VN", {
        month: "long", year: "numeric",
    })

    const updatedAt = new Date().toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit", minute: "2-digit",
        day: "2-digit", month: "2-digit", year: "numeric",
    })

    const kpis = [
        {
            icon: <GraduationCap size={18} />,
            label: "Người dùng mới",
            current: usersThisMonth ?? 0,
            prev: usersLastMonth ?? 0,
            accent: "emerald" as const,
        },
        {
            icon: <Dumbbell size={18} />,
            label: "Phiên luyện tập",
            current: practiceThisMonth ?? 0,
            prev: practiceLastMonth ?? 0,
            accent: "blue" as const,
        },
        {
            icon: <BookOpen size={18} />,
            label: "Sổ tay tạo mới",
            current: notebooksThisMonth ?? 0,
            prev: notebooksLastMonth ?? 0,
            accent: "amber" as const,
        },
        {
            icon: <MessageSquare size={18} />,
            label: "Bình luận",
            current: commentsThisMonth ?? 0,
            prev: commentsLastMonth ?? 0,
            accent: "violet" as const,
        },
    ]

    return (
        <AppLayout title="Dashboard" hideSearch>
            <div className={styles.page}>

                {/* ── Header ── */}
                <div className={styles.pageHeader}>
                    <div>
                        <h2 className={styles.pageTitle}>Tổng quan hoạt động</h2>
                        <p className={styles.pageSubtitle}>Cập nhật lúc {updatedAt}</p>
                    </div>
                    <Link href="/admin/dashboard" className={styles.refreshBtn} title="Làm mới">
                        <RefreshCw size={14} />
                        Làm mới
                    </Link>
                </div>

                {/* ── Section: Tháng này ── */}
                <section className={styles.section}>
                    <h3 className={styles.sectionLabel}>{thisMonth} — so với tháng trước</h3>
                    <div className={styles.kpiGrid}>
                        {kpis.map(({ icon, label, current, prev, accent }) => {
                            const change = pct(current, prev)
                            return (
                                <div key={label} className={`${styles.kpiCard} ${styles[`accent_${accent}`]}`}>
                                    <div className={styles.kpiIconRow}>
                                        <span className={styles.kpiIcon}>{icon}</span>
                                        <span className={`${styles.kpiBadge} ${styles[`badge_${change.dir}`]}`}>
                                            {change.dir === "up" && <TrendingUp size={11} />}
                                            {change.dir === "down" && <TrendingDown size={11} />}
                                            {change.dir === "flat" && <Minus size={11} />}
                                            {change.label}
                                        </span>
                                    </div>
                                    <p className={styles.kpiValue}>{fmt(current)}</p>
                                    <p className={styles.kpiLabel}>{label}</p>
                                    <p className={styles.kpiCompare}>Tháng trước: {fmt(prev)}</p>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* ── Section: Trend ── */}
                <section className={styles.section}>
                    <h3 className={styles.sectionLabel}>Người dùng đăng ký — 6 tháng gần nhất</h3>
                    <div className={styles.card}>
                        <div className={styles.trendChart}>
                            {trend.map(({ label, count }) => (
                                <div key={label} className={styles.trendCol}>
                                    <span className={styles.trendCount}>{fmt(count)}</span>
                                    <div className={styles.trendBarTrack}>
                                        <div
                                            className={styles.trendBar}
                                            style={{ height: `${(count / maxTrend) * 100}%` }}
                                        />
                                    </div>
                                    <span className={styles.trendLabel}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Section: Content totals ── */}
                <section className={styles.section}>
                    <h3 className={styles.sectionLabel}>Nội dung (tổng cộng)</h3>
                    <div className={styles.totalsGrid}>
                        <TotalCard icon={<BookText size={16} />} label="Từ vựng" value={fmt(vocabTotal)} />
                        <TotalCard icon={<span className={styles.kanjiChar}>字</span>} label="Hán tự" value={fmt(kanjiTotal)} />
                        <TotalCard icon={<Pen size={16} />} label="Ngữ pháp" value={fmt(grammarTotal)} />
                        <TotalCard icon={<GraduationCap size={16} />} label="Người dùng" value={fmt(userTotal)} />
                    </div>
                </section>

                {/* ── Section: Tools ── */}
                <section className={styles.section}>
                    <h3 className={styles.sectionLabel}>Công cụ quản trị</h3>
                    <div className={styles.toolGrid}>
                        <Link href="/grammar" className={styles.toolCard}>
                            <Pen size={18} className={styles.toolIcon} />
                            <div>
                                <p className={styles.toolName}>Ngữ pháp</p>
                                <p className={styles.toolDesc}>Duyệt toàn bộ ngữ pháp trong DB</p>
                            </div>
                            <ArrowRight size={15} className={styles.toolArrow} />
                        </Link>
                        <Link href="/kanji" className={styles.toolCard}>
                            <span className={styles.toolKanji}>字</span>
                            <div>
                                <p className={styles.toolName}>Hán tự</p>
                                <p className={styles.toolDesc}>Tra cứu và kiểm tra dữ liệu hán tự</p>
                            </div>
                            <ArrowRight size={15} className={styles.toolArrow} />
                        </Link>
                    </div>
                </section>

            </div>
        </AppLayout>
    )
}

function TotalCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className={styles.totalCard}>
            <span className={styles.totalIcon}>{icon}</span>
            <p className={styles.totalValue}>{value}</p>
            <p className={styles.totalLabel}>{label}</p>
        </div>
    )
}
