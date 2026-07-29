import type { Metadata } from "next"
import Link from "next/link"
import dynamic from "next/dynamic"
import { BookOpen, Compass, Library, ClipboardList } from "lucide-react"

import AppLayout from "@/shared/components/layout/AppLayout"
import { getAllJlptCounts } from "@/server/services/study/jlpt-study.service"
import styles from "./page.module.css"

const StudyNotebooksTab = dynamic(
    () => import("@/features/dictionary/study/components/StudyNotebooksTab/StudyNotebooksTab")
)

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

const LEVEL_DESCRIPTIONS: Record<string, string> = {
    N5: "Cơ bản — giao tiếp đơn giản hằng ngày",
    N4: "Sơ cấp — hiểu hội thoại quen thuộc",
    N3: "Trung cấp — đọc hiểu văn bản thông dụng",
    N2: "Cao cấp — đọc báo, tài liệu chuyên ngành",
    N1: "Thành thạo — hiểu tiếng Nhật phức tạp",
}

async function KhamPhaContent() {
    const counts = await getAllJlptCounts()
    return (
        <>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Học theo cấp độ</h2>
                <p className={styles.sectionSubtitle}>
                    Chọn cấp độ JLPT để bắt đầu ôn luyện từ vựng bằng flashcard
                </p>
            </div>

            <div className={styles.levelGrid}>
                {(["N5", "N4", "N3", "N2", "N1"] as const).map((level) => (
                    <Link
                        key={level}
                        href={`/study/${level.toLowerCase()}`}
                        className={styles.levelCard}
                        data-level={level}
                    >
                        <div className={styles.levelBadge}>{level}</div>
                        <p className={styles.levelDesc}>{LEVEL_DESCRIPTIONS[level]}</p>
                        <div className={styles.levelMeta}>
                            <span className={styles.wordCount}>
                                {counts[level].toLocaleString("vi-VN")} từ
                            </span>
                            <span className={styles.startLabel}>Bắt đầu →</span>
                        </div>
                    </Link>
                ))}
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
                    {tab === "kham-pha" && <KhamPhaContent />}
                    {tab === "thu-vien" && <ComingSoonContent label="Thư viện" />}
                    {tab === "thi-thu"  && <ComingSoonContent label="Thi thử" />}
                </div>
            </main>
        </AppLayout>
    )
}
