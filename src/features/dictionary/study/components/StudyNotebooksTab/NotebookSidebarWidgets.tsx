"use client"

import { BookOpen } from "lucide-react"
import { useStreak, WEEK_DAYS } from "@/shared/hooks/useStreak"
import styles from "./StudyNotebooksTab.module.css"

interface Props {
    userId: string | null
    dueCount: number
    firstNotebookId: string | null
    onStartPractice: () => void
    onViewFirst: () => void
}

export default function NotebookSidebarWidgets({ userId, dueCount, firstNotebookId, onStartPractice, onViewFirst }: Props) {
    const streak = useStreak(userId)

    return (
        <aside className={styles.sideCol}>
            {/* Ôn tập hôm nay */}
            <div className={styles.widget}>
                <div className={styles.widgetTitleRow}>
                    <span className={styles.widgetEmoji}>📅</span>
                    <h3 className={styles.widgetTitle}>Ôn tập hôm nay</h3>
                </div>
                <div className={styles.widgetBigNum}>{dueCount}</div>
                <p className={styles.widgetSub}>từ cần ôn</p>
                <button
                    type="button"
                    className={styles.widgetBtn}
                    onClick={onStartPractice}
                    disabled={!firstNotebookId}
                >
                    <BookOpen size={14} />
                    Bắt đầu ôn tập
                </button>
                {firstNotebookId && (
                    <button type="button" className={styles.widgetLink} onClick={onViewFirst}>
                        Xem chi tiết →
                    </button>
                )}
            </div>

            {/* Chuỗi học */}
            <div className={styles.widget}>
                <div className={styles.widgetTitleRow}>
                    <span className={styles.widgetEmoji}>🔥</span>
                    <h3 className={styles.widgetTitle}>Chuỗi học của bạn</h3>
                </div>
                <div className={styles.widgetBigNum}>
                    {streak.count > 0 ? `${streak.count} ngày` : "—"}
                </div>
                <p className={styles.widgetSub}>
                    {streak.count > 0
                        ? "Tuyệt vời! Tiếp tục duy trì nhé."
                        : "Đăng nhập mỗi ngày để tăng chuỗi học!"}
                </p>
                <div className={styles.streakDays}>
                    {WEEK_DAYS.map((day, i) => (
                        <div key={day} className={styles.streakDayCol}>
                            <span className={styles.streakFire} style={{ opacity: streak.activeDays.includes(i) ? 1 : 0.18 }}>
                                🔥
                            </span>
                            <span className={styles.streakDayLabel}>{day}</span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    )
}
