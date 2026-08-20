import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen } from "lucide-react"

import AppLayout from "@/shared/components/layout/AppLayout"
import { getAllStudyCounts } from "@/server/services/study/jlpt-study.service"
import type { JlptLevel } from "@/server/services/study/jlpt-study.service"
import styles from "./page.module.css"

export const revalidate = 86400

export const metadata: Metadata = {
    title: "Từ vựng",
    description: "Tra cứu và học từ vựng tiếng Nhật theo cấp độ JLPT từ N5 đến N1.",
}

const JLPT_LEVELS: JlptLevel[] = ["N5", "N4", "N3", "N2", "N1"]

const LEVEL_DESC: Record<JlptLevel, string> = {
    N5: "Từ vựng cơ bản nhất, phù hợp người mới bắt đầu",
    N4: "Từ vựng sơ cấp, dùng trong giao tiếp hàng ngày",
    N3: "Từ vựng trung cấp, cần thiết cho cuộc sống thực tế",
    N2: "Từ vựng nâng cao, phổ biến trong báo chí và công việc",
    N1: "Từ vựng chuyên sâu, cần thiết cho người dùng tiếng Nhật thành thạo",
}

export default async function VocabularyBrowsePage() {
    const counts = await getAllStudyCounts()

    return (
        <AppLayout title="Từ vựng" hideSearchTabs>
            <div className={styles.page}>
                <div className={styles.header}>
                    <div className={styles.headerIcon}>
                        <BookOpen size={22} />
                    </div>
                    <div>
                        <h1 className={styles.title}>Từ vựng tiếng Nhật</h1>
                        <p className={styles.subtitle}>Chọn cấp độ JLPT để bắt đầu ôn luyện</p>
                    </div>
                </div>

                <div className={styles.levelGrid}>
                    {JLPT_LEVELS.map((level) => (
                        <Link
                            key={level}
                            href={`/study/vocabulary/${level.toLowerCase()}`}
                            className={styles.levelCard}
                            data-level={level}
                        >
                            <span className={styles.levelBadge}>{level}</span>
                            <p className={styles.levelDesc}>{LEVEL_DESC[level]}</p>
                            <div className={styles.levelMeta}>
                                <span className={styles.wordCount}>
                                    {counts.vocab[level].toLocaleString("vi-VN")} từ
                                </span>
                                <span className={styles.startLabel}>Học ngay →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    )
}
