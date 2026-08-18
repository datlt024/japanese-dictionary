import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import dynamic from "next/dynamic"
import { BookOpen, Compass, Library, ClipboardList, FileText, PenLine } from "lucide-react"

import AppLayout from "@/shared/components/layout/AppLayout"
import { getAllStudyCounts } from "@/server/services/study/jlpt-study.service"
import type { JlptLevel } from "@/server/services/study/jlpt-study.service"
import KanaTables from "@/features/dictionary/study/components/KanaTables/KanaTables"
import styles from "./page.module.css"

const StudyNotebooksTab = dynamic(
    () => import("@/features/dictionary/study/components/StudyNotebooksTab/StudyNotebooksTab")
)

const ExamContent = dynamic(() => import("./ExamContent"))

export const metadata: Metadata = {
    title: "Học tập | Yomi",
    description: "Ôn luyện từ vựng tiếng Nhật theo cấp độ JLPT với flashcard.",
}

const TABS = ["so-tay", "kham-pha", "thu-vien", "thi-thu"] as const
type StudyTab = (typeof TABS)[number]

const TAB_LIST: { id: StudyTab; label: string; Icon: React.FC<{ size?: number }> }[] = [
    { id: "so-tay",   label: "Sổ tay của tôi", Icon: BookOpen     },
    { id: "kham-pha", label: "Khám phá",        Icon: Compass      },
    { id: "thu-vien", label: "Thư viện",         Icon: Library      },
    { id: "thi-thu",  label: "Thi thử",          Icon: ClipboardList },
]

function normalizeTab(tab: string | undefined): StudyTab {
    if (tab && (TABS as readonly string[]).includes(tab)) return tab as StudyTab
    return "so-tay"
}

function TabBar({ active }: { active: StudyTab }) {
    return (
        <div className={styles.tabBar}>
            {TAB_LIST.map(({ id, label, Icon }) => (
                <Link
                    key={id}
                    href={`/study?tab=${id}`}
                    className={styles.tabItem}
                    data-active={active === id || undefined}
                >
                    <Icon size={15} />
                    <span>{label}</span>
                </Link>
            ))}
        </div>
    )
}

const JLPT_LEVELS: JlptLevel[] = ["N1", "N2", "N3", "N4", "N5"]

async function StudyByLevelSection() {
    const counts = await getAllStudyCounts()

    return (
        <>
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
        </>
    )
}

function StudyByLevelSkeleton() {
    return (
        <>
            <p className={styles.sectionEyebrow}>Học theo cấp độ</p>
            <div className={styles.categoryGrid}>
                {[0, 1, 2].map((i) => (
                    <div key={i} className={styles.categoryCard}>
                        <div className={styles.categoryHeader}>
                            <div className={styles.skeletonInline} style={{ width: 80, height: 14 }} />
                        </div>
                        {[0, 1, 2, 3, 4].map((j) => (
                            <div key={j} className={styles.levelRow} style={{ pointerEvents: "none" }}>
                                <div className={styles.skeletonInline} style={{ width: 28, height: 18 }} />
                                <div className={styles.skeletonInline} style={{ width: 60, height: 14, marginLeft: "auto" }} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    )
}

function ComingSoon({ label }: { label: string }) {
    return (
        <div className={styles.comingSoon}>
            <span className={styles.comingSoonIcon}>🚧</span>
            <p className={styles.comingSoonTitle}>{label} đang được phát triển</p>
            <p className={styles.comingSoonDesc}>Tính năng này sẽ sớm ra mắt. Hãy theo dõi nhé!</p>
        </div>
    )
}

type Props = { searchParams: Promise<{ tab?: string }> }

export default async function StudyPage({ searchParams }: Props) {
    const { tab: tabParam } = await searchParams
    const tab = normalizeTab(tabParam)

    return (
        <AppLayout title="Học tập" hideSearch>
            <main className={styles.page}>
                <TabBar active={tab} />

                <div className={styles.tabContent}>
                    {tab === "so-tay"   && <StudyNotebooksTab />}
                    {tab === "kham-pha" && <ComingSoon label="Khám phá" />}
                    {tab === "thu-vien" && (
                        <KanaTables>
                            <Suspense fallback={<StudyByLevelSkeleton />}>
                                <StudyByLevelSection />
                            </Suspense>
                        </KanaTables>
                    )}
                    {tab === "thi-thu"  && <ExamContent />}
                </div>
            </main>
        </AppLayout>
    )
}
