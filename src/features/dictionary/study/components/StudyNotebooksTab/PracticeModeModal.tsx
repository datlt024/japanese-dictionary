import { useEffect } from "react"
import { CreditCard, HelpCircle, PenLine, ClipboardList, X } from "lucide-react"
import styles from "./StudyNotebooksTab.module.css"

const PRACTICE_MODES = [
    { id: "flashcard", Icon: CreditCard,    title: "FlashCard",    desc: "Ôn tập từ vựng bằng thẻ lật",             color: "#2563eb", bg: "#eff6ff" },
    { id: "quiz",      Icon: HelpCircle,    title: "Trắc nghiệm",  desc: "Chọn đáp án đúng trong 4 lựa chọn",       color: "#7c3aed", bg: "#f5f3ff" },
    { id: "writing",   Icon: PenLine,       title: "Luyện viết",   desc: "Nhìn nghĩa, gõ lại từ tiếng Nhật",        color: "#0891b2", bg: "#ecfeff" },
    { id: "minitest",  Icon: ClipboardList, title: "Mini Test",    desc: "Bài kiểm tra ngắn có tính giờ",           color: "#b45309", bg: "#fffbeb" },
]

interface Props {
    open: boolean
    onClose: () => void
    onSelect: (mode: string) => void
}

export default function PracticeModeModal({ open, onClose, onSelect }: Props) {
    useEffect(() => {
        if (!open) return
        function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open, onClose])

    if (!open) return null

    return (
        <div className={styles.modalOverlay} onClick={onClose} role="presentation">
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Chọn chế độ ôn tập">
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Chọn chế độ ôn tập</h2>
                    <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Đóng"><X size={18} /></button>
                </div>
                <div className={styles.modalGrid}>
                    {PRACTICE_MODES.map(({ id, Icon, title, desc, color, bg }) => (
                        <button key={id} type="button" className={styles.modalModeCard} onClick={() => onSelect(id)}>
                            <div className={styles.modalModeIcon} style={{ background: bg }}>
                                <Icon size={20} color={color} />
                            </div>
                            <div className={styles.modalModeContent}>
                                <div className={styles.modalModeTitle}>{title}</div>
                                <div className={styles.modalModeDesc}>{desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
