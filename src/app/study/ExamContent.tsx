"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import styles from "./page.module.css"
import {
    N5_EXAM_COUNTS,
    N5_2021_COUNTS,
    N5_2024_COUNTS,
    N4_2021_COUNTS,
    N3_7_2021_COUNTS,
    N3_12_2021_COUNTS,
    N3_7_2022_COUNTS,
    N3_12_2022_COUNTS,
    N3_7_2023_COUNTS,
    N3_12_2023_COUNTS,
} from "@/features/dictionary/study/data/exam-counts"

type ExamVariant = {
    label: string
    questions: number
    duration: number
    href: string
}

type LevelConfig = {
    level: string
    desc: string
    exams?: ExamVariant[]
    href?: string
    questions?: number
    duration?: number
}

const LEVELS: LevelConfig[] = [
    {
        level: "N5",
        desc: "Từ vựng và ngữ pháp cơ bản",
        exams: [
            { label: "Test 1", questions: N5_EXAM_COUNTS.total,   duration: 90, href: "/study/exam/n5"           },
            { label: "Test 2", questions: N5_2021_COUNTS.total, duration: 90, href: "/study/exam/n5?year=2021" },
            { label: "Test 3", questions: N5_2024_COUNTS.total, duration: 90, href: "/study/exam/n5?year=2024" },
        ],
    },
    { level: "N4", desc: "Giao tiếp hằng ngày",          href: "/study/exam/n4", questions: N4_2021_COUNTS.total, duration: 115 },
    {
        level: "N3",
        desc: "Hiểu văn bản thông thường",
        exams: [
            { label: "T7-2021",  questions: N3_7_2021_COUNTS.total,  duration: 140, href: "/study/exam/n3?year=7-2021"  },
            { label: "T12-2021", questions: N3_12_2021_COUNTS.total, duration: 140, href: "/study/exam/n3?year=12-2021" },
            { label: "T7-2022",  questions: N3_7_2022_COUNTS.total,  duration: 140, href: "/study/exam/n3?year=7-2022"  },
            { label: "T12-2022", questions: N3_12_2022_COUNTS.total, duration: 140, href: "/study/exam/n3?year=12-2022" },
            { label: "T7-2023",  questions: N3_7_2023_COUNTS.total,  duration: 140, href: "/study/exam/n3?year=7-2023"  },
            { label: "T12-2023", questions: N3_12_2023_COUNTS.total, duration: 140, href: "/study/exam/n3?year=12-2023" },
        ],
    },
    { level: "N2", desc: "Đọc hiểu văn bản phức tạp",    href: "/study/exam/n2", questions: 75, duration: 155 },
    { level: "N1", desc: "Tiếng Nhật trình độ cao cấp",  href: "/study/exam/n1", questions: 70, duration: 165 },
]

export default function ExamContent() {
    const [selected, setSelected] = useState<LevelConfig | null>(null)

    if (selected?.exams) {
        return (
            <>
                <button className={styles.examBackBtn} onClick={() => setSelected(null)}>
                    <ArrowLeft size={13} /> Chọn cấp độ
                </button>
                <div className={styles.examVariantHeader}>
                    <div className={styles.examVariantHeaderLeft}>
                        <span
                            className={styles.examVariantHeaderLevel}
                            data-level={selected.level}
                        >
                            JLPT {selected.level}
                        </span>
                        <p className={styles.examVariantHeaderDesc}>{selected.desc}</p>
                    </div>
                    <span className={styles.examVariantHeaderBadge}>
                        {selected.exams.length} đề thi
                    </span>
                </div>
                <div className={styles.examVariantGrid}>
                    {selected.exams.map(exam => (
                        <Link
                            key={exam.href}
                            href={exam.href}
                            className={styles.examVariantCard}
                            data-level={selected.level}
                        >
                            <div className={styles.examVariantCardBody}>
                                <span className={styles.examVariantLabel}>{exam.label}</span>
                                <div className={styles.examMeta}>
                                    <span>{exam.questions} câu</span>
                                    <span>·</span>
                                    <span>{exam.duration} phút</span>
                                </div>
                            </div>
                            <div className={styles.examVariantCardFooter}>
                                <div className={styles.examMeta}>
                                    <span>Thi thử</span>
                                </div>
                                <span className={styles.examVariantStart}>
                                    Bắt đầu <ArrowRight size={12} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </>
        )
    }

    return (
        <>
            <p className={styles.sectionEyebrow}>Chọn cấp độ</p>
            <div className={styles.examGrid}>
                {LEVELS.map(cfg => {
                    if (cfg.exams) {
                        return (
                            <button
                                key={cfg.level}
                                className={styles.examCard}
                                data-level={cfg.level}
                                onClick={() => setSelected(cfg)}
                            >
                                <span className={styles.examLevel}>{cfg.level}</span>
                                <p className={styles.examDesc}>{cfg.desc}</p>
                                <div className={styles.examMeta}>
                                    <span>{cfg.exams.length} đề thi</span>
                                </div>
                                <span className={styles.examStart}>Xem đề →</span>
                            </button>
                        )
                    }
                    return (
                        <Link
                            key={cfg.level}
                            href={cfg.href!}
                            className={styles.examCard}
                            data-level={cfg.level}
                        >
                            <span className={styles.examLevel}>{cfg.level}</span>
                            <p className={styles.examDesc}>{cfg.desc}</p>
                            <div className={styles.examMeta}>
                                <span>{cfg.questions} câu</span>
                                <span>{cfg.duration} phút</span>
                            </div>
                            <span className={styles.examStart}>Bắt đầu →</span>
                        </Link>
                    )
                })}
            </div>
        </>
    )
}
