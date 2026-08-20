import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import type { ExamConfig } from "./exam-types"
import styles from "./MockExamClient.module.css"

interface Props {
    level: string
    cfg: ExamConfig
    startExam: () => void
}

export default function ExamInfoScreen({ level, cfg, startExam }: Props) {
    const durationMin  = Math.round(cfg.duration / 60)
    const languageMin  = cfg.sections.filter(s => s.id !== "listening").reduce((sum, s) => sum + s.allocMin, 0)
    const listeningMin = cfg.sections.find(s => s.id === "listening")?.allocMin ?? 0

    return (
        <div className={styles.introWrap}>
            <Link href="/study?tab=thi-thu" className={styles.backBtn}>
                <ArrowLeft size={14} /> Danh sách đề thi
            </Link>

            <div className={styles.infoCard}>
                <div className={styles.infoHeader}>
                    <h2 className={styles.infoTitle}>Đề thi thử JLPT</h2>
                    <span className={styles.introBadge} data-level={level}>{level}</span>
                </div>
                {cfg.subtitle && (
                    <p className={styles.infoSubtitle}>{cfg.subtitle}</p>
                )}

                <div className={styles.infoMeta}>
                    <span className={styles.infoMetaLabel}>Trình độ đề thi</span>
                    <span className={styles.infoMetaVal} data-level={level}>{level}</span>
                </div>

                <table className={styles.infoTable}>
                    <thead>
                        <tr>
                            <th>Nội dung</th>
                            <th>Số câu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cfg.infoRows.map(row => (
                            <tr key={row.title} data-skipped={row.skipped || undefined}>
                                <td>{row.title}</td>
                                <td>{row.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className={styles.infoStats}>
                    <div className={styles.infoStat}>
                        <span className={styles.infoStatLabel}>Thời gian làm bài</span>
                        <span className={styles.infoStatVal} data-accent>{durationMin} Phút</span>
                    </div>
                    <div className={styles.infoStat}>
                        <span className={styles.infoStatLabel}>Điểm đạt</span>
                        <span className={styles.infoStatVal} data-pass>{cfg.passingDisplay} điểm</span>
                    </div>
                </div>

                <button className={styles.btnStart} onClick={startExam}>
                    Bắt đầu <ChevronRight size={16} />
                </button>

                {cfg.listeningAudio ? (
                    <p className={styles.infoNote}>
                        * Đề thi gồm 2 giai đoạn: <strong>Ngôn ngữ</strong> ({languageMin} phút) → <strong>Nghe hiểu</strong> ({listeningMin} phút). Audio sẽ phát sau khi bắt đầu phần nghe.
                    </p>
                ) : (
                    <p className={styles.infoNote}>
                        * Đề thi thử bao gồm phần <strong>Ngôn ngữ</strong> (từ vựng + ngữ pháp). Không bao gồm phần 聴解.
                    </p>
                )}
            </div>
        </div>
    )
}
