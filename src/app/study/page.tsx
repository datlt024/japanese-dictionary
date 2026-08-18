import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, FileText, PenLine } from "lucide-react"

import AppLayout from "@/shared/components/layout/AppLayout"
import { getAllStudyCounts } from "@/server/services/study/jlpt-study.service"
import type { JlptLevel } from "@/server/services/study/jlpt-study.service"
import KanaTables from "@/features/dictionary/study/components/KanaTables/KanaTables"
import StudyTabsClient from "./StudyTabsClient"
import styles from "./page.module.css"

// Revalidate once per day — page is served from CDN, tab switching is client-side
export const revalidate = 86400

export const metadata: Metadata = {
    title: "Học tập | Yomi",
    description: "Ôn luyện từ vựng tiếng Nhật theo cấp độ JLPT với flashcard.",
}

const JLPT_LEVELS: JlptLevel[] = ["N1", "N2", "N3", "N4", "N5"]

// Server component — renders once per ISR cycle with pre-fetched counts
async function LibraryTabContent() {
    const counts = await getAllStudyCounts()

    return (
        <KanaTables>
            <p className={styles.sectionEyebrow}>Học theo cấp độ</p>

            <div className={styles.categoryGrid}>
                <div className={styles.categoryCard}>
                    <div className={styles.categoryHeader}>
                        <BookOpen size={15} />
                        <span>Từ vựng</span>
                    </div>
                    {JLPT_LEVELS.map((level) => (
                        <Link
                            key={level}
                            href={`/study/vocabulary/${level.toLowerCase()}`}
                            className={styles.levelRow}
                            data-level={level}
                        >
                            <span className={styles.levelTag}>{level}</span>
                            <span className={styles.levelRowCount}>
                                {counts.vocab[level].toLocaleString("vi-VN")} từ
                            </span>
                            <span className={styles.levelRowArrow}>→</span>
                        </Link>
                    ))}
                </div>

                <div className={styles.categoryCard}>
                    <div className={styles.categoryHeader}>
                        <FileText size={15} />
                        <span>Ngữ pháp</span>
                    </div>
                    {JLPT_LEVELS.map((level) => (
                        <Link
                            key={level}
                            href={`/study/grammar/${level.toLowerCase()}`}
                            className={styles.levelRow}
                            data-level={level}
                        >
                            <span className={styles.levelTag}>{level}</span>
                            <span className={styles.levelRowCount}>
                                {counts.grammar[level].toLocaleString("vi-VN")} mẫu
                            </span>
                            <span className={styles.levelRowArrow}>→</span>
                        </Link>
                    ))}
                </div>

                <div className={styles.categoryCard}>
                    <div className={styles.categoryHeader}>
                        <PenLine size={15} />
                        <span>Hán tự</span>
                    </div>
                    {JLPT_LEVELS.map((level) => (
                        <Link
                            key={level}
                            href={`/study/kanji/${level.toLowerCase()}`}
                            className={styles.levelRow}
                            data-level={level}
                        >
                            <span className={styles.levelTag}>{level}</span>
                            <span className={styles.levelRowCount}>
                                {counts.kanji[level].toLocaleString("vi-VN")} chữ
                            </span>
                            <span className={styles.levelRowArrow}>→</span>
                        </Link>
                    ))}
                </div>
            </div>
        </KanaTables>
    )
}

function TabSkeleton() {
    return (
        <div className={styles.tabBar} style={{ pointerEvents: "none" }}>
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className={styles.tabItem}>
                    <div className={styles.skeletonInline} style={{ width: 14, height: 14 }} />
                    <div className={styles.skeletonInline} style={{ width: 60, height: 14 }} />
                </div>
            ))}
        </div>
    )
}

export default async function StudyPage() {
    return (
        <AppLayout title="Học tập" hideSearch>
            <main className={styles.page}>
                {/*
                  * Suspense is required because StudyTabsClient uses useSearchParams().
                  * The library content is pre-rendered server-side and embedded in the
                  * RSC payload, so switching to that tab costs zero additional requests.
                  */}
                <Suspense fallback={<TabSkeleton />}>
                    <StudyTabsClient
                        libraryContent={<LibraryTabContent />}
                    />
                </Suspense>
            </main>
        </AppLayout>
    )
}
