"use client"

import { BookOpen, CheckCircle2, Layers, Zap } from "lucide-react"
import styles from "./StudyNotebooksTab.module.css"

interface Props {
    notebookCount: number
    totalItems: number
    knownCount: number | string
    ratio: string
}

export default function NotebookOverviewStats({ notebookCount, totalItems, knownCount, ratio }: Props) {
    const STATS = [
        { icon: <Layers size={20} style={{ color: "var(--color-jlpt-n3)" }} />, bg: "var(--color-jlpt-n3-soft)", value: notebookCount, label: "Số sổ tay" },
        { icon: <BookOpen size={20} style={{ color: "var(--color-jlpt-n4)" }} />, bg: "var(--color-jlpt-n4-soft)", value: totalItems, label: "Tổng số từ" },
        { icon: <CheckCircle2 size={20} style={{ color: "var(--color-success)" }} />, bg: "var(--color-success-soft)", value: knownCount || "—", label: "Từ đã ghi nhớ" },
        { icon: <Zap size={20} style={{ color: "var(--color-warning)" }} />, bg: "var(--color-warning-soft)", value: ratio, label: "Tỷ lệ ghi nhớ" },
    ]

    return (
        <section className={styles.overviewSection}>
            <h2 className={styles.overviewTitle}>Tổng quan</h2>
            <div className={styles.statsRow}>
                {STATS.map(({ icon, bg, value, label }) => (
                    <div key={label} className={styles.statItem}>
                        <div className={styles.statIcon} style={{ background: bg }}>{icon}</div>
                        <div>
                            <div className={styles.statNum}>{value}</div>
                            <div className={styles.statLabel}>{label}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
