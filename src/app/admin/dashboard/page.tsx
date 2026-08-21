import { redirect } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import {
    BookText, Pen, GraduationCap,
    BookOpen, Layers, Dumbbell, MessageSquare,
    ArrowRight, RefreshCw, Users, Database,
} from "lucide-react"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { isAdminUser } from "@/server/utils/admin"
import AppLayout from "@/shared/components/layout/AppLayout"
import DashboardCharts from "./DashboardCharts"

import styles from "./page.module.css"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Dashboard | Yomi Admin",
}

function fmt(n: number | null): string {
    if (n === null) return "—"
    return n.toLocaleString("vi-VN")
}

function groupByDay(
    records: { created_at: string }[] | null,
    days = 30,
): { date: string; count: number }[] {
    const map: Record<string, number> = {}
    for (const r of records ?? []) {
        const day = r.created_at.slice(0, 10)
        map[day] = (map[day] ?? 0) + 1
    }
    const now = new Date()
    const result: { date: string; count: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const key = [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, "0"),
            String(d.getDate()).padStart(2, "0"),
        ].join("-")
        result.push({ date: key, count: map[key] ?? 0 })
    }
    return result
}

export default async function AdminDashboardPage() {
    const authClient = await createSupabaseServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user || !isAdminUser(user)) redirect("/")

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const thirtyDaysAgo = cutoff.toISOString()

    const [
        { count: vocabTotal },
        { count: kanjiTotal },
        { count: grammarTotal },
        { count: userTotal },
        { count: notebookTotal },
        { count: itemTotal },
        { count: practiceTotal },
        { count: commentTotal },
        { count: n5 },
        { count: n4 },
        { count: n3 },
        { count: n2 },
        { count: n1 },
        { data: userHistory },
        { data: practiceHistory },
        { data: commentHistory },
    ] = await Promise.all([
        supabaseServer.from("vocabularies").select("id", { count: "exact", head: true }),
        supabaseServer.from("kanjis").select("id", { count: "exact", head: true }),
        supabaseServer.from("grammars").select("id", { count: "exact", head: true }),
        supabaseServer.from("user_profiles").select("id", { count: "exact", head: true }),
        supabaseServer.from("notebooks").select("id", { count: "exact", head: true }),
        supabaseServer.from("notebook_items").select("id", { count: "exact", head: true }),
        supabaseServer.from("practice_sessions").select("id", { count: "exact", head: true }),
        supabaseServer.from("word_comments").select("id", { count: "exact", head: true }),
        supabaseServer.from("vocabularies").select("id", { count: "exact", head: true }).eq("jlpt", "N5"),
        supabaseServer.from("vocabularies").select("id", { count: "exact", head: true }).eq("jlpt", "N4"),
        supabaseServer.from("vocabularies").select("id", { count: "exact", head: true }).eq("jlpt", "N3"),
        supabaseServer.from("vocabularies").select("id", { count: "exact", head: true }).eq("jlpt", "N2"),
        supabaseServer.from("vocabularies").select("id", { count: "exact", head: true }).eq("jlpt", "N1"),
        supabaseServer.from("user_profiles").select("created_at").gte("created_at", thirtyDaysAgo),
        supabaseServer.from("practice_sessions").select("created_at").gte("created_at", thirtyDaysAgo),
        supabaseServer.from("word_comments").select("created_at").gte("created_at", thirtyDaysAgo),
    ])

    const jlpt = [
        { level: "N5", count: n5 ?? 0, color: "var(--color-jlpt-n5)" },
        { level: "N4", count: n4 ?? 0, color: "var(--color-jlpt-n4)" },
        { level: "N3", count: n3 ?? 0, color: "var(--color-jlpt-n3)" },
        { level: "N2", count: n2 ?? 0, color: "var(--color-jlpt-n2)" },
        { level: "N1", count: n1 ?? 0, color: "var(--color-jlpt-n1)" },
    ]
    const maxJlpt = Math.max(...jlpt.map(j => j.count), 1)

    const contentBreakdown = [
        { label: "Từ vựng", count: vocabTotal ?? 0, color: "var(--color-primary)" },
        { label: "Hán tự", count: kanjiTotal ?? 0, color: "var(--color-jlpt-n4)" },
        { label: "Ngữ pháp", count: grammarTotal ?? 0, color: "var(--color-jlpt-n3)" },
    ]
    const contentTotal = (vocabTotal ?? 0) + (kanjiTotal ?? 0) + (grammarTotal ?? 0)

    const userDays = groupByDay(userHistory)
    const practiceDays = groupByDay(practiceHistory)
    const commentDays = groupByDay(commentHistory)

    const updatedAt = new Date().toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })

    return (
        <AppLayout title="Dashboard" hideSearch>
            <div className={styles.page}>

                {/* ── Header ── */}
                <div className={styles.pageHeader}>
                    <div>
                        <h2 className={styles.pageTitle}>Tổng quan hệ thống</h2>
                        <p className={styles.pageSubtitle}>Cập nhật lúc {updatedAt}</p>
                    </div>
                    <Link href="/admin/dashboard" className={styles.refreshBtn} title="Làm mới">
                        <RefreshCw size={14} />
                        Làm mới
                    </Link>
                </div>

                {/* ── Section: Nội dung ── */}
                <section className={styles.section}>
                    <h3 className={styles.sectionLabel}>Nội dung</h3>
                    <div className={styles.kpiGrid}>
                        <KpiCard icon={<BookText size={18} />} label="Từ vựng" value={fmt(vocabTotal)} accent="blue" />
                        <KpiCard icon={<span className={styles.kanjiChar}>字</span>} label="Hán tự" value={fmt(kanjiTotal)} accent="indigo" />
                        <KpiCard icon={<Pen size={18} />} label="Ngữ pháp" value={fmt(grammarTotal)} accent="violet" />
                        <KpiCard icon={<GraduationCap size={18} />} label="Người dùng" value={fmt(userTotal)} accent="emerald" />
                    </div>
                </section>

                {/* ── Section: Hoạt động ── */}
                <section className={styles.section}>
                    <h3 className={styles.sectionLabel}>Hoạt động</h3>
                    <div className={styles.kpiGrid}>
                        <KpiCard icon={<BookOpen size={18} />} label="Sổ tay" value={fmt(notebookTotal)} accent="amber" />
                        <KpiCard icon={<Layers size={18} />} label="Mục sổ tay" value={fmt(itemTotal)} accent="amber" />
                        <KpiCard icon={<Dumbbell size={18} />} label="Phiên luyện tập" value={fmt(practiceTotal)} accent="rose" />
                        <KpiCard icon={<MessageSquare size={18} />} label="Bình luận" value={fmt(commentTotal)} accent="sky" />
                    </div>
                </section>

                {/* ── Section: 30-day sparklines (client) ── */}
                <section className={styles.section}>
                    <h3 className={styles.sectionLabel}>Hoạt động 30 ngày qua</h3>
                    <div className={styles.sparkGrid}>
                        <DashboardCharts
                            userDays={userDays}
                            practiceDays={practiceDays}
                            commentDays={commentDays}
                        />
                    </div>
                </section>

                {/* ── Section: Phân tích nội dung ── */}
                <section className={styles.section}>
                    <h3 className={styles.sectionLabel}>Phân tích nội dung</h3>
                    <div className={styles.analyticsRow}>

                        {/* JLPT chart */}
                        <div className={`${styles.card} ${styles.jlptCard}`}>
                            <p className={styles.cardTitle}>Từ vựng theo cấp độ JLPT</p>
                            <div className={styles.jlptChart}>
                                {jlpt.map(({ level, count, color }) => (
                                    <div key={level} className={styles.jlptRow}>
                                        <span className={styles.jlptLevel} style={{ color }}>{level}</span>
                                        <div className={styles.jlptBarTrack}>
                                            <div
                                                className={styles.jlptBar}
                                                style={{ width: `${(count / maxJlpt) * 100}%`, background: color }}
                                            />
                                        </div>
                                        <span className={styles.jlptCount}>{fmt(count)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content breakdown */}
                        <div className={`${styles.card} ${styles.contentCard}`}>
                            <p className={styles.cardTitle}>Cơ cấu nội dung</p>

                            {/* Stacked bar */}
                            <div className={styles.stackedTrack}>
                                {contentBreakdown.map(({ label, count, color }) => (
                                    <div
                                        key={label}
                                        className={styles.stackedSeg}
                                        style={{
                                            width: `${contentTotal > 0 ? (count / contentTotal) * 100 : 0}%`,
                                            background: color,
                                        }}
                                        title={`${label}: ${fmt(count)}`}
                                    />
                                ))}
                            </div>

                            {/* Legend rows */}
                            <div className={styles.contentRows}>
                                {contentBreakdown.map(({ label, count, color }) => (
                                    <div key={label} className={styles.contentRow}>
                                        <span className={styles.contentDot} style={{ background: color }} />
                                        <span className={styles.contentLabel}>{label}</span>
                                        <span className={styles.contentPct}>
                                            {contentTotal > 0 ? `${Math.round((count / contentTotal) * 100)}%` : "—"}
                                        </span>
                                        <span className={styles.contentCount}>{fmt(count)}</span>
                                    </div>
                                ))}
                                <div className={styles.contentTotal}>
                                    <span className={styles.contentTotalLabel}>Tổng cộng</span>
                                    <span className={styles.contentTotalVal}>{fmt(contentTotal)}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* ── Section: Công cụ ── */}
                <section className={styles.section}>
                    <h3 className={styles.sectionLabel}>Công cụ quản trị</h3>
                    <div className={styles.toolGrid}>
                        <Link href="/admin/users" className={styles.toolCard}>
                            <Users size={20} className={styles.toolIcon} />
                            <div>
                                <p className={styles.toolName}>Người dùng</p>
                                <p className={styles.toolDesc}>Quản lý tài khoản và thuê bao</p>
                            </div>
                            <ArrowRight size={16} className={styles.toolArrow} />
                        </Link>
                        <Link href="/admin/comments" className={styles.toolCard}>
                            <MessageSquare size={20} className={styles.toolIcon} />
                            <div>
                                <p className={styles.toolName}>Bình luận</p>
                                <p className={styles.toolDesc}>Kiểm duyệt bình luận của người dùng</p>
                            </div>
                            <ArrowRight size={16} className={styles.toolArrow} />
                        </Link>
                        <Link href="/admin" className={styles.toolCard}>
                            <BookOpen size={20} className={styles.toolIcon} />
                            <div>
                                <p className={styles.toolName}>Sổ tay cộng đồng</p>
                                <p className={styles.toolDesc}>Quản lý sổ tay và nhóm công khai</p>
                            </div>
                            <ArrowRight size={16} className={styles.toolArrow} />
                        </Link>
                        <Link href="/study" className={styles.toolCard}>
                            <GraduationCap size={20} className={styles.toolIcon} />
                            <div>
                                <p className={styles.toolName}>Khu vực học tập</p>
                                <p className={styles.toolDesc}>Xem giao diện người dùng</p>
                            </div>
                            <ArrowRight size={16} className={styles.toolArrow} />
                        </Link>
                    </div>
                </section>

                {/* ── Section: Quản lý dữ liệu ── */}
                <section className={styles.section}>
                    <h3 className={styles.sectionLabel}>Quản lý dữ liệu</h3>
                    <div className={styles.toolGrid}>
                        <Link href="/admin/data/vocabulary" className={styles.toolCard}>
                            <BookText size={20} className={styles.toolIcon} />
                            <div>
                                <p className={styles.toolName}>Từ vựng</p>
                                <p className={styles.toolDesc}>Thêm, sửa, xóa từ vựng trong DB</p>
                            </div>
                            <ArrowRight size={16} className={styles.toolArrow} />
                        </Link>
                        <Link href="/admin/data/grammar" className={styles.toolCard}>
                            <Pen size={20} className={styles.toolIcon} />
                            <div>
                                <p className={styles.toolName}>Ngữ pháp</p>
                                <p className={styles.toolDesc}>Thêm, sửa, xóa mẫu ngữ pháp</p>
                            </div>
                            <ArrowRight size={16} className={styles.toolArrow} />
                        </Link>
                        <Link href="/admin/data/kanji" className={styles.toolCard}>
                            <Database size={20} className={styles.toolIcon} />
                            <div>
                                <p className={styles.toolName}>Hán tự</p>
                                <p className={styles.toolDesc}>Thêm, sửa, xóa dữ liệu hán tự</p>
                            </div>
                            <ArrowRight size={16} className={styles.toolArrow} />
                        </Link>
                    </div>
                </section>

            </div>
        </AppLayout>
    )
}

function KpiCard({
    icon, label, value, accent,
}: {
    icon: React.ReactNode
    label: string
    value: string
    accent: "blue" | "indigo" | "violet" | "emerald" | "amber" | "rose" | "sky"
}) {
    return (
        <div className={`${styles.kpiCard} ${styles[`accent_${accent}`]}`}>
            <div className={styles.kpiIcon}>{icon}</div>
            <p className={styles.kpiValue}>{value}</p>
            <p className={styles.kpiLabel}>{label}</p>
        </div>
    )
}
