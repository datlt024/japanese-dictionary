import type { Metadata } from "next"
import Link from "next/link"

import AppLayout from "@/shared/components/layout/AppLayout"

import styles from "./page.module.css"

export const metadata: Metadata = {
    title: "Hán tự | Yomi",
    description: "Tra cứu và học Hán tự tiếng Nhật theo trình độ JLPT.",
}

const JLPT_LEVELS = [
    { level: "N5", desc: "80 Hán tự cơ bản nhất", color: "#16a34a" },
    { level: "N4", desc: "170 Hán tự thường gặp", color: "#2563eb" },
    { level: "N3", desc: "370 Hán tự trung cấp", color: "#7c3aed" },
    { level: "N2", desc: "380 Hán tự nâng cao", color: "#ea580c" },
    { level: "N1", desc: "600+ Hán tự cấp cao", color: "#dc2626" },
]

export default function KanjiListPage() {
    return (
        <AppLayout title="Hán tự" activeSearchTab="kanji">
            <main className={styles.page}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Tra cứu Hán tự</h1>
                    <p className={styles.pageDesc}>
                        Nhập chữ Hán hoặc từ khoá vào thanh tìm kiếm phía trên, hoặc duyệt theo cấp độ JLPT bên dưới.
                    </p>
                </div>

                <section>
                    <h2 className={styles.sectionTitle}>Duyệt theo cấp độ</h2>
                    <div className={styles.levelGrid}>
                        {JLPT_LEVELS.map(({ level, desc, color }) => (
                            <Link
                                key={level}
                                href={`/search?q=${level}&tab=kanji`}
                                className={styles.levelCard}
                                style={{ "--accent": color } as React.CSSProperties}
                            >
                                <span className={styles.levelBadge}>{level}</span>
                                <div>
                                    <p className={styles.levelLabel}>Hán tự {level}</p>
                                    <p className={styles.levelDesc}>{desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </AppLayout>
    )
}
