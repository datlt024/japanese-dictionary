import type { Metadata } from "next"
import Link from "next/link"
import { FileText } from "lucide-react"

import AppLayout from "@/shared/components/layout/AppLayout"
import { getAllStudyCounts } from "@/server/services/study/jlpt-study.service"
import type { JlptLevel } from "@/server/services/study/jlpt-study.service"
import styles from "./page.module.css"

export const revalidate = 86400

export const metadata: Metadata = {
    title: "Ngữ pháp",
    description: "Học ngữ pháp tiếng Nhật theo cấp độ JLPT từ N5 đến N1 với giải thích bằng tiếng Việt.",
}

const JLPT_LEVELS: JlptLevel[] = ["N5", "N4", "N3", "N2", "N1"]

const LEVEL_DESC: Record<JlptLevel, string> = {
    N5: "Cấu trúc câu cơ bản, phù hợp người mới bắt đầu",
    N4: "Ngữ pháp nền tảng, dùng trong giao tiếp hàng ngày",
    N3: "Ngữ pháp trung cấp, cần thiết để đọc hiểu văn bản đơn giản",
    N2: "Ngữ pháp nâng cao, phổ biến trong văn viết và báo chí",
    N1: "Ngữ pháp chuyên sâu, phức tạp và đặc thù của văn viết",
}

export default async function GrammarBrowsePage() {
    const counts = await getAllStudyCounts()

    return (
        <AppLayout title="Ngữ pháp" hideSearchTabs>
            <div className={styles.page}>
                <div className={styles.header}>
                    <div className={styles.headerIcon}>
                        <FileText size={22} />
                    </div>
                    <div>
                        <h1 className={styles.title}>Ngữ pháp tiếng Nhật</h1>
                        <p className={styles.subtitle}>Chọn cấp độ JLPT để học ngữ pháp có giải thích bằng tiếng Việt</p>
                    </div>
                </div>

                <div className={styles.levelGrid}>
                    {JLPT_LEVELS.map((level) => (
                        <Link
                            key={level}
                            href={`/study/grammar/${level.toLowerCase()}`}
                            className={styles.levelCard}
                            data-level={level}
                        >
                            <span className={styles.levelBadge}>{level}</span>
                            <p className={styles.levelDesc}>{LEVEL_DESC[level]}</p>
                            <div className={styles.levelMeta}>
                                <span className={styles.wordCount}>
                                    {counts.grammar[level].toLocaleString("vi-VN")} mẫu câu
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
