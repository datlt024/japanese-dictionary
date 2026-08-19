import Link from "next/link"
import { ArrowLeft, RotateCcw } from "lucide-react"
import styles from "./MockExamClient.module.css"
import { formatTime } from "./exam-utils"
import type { ExamConfig } from "./exam-types"

interface SectionResults {
    vocabScore: number
    grammarScore: number
    listeningScore: number
    vocabCorrect: number
    grammarCorrect: number
    listeningCorrect: number
    vocabQsLen: number
    grammarQsLen: number
    listeningQsLen: number
    vocabPassed: boolean
    grammarPassed: boolean
    listeningPassed: boolean
    total: number
    totalCorrect: number
    totalQ: number
    passed: boolean
}

interface Props {
    level: string
    cfg: ExamConfig
    results: SectionResults
    languageTimeTaken: number
    timeTaken: number
    onRetry: () => void
    onShowReview: () => void
}

export default function ExamSummaryScreen({ level, cfg, results, languageTimeTaken, timeTaken, onRetry, onShowReview }: Props) {
    const {
        vocabScore, grammarScore, listeningScore,
        vocabCorrect, grammarCorrect, listeningCorrect,
        vocabQsLen, grammarQsLen, listeningQsLen,
        vocabPassed, grammarPassed, listeningPassed,
        total, totalCorrect, totalQ, passed,
    } = results

    const scoreMap   = [vocabScore,   grammarScore,   listeningScore]
    const correctMap = [vocabCorrect, grammarCorrect, listeningCorrect]
    const totalMap   = [vocabQsLen,   grammarQsLen,   listeningQsLen]
    const passedMap  = [vocabPassed,  grammarPassed,  listeningPassed]

    const maxScore = (vocabQsLen > 0 ? 60 : 0) + (grammarQsLen > 0 ? 60 : 0) + (listeningQsLen > 0 ? 60 : 0)
    const scoreLabel = listeningQsLen > 0 && vocabQsLen > 0
        ? "Tổng điểm"
        : listeningQsLen > 0
        ? "Điểm nghe hiểu"
        : "Điểm từ vựng + ngữ pháp"
    const totalTimeTaken = languageTimeTaken + timeTaken

    return (
        <div className={styles.summary}>
            <Link href="/study?tab=thi-thu" className={styles.backBtn}>
                <ArrowLeft size={14} /> Danh sách đề thi
            </Link>

            <div className={styles.scoreCard}>
                <div className={styles.scoreTop}>
                    <span className={styles.resultBadge} data-passed={String(passed)}>
                        {passed ? "ĐẠT" : "CHƯA ĐẠT"}
                    </span>
                    <span className={styles.levelBadge} data-level={level}>{level}</span>
                </div>
                <div className={styles.scoreMain}>
                    <span className={styles.scoreNum}>{total}</span>
                    <span className={styles.scoreMax}>/{maxScore}</span>
                </div>
                <p className={styles.scoreNote}>{scoreLabel} · Ngưỡng đạt {cfg.passingDisplay} điểm (mỗi phần ≥ {cfg.passing.secMin})</p>

                <div className={styles.sectionScores}>
                    {cfg.infoRows.map((row, rowIdx) => {
                        const skipped   = !!row.skipped
                        const testedIdx = cfg.infoRows.slice(0, rowIdx).filter(r => !r.skipped).length
                        const secId     = row.sectionId
                        const mapIdx    = secId === "listening" ? 2 : testedIdx
                        const rowScore   = skipped ? null : scoreMap[mapIdx]   ?? 0
                        const rowCorrect = skipped ? null : correctMap[mapIdx] ?? 0
                        const rowTotal   = skipped ? null : totalMap[mapIdx]   ?? 0
                        const rowPassed  = skipped ? null : passedMap[mapIdx]  ?? true
                        return (
                            <div key={row.title} className={styles.sectionScoreRow}
                                data-skipped={skipped || undefined}
                                data-passed={rowPassed !== null ? String(rowPassed) : undefined}>
                                <div className={styles.sectionScoreInfo}>
                                    <span className={styles.sectionScoreTitle}>{row.title}</span>
                                    {!skipped && rowCorrect !== null && (
                                        <span className={styles.sectionScoreDetail}>{rowCorrect}/{rowTotal} câu đúng</span>
                                    )}
                                    {rowPassed === false && <span className={styles.sectionFail}>Điểm liệt</span>}
                                </div>
                                <div className={styles.sectionScoreVal}>
                                    {skipped ? (
                                        <span className={styles.sectionScoreSkipped}>Không thi</span>
                                    ) : (
                                        <><span>{rowScore}</span><small>/60</small></>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className={styles.statsRow}>
                    <div className={styles.stat}>
                        <span className={styles.statV}>{totalCorrect}</span>
                        <span className={styles.statL}>Câu đúng</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statV} data-red>{totalQ - totalCorrect}</span>
                        <span className={styles.statL}>Câu sai</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statV}>{totalQ > 0 ? Math.round(totalCorrect / totalQ * 100) : 0}%</span>
                        <span className={styles.statL}>Chính xác</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statV}>{formatTime(totalTimeTaken)}</span>
                        <span className={styles.statL}>Thời gian</span>
                    </div>
                </div>

                <div className={styles.scoreActions}>
                    <button className={styles.btnPrimary} onClick={onRetry}>
                        <RotateCcw size={14} /> Thi lại
                    </button>
                    <button className={styles.btnReview} onClick={onShowReview}>
                        Xem đáp án
                    </button>
                    <Link href="/study?tab=thi-thu" className={styles.btnOutline}>Đề khác</Link>
                </div>
            </div>
        </div>
    )
}
