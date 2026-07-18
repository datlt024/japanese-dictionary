"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { RotateCcw, ClipboardList, BookOpen } from "lucide-react"
import type { EnrichedNotebookItem } from "@/domain/notebook/notebook.type"
import { NOTEBOOK_ITEM_TYPE_LABELS } from "@/shared/constants/search-tabs"
import type { PracticeMode, SummaryData } from "./practice.types"
import { MODE_LABEL } from "./practice.constants"
import { formatTime } from "./practice.utils"
import styles from "./PracticeClient.module.css"

async function savePracticeSession(
    notebookId: string,
    mode: PracticeMode,
    summary: SummaryData,
    totalItems: number
) {
    try {
        await fetch("/api/practice/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                notebook_id: notebookId,
                mode,
                known_ids: summary.known,
                unknown_ids: summary.unknown,
                total_items: totalItems,
                time_taken: summary.timeTaken ?? null,
            }),
        })
    } catch {
        // fire-and-forget, không block UI khi lưu thất bại
    }
}

export default function Summary({
    items,
    summary,
    mode,
    notebookId,
    onRestart,
    onChangeMode,
}: {
    items: EnrichedNotebookItem[]
    summary: SummaryData
    mode: PracticeMode
    notebookId: string
    onRestart: () => void
    onChangeMode: () => void
}) {
    const saved = useRef(false)

    useEffect(() => {
        if (saved.current) return
        saved.current = true
        savePracticeSession(notebookId, mode, summary, items.length)
    }, [notebookId, mode, summary, items.length])

    const total = summary.known.length + summary.unknown.length
    const percent = total > 0 ? Math.round((summary.known.length / total) * 100) : 0
    const unknownItems = items.filter((i) => summary.unknown.includes(i.id))

    return (
        <div className={styles.summaryContainer}>
            <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Kết quả · {MODE_LABEL[mode]}</h2>

                <div className={styles.scoreRow}>
                    <div className={styles.scoreBlock}>
                        <span className={styles.scoreNumber}>{summary.known.length}</span>
                        <span className={styles.scoreLabel}>Đúng</span>
                    </div>
                    <div className={styles.scoreDivider} />
                    <div className={styles.scoreBlock}>
                        <span className={`${styles.scoreNumber} ${styles.unknownScore}`}>
                            {summary.unknown.length}
                        </span>
                        <span className={styles.scoreLabel}>Sai</span>
                    </div>
                    <div className={styles.scoreDivider} />
                    <div className={styles.scoreBlock}>
                        <span className={`${styles.scoreNumber} ${styles.percentScore}`}>
                            {percent}%
                        </span>
                        <span className={styles.scoreLabel}>Chính xác</span>
                    </div>
                    {summary.timeTaken !== undefined && (
                        <>
                            <div className={styles.scoreDivider} />
                            <div className={styles.scoreBlock}>
                                <span className={`${styles.scoreNumber} ${styles.timeScore}`}>
                                    {formatTime(summary.timeTaken)}
                                </span>
                                <span className={styles.scoreLabel}>Thời gian</span>
                            </div>
                        </>
                    )}
                </div>

                {unknownItems.length > 0 && (
                    <div className={styles.unknownSection}>
                        <h3 className={styles.unknownTitle}>
                            Cần ôn lại ({unknownItems.length})
                        </h3>
                        <ul className={styles.unknownList}>
                            {unknownItems.map((item) => (
                                <li key={item.id}>
                                    <Link href={item.display.href} className={styles.unknownItem}>
                                        <span className={`${styles.typeBadgeSmall} ${styles[item.item_type]}`}>
                                            {NOTEBOOK_ITEM_TYPE_LABELS[item.item_type]}
                                        </span>
                                        <span className={styles.unknownItemTitle}>
                                            {item.display.title}
                                        </span>
                                        {item.display.meaning && (
                                            <span className={styles.unknownItemMeaning}>
                                                {item.display.meaning}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className={styles.summaryActions}>
                    <button type="button" className={styles.restartBtn} onClick={onRestart}>
                        <RotateCcw size={15} />
                        Luyện lại
                    </button>
                    <button type="button" className={styles.changeModeBtn} onClick={onChangeMode}>
                        <ClipboardList size={15} />
                        Đổi chế độ
                    </button>
                    <Link href="/notebooks" className={styles.backToNotebookBtn}>
                        <BookOpen size={15} />
                        Về sổ tay
                    </Link>
                </div>
            </div>
        </div>
    )
}
