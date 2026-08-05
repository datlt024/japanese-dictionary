"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import styles from "./page.module.css"

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
            { label: "Test 1",          questions: 55, duration: 90, href: "/study/exam/n5"            },
            { label: "Test 2 — Ngôn ngữ", questions: 43, duration: 60, href: "/study/exam/n5?year=2021"  },
            { label: "Test 2 — 聴解",     questions: 24, duration: 30, href: "/study/exam/n5?year=2021L" },
        ],
    },
    { level: "N4", desc: "Giao tiếp hằng ngày",           href: "/study/exam/n4", questions: 60, duration: 115 },
    { level: "N3", desc: "Hiểu văn bản thông thường",      href: "/study/exam/n3", questions: 74, duration: 140 },
    { level: "N2", desc: "Đọc hiểu văn bản phức tạp",      href: "/study/exam/n2", questions: 75, duration: 155 },
    { level: "N1", desc: "Tiếng Nhật trình độ cao cấp",    href: "/study/exam/n1", questions: 70, duration: 165 },
]

export default function ThiThuContent() {
    const [selected, setSelected] = useState<LevelConfig | null>(null)

    if (selected?.exams) {
        return (
            <>
                <button className={styles.examBackBtn} onClick={() => setSelected(null)}>
                    <ArrowLeft size={13} /> Chọn cấp độ
                </button>
                <p className={styles.sectionEyebrow}>
                    JLPT {selected.level} — Chọn đề thi
                </p>
                <div className={styles.examVariantGrid}>
                    {selected.exams.map(exam => (
                        <Link
                            key={exam.href}
                            href={exam.href}
                            className={styles.examVariantCard}
                            data-level={selected.level}
                        >
                            <span className={styles.examVariantLabel}>{exam.label}</span>
                            <div className={styles.examMeta}>
                                <span>{exam.questions} câu</span>
                                <span>{exam.duration} phút</span>
                            </div>
                            <span className={styles.examStart}>Bắt đầu →</span>
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
