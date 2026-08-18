import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import type { ExamConfig } from "./exam-types"
import styles from "./MockExamClient.module.css"

interface Props {
    cfg: ExamConfig
    startListening: () => void
    goToSummary: () => void
}

export default function ExamBreakScreen({ cfg, startListening, goToSummary }: Props) {
    const listeningCount = cfg.infoRows.find(r => r.title === "聴解")?.count ?? 0
    const listeningMin   = cfg.sections.find(s => s.id === "listening")?.allocMin ?? 0

    if (cfg.listeningAudio) {
        return (
            <div className={styles.introWrap}>
                <Link href="/study?tab=thi-thu" className={styles.backBtn}>
                    <ArrowLeft size={14} /> Danh sách đề thi
                </Link>

                <div className={styles.breakCard}>
                    <div className={styles.breakIcon}>👂</div>
                    <h2 className={styles.breakTitle}>Phần Ngôn ngữ hoàn thành</h2>
                    <p className={styles.breakDesc}>
                        Tiếp theo là phần <strong>聴解 (Nghe hiểu)</strong> với {listeningCount} câu hỏi, thời gian <strong>{listeningMin} phút</strong>.
                    </p>
                    <p className={styles.breakNote}>
                        Audio sẽ phát sau khi bạn bắt đầu. Bạn không thể tạm dừng hoặc tua lại — giống kỳ thi thật.
                    </p>
                    <button className={styles.btnStart} onClick={startListening}>
                        Bắt đầu phần Nghe <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.introWrap}>
            <Link href="/study?tab=thi-thu" className={styles.backBtn}>
                <ArrowLeft size={14} /> Danh sách đề thi
            </Link>

            <div className={styles.breakCard}>
                <div className={styles.breakIcon}>☕</div>
                <h2 className={styles.breakTitle}>Giải lao</h2>
                <p className={styles.breakDesc}>
                    Trong kỳ thi JLPT thực tế, đây là thời gian nghỉ giữa phần <strong>言語知識・読解</strong> và phần <strong>聴解</strong> (Nghe hiểu).
                </p>
                <p className={styles.breakNote}>
                    Bài thi thử này không bao gồm phần nghe. Nhấn <strong>Nộp bài</strong> khi bạn sẵn sàng để xem kết quả.
                </p>
                <button className={styles.btnStart} onClick={goToSummary}>
                    Nộp bài <ChevronRight size={16} />
                </button>
            </div>

            <p className={styles.introNote}>
                * Bài thi bao gồm phần <strong>Ngôn ngữ</strong> (từ vựng + ngữ pháp). Không có phần nghe và đọc hiểu.
            </p>
        </div>
    )
}
