import { redirect } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import {
    BookText, Pen, GraduationCap,
    BookOpen, Layers, Dumbbell, MessageSquare,
    ArrowRight, RefreshCw,
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

export default async function AdminDashboardPage() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminUserId(user.id)) redirect("/")

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
    ] = await Promise.all([
        supabase.from("vocabularies").select("id", { count: "exact", head: true }),
        supabase.from("kanjis").select("id", { count: "exact", head: true }),
        supabase.from("grammars").select("id", { count: "exact", head: true }),
        supabase.from("user_profiles").select("id", { count: "exact", head: true }),
        supabase.from("notebooks").select("id", { count: "exact", head: true }),
        supabase.from("notebook_items").select("id", { count: "exact", head: true }),
        supabase.from("practice_sessions").select("id", { count: "exact", head: true }),
        supabase.from("word_comments").select("id", { count: "exact", head: true }),
        supabase.from("vocabularies").select("id", { count: "exact", head: true }).eq("jlpt", "N5"),
        supabase.from("vocabularies").select("id", { count: "exact", head: true }).eq("jlpt", "N4"),
        supabase.from("vocabularies").select("id", { count: "exact", head: true }).eq("jlpt", "N3"),
        supabase.from("vocabularies").select("id", { count: "exact", head: true }).eq("jlpt", "N2"),
        supabase.from("vocabularies").select("id", { count: "exact", head: true }).eq("jlpt", "N1"),
    ])

    const jlpt = [
        { level: "N5", count: n5 ?? 0, color: "var(--color-jlpt-n5)" },
        { level: "N4", count: n4 ?? 0, color: "var(--color-jlpt-n4)" },
        { level: "N3", count: n3 ?? 0, color: "var(--color-jlpt-n3)" },
        { level: "N2", count: n2 ?? 0, color: "var(--color-jlpt-n2)" },
        { level: "N1", count: n1 ?? 0, color: "var(--color-jlpt-n1)" },
    ]
    const maxJlpt = Math.max(...jlpt.map((j) => j.count), 1)

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

                {/* ── Section: JLPT ── */}
                <section className={styles.section}>
                    <h3 className={styles.sectionLabel}>Từ vựng theo cấp độ JLPT</h3>
                    <div className={styles.card}>
                        <div className={styles.jlptChart}>
                            {jlpt.map(({ level, count, color }) => (
                                <div key={level} className={styles.jlptRow}>
                                    <span className={styles.jlptLevel} style={{ color }}>{level}</span>
                                    <div className={styles.jlptBarTrack}>
                                        <div
                                            className={styles.jlptBar}
                                            style={{
                                                width: `${(count / maxJlpt) * 100}%`,
                                                background: color,
                                            }}
                                        />
                                    </div>
                                    <span className={styles.jlptCount}>{fmt(count)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Section: Công cụ ── */}
                <section className={styles.section}>
                    <h3 className={styles.sectionLabel}>Công cụ quản trị</h3>
                    <div className={styles.toolGrid}>
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
                        <Link href="/grammar" className={styles.toolCard}>
                            <Pen size={20} className={styles.toolIcon} />
                            <div>
                                <p className={styles.toolName}>Ngữ pháp</p>
                                <p className={styles.toolDesc}>Duyệt toàn bộ ngữ pháp trong DB</p>
                            </div>
                            <ArrowRight size={16} className={styles.toolArrow} />
                        </Link>
                        <Link href="/kanji" className={styles.toolCard}>
                            <span className={styles.toolKanji}>字</span>
                            <div>
                                <p className={styles.toolName}>Hán tự</p>
                                <p className={styles.toolDesc}>Tra cứu và kiểm tra dữ liệu hán tự</p>
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
