"use client"

import { ArrowLeft } from "lucide-react"
import { NOTEBOOK_ITEM_TYPE_LABELS } from "@/shared/constants/search-tabs"
import styles from "./PracticeClient.module.css"

export function PracticeHeader({
    onBack,
    index,
    total,
    extra,
}: {
    onBack: () => void
    index: number
    total: number
    extra?: React.ReactNode
}) {
    return (
        <div className={styles.practiceHeader}>
            <button type="button" className={styles.backBtn} onClick={onBack}>
                <ArrowLeft size={16} />
                Đổi chế độ
            </button>
            <div className={styles.practiceHeaderRight}>
                {extra}
                <span className={styles.progressText}>
                    {index + 1} / {total}
                </span>
            </div>
        </div>
    )
}

export function ProgressBar({ index, total }: { index: number; total: number }) {
    return (
        <div className={styles.progressBar}>
            <div
                className={styles.progressFill}
                style={{ width: `${((index + 1) / total) * 100}%` }}
            />
        </div>
    )
}

export function TypeBadge({ type }: { type: string }) {
    return (
        <span className={`${styles.typeBadge} ${styles[type]}`}>
            {NOTEBOOK_ITEM_TYPE_LABELS[type]}
        </span>
    )
}
