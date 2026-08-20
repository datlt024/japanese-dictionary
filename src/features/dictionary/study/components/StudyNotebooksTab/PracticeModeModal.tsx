import { Button, Modal, Typography } from "antd"
import { CreditCard, HelpCircle, PenLine, ClipboardList } from "lucide-react"

const { Text } = Typography

const PRACTICE_MODES = [
    { id: "flashcard", Icon: CreditCard,    title: "FlashCard",    desc: "Ôn tập từ vựng bằng thẻ lật",       color: "var(--color-primary)",   bg: "var(--color-primary-soft)"   },
    { id: "quiz",      Icon: HelpCircle,    title: "Trắc nghiệm",  desc: "Chọn đáp án đúng trong 4 lựa chọn", color: "var(--color-jlpt-n3)",   bg: "var(--color-jlpt-n3-soft)"  },
    { id: "writing",   Icon: PenLine,       title: "Luyện viết",   desc: "Nhìn nghĩa, gõ lại từ tiếng Nhật",  color: "var(--color-jlpt-n4)",   bg: "var(--color-jlpt-n4-soft)"  },
    { id: "minitest",  Icon: ClipboardList, title: "Mini Test",    desc: "Bài kiểm tra ngắn có tính giờ",     color: "var(--color-jlpt-n2)",   bg: "var(--color-jlpt-n2-soft)"  },
]

interface Props {
    open: boolean
    onClose: () => void
    onSelect: (mode: string) => void
}

export default function PracticeModeModal({ open, onClose, onSelect }: Props) {
    return (
        <Modal
            open={open}
            onCancel={onClose}
            title="Chọn chế độ ôn tập"
            footer={null}
            width={480}
            centered
            destroyOnHidden
        >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "8px 0" }}>
                {PRACTICE_MODES.map(({ id, Icon, title, desc, color, bg }) => (
                    <Button
                        key={id}
                        type="default"
                        onClick={() => onSelect(id)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            height: "auto",
                            padding: "14px 16px",
                            borderColor: "#E5EAF2",
                            borderRadius: 10,
                            background: "#fff",
                            textAlign: "left",
                            transition: "border-color 0.15s, box-shadow 0.15s",
                        }}
                    >
                        <div style={{
                            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: bg,
                        }}>
                            <Icon size={18} color={color} />
                        </div>
                        <div>
                            <Text strong style={{ fontSize: 13, display: "block" }}>{title}</Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>{desc}</Text>
                        </div>
                    </Button>
                ))}
            </div>
        </Modal>
    )
}
