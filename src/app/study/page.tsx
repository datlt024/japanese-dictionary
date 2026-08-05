import type { Metadata } from "next"
import Link from "next/link"
import dynamic from "next/dynamic"
import { BookOpen, Compass, Library, ClipboardList, FileText, PenLine } from "lucide-react"

import AppLayout from "@/shared/components/layout/AppLayout"
import {
    getAllStudyCounts,
    getJlptVocabItems,
    getJlptGrammarItems,
    getJlptKanjiItems,
} from "@/server/services/study/jlpt-study.service"
import type { JlptLevel } from "@/server/services/study/jlpt-study.service"
import styles from "./page.module.css"

const StudyNotebooksTab = dynamic(
    () => import("@/features/dictionary/study/components/StudyNotebooksTab/StudyNotebooksTab")
)

import KanaTables from "@/features/dictionary/study/components/KanaTables/KanaTables"

export const metadata: Metadata = {
    title: "Học tập | Yomi",
    description: "Ôn luyện từ vựng tiếng Nhật theo cấp độ JLPT với flashcard.",
}

const TABS = ["so-tay", "kham-pha", "thu-vien", "thi-thu"] as const
type StudyTab = (typeof TABS)[number]

const TAB_LIST: { id: StudyTab; label: string; Icon: React.FC<{ size?: number }> }[] = [
    { id: "so-tay",    label: "Sổ tay của tôi", Icon: BookOpen },
    { id: "kham-pha",  label: "Khám phá",        Icon: Compass },
    { id: "thu-vien",  label: "Thư viện",         Icon: Library },
    { id: "thi-thu",   label: "Thi thử",          Icon: ClipboardList },
]

function normalizeTab(tab: string | undefined): StudyTab {
    if (tab && (TABS as readonly string[]).includes(tab)) return tab as StudyTab
    return "so-tay"
}

function StudyTabBar({ active }: { active: StudyTab }) {
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

const LEVELS: JlptLevel[] = ["N1", "N2", "N3", "N4", "N5"]

async function KhamPhaContent() {
    const counts = await getAllStudyCounts()

    // Fire-and-forget: warm page-1 caches for all levels while the user reads the library.
    for (const level of LEVELS) {
        getJlptVocabItems(level as JlptLevel, 0, 49).catch(() => {})
        getJlptGrammarItems(level, 0, 49).catch(() => {})
        getJlptKanjiItems(level, 0, 99).catch(() => {})
    }

    return (
        <>
            <p className={styles.sectionEyebrow}>Học theo cấp độ</p>

            <div className={styles.categoryGrid}>
                <div className={styles.categoryCard}>
                    <div className={styles.categoryHeader}>
                        <BookOpen size={15} />
                        <span>Từ vựng</span>
                    </div>
                    {LEVELS.map((level) => (
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
                    {LEVELS.map((level) => (
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
                    {LEVELS.map((level) => (
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

function ComingSoonContent({ label }: { label: string }) {
    return (
        <div className={styles.comingSoon}>
            <span className={styles.comingSoonIcon}>🚧</span>
            <p className={styles.comingSoonTitle}>{label} đang được phát triển</p>
            <p className={styles.comingSoonDesc}>Tính năng này sẽ sớm ra mắt. Hãy theo dõi nhé!</p>
        </div>
    )
}

const EXAM_CONFIGS = [
    { level: "N5", year: "2021", label: "N5 — 2021年12月", desc: "Đề thi thật tháng 12/2021", questions: 43, duration: 60  },
    { level: "N5", label: "N5",                             desc: "Từ vựng và ngữ pháp cơ bản",   questions: 55, duration: 90  },
    { level: "N4", label: "N4",                             desc: "Giao tiếp hằng ngày",            questions: 60, duration: 115 },
    { level: "N3", label: "N3",                             desc: "Hiểu văn bản thông thường",      questions: 74, duration: 140 },
    { level: "N2", label: "N2",                             desc: "Đọc hiểu văn bản phức tạp",      questions: 75, duration: 155 },
    { level: "N1", label: "N1",                             desc: "Tiếng Nhật trình độ cao cấp",    questions: 70, duration: 165 },
]

function ThiThuContent() {
    return (
        <>
            <p className={styles.sectionEyebrow}>Chọn cấp độ</p>
            <div className={styles.examGrid}>
                {EXAM_CONFIGS.map(({ level, year, label, desc, questions, duration }) => (
                    <Link
                        key={year ? `${level}-${year}` : level}
                        href={year ? `/study/exam/${level.toLowerCase()}?year=${year}` : `/study/exam/${level.toLowerCase()}`}
                        className={styles.examCard}
                        data-level={level}
                    >
                        <span className={styles.examLevel}>{label}</span>
                        <p className={styles.examDesc}>{desc}</p>
                        <div className={styles.examMeta}>
                            <span>{questions} câu</span>
                            <span>{duration} phút</span>
                        </div>
                        <span className={styles.examStart}>Bắt đầu →</span>
                    </Link>
                ))}
            </div>
        </>
    )
}

type Props = { searchParams: Promise<{ tab?: string }> }

export default async function StudyPage({ searchParams }: Props) {
    const { tab: tabParam } = await searchParams
    const tab = normalizeTab(tabParam)

    return (
        <AppLayout title="Học tập" hideSearch>
            <main className={styles.page}>
                <StudyTabBar active={tab} />

                <div className={styles.tabContent}>
                    {tab === "so-tay"   && <StudyNotebooksTab />}
                    {tab === "kham-pha" && <ComingSoonContent label="Khám phá" />}
                    {tab === "thu-vien" && (
                        <KanaTables>
                            <KhamPhaContent />
                        </KanaTables>
                    )}
                    {tab === "thi-thu"  && <ThiThuContent />}
                </div>
            </main>
        </AppLayout>
    )
}
