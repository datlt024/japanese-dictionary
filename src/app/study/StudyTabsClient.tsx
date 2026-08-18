"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { BookOpen, Compass, Library, ClipboardList } from "lucide-react"
import styles from "./page.module.css"

const StudyNotebooksTab = dynamic(
    () => import("@/features/dictionary/study/components/StudyNotebooksTab/StudyNotebooksTab")
)

const ExamContent = dynamic(() => import("./ExamContent"))

const TABS = ["so-tay", "kham-pha", "thu-vien", "thi-thu"] as const
type StudyTab = (typeof TABS)[number]

const TAB_LIST: { id: StudyTab; label: string; Icon: React.FC<{ size?: number }> }[] = [
    { id: "so-tay",   label: "Sổ tay của tôi", Icon: BookOpen     },
    { id: "kham-pha", label: "Khám phá",        Icon: Compass      },
    { id: "thu-vien", label: "Thư viện",         Icon: Library      },
    { id: "thi-thu",  label: "Thi thử",          Icon: ClipboardList },
]

function normalizeTab(tab: string | null): StudyTab {
    if (tab && (TABS as readonly string[]).includes(tab)) return tab as StudyTab
    return "so-tay"
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

interface Props {
    libraryContent: React.ReactNode
}

export default function StudyTabsClient({ libraryContent }: Props) {
    const searchParams = useSearchParams()
    const tab = normalizeTab(searchParams.get("tab"))

    return (
        <>
            <div className={styles.tabBar}>
                {TAB_LIST.map(({ id, label, Icon }) => (
                    <Link
                        key={id}
                        href={`/study?tab=${id}`}
                        className={styles.tabItem}
                        data-active={tab === id || undefined}
                    >
                        <Icon size={15} />
                        <span>{label}</span>
                    </Link>
                ))}
            </div>

            <div className={styles.tabContent}>
                {tab === "so-tay"   && <StudyNotebooksTab />}
                {tab === "kham-pha" && <ComingSoon label="Khám phá" />}
                {tab === "thu-vien" && libraryContent}
                {tab === "thi-thu"  && <ExamContent />}
            </div>
        </>
    )
}
