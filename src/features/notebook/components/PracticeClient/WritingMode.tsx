"use client"

import { useMemo, useRef, useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"
import { Button, Input, Space, Typography } from "antd"
import type { InputRef } from "antd"
import type { ModeProps } from "./practice.types"
import { shuffle } from "./practice.utils"
import { PracticeHeader, ProgressBar, TypeBadge } from "./PracticeShared"
import styles from "./PracticeClient.module.css"

const { Text } = Typography

export default function WritingMode({ items, onFinish, onBack }: ModeProps) {
    const shuffled = useMemo(() => shuffle(items), [items])
    const [index, setIndex] = useState(0)
    const [input, setInput] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [isCorrect, setIsCorrect] = useState(false)
    const [known, setKnown] = useState<string[]>([])
    const [unknown, setUnknown] = useState<string[]>([])
    const inputRef = useRef<InputRef | null>(null)

    useEffect(() => {
        inputRef.current?.focus()
    }, [index])

    const current = shuffled[index]

    function handleSubmit() {
        if (!input.trim() || submitted) return
        const correct = input.trim() === current.display.title
        setIsCorrect(correct)
        setSubmitted(true)
        if (correct) setKnown((prev) => [...prev, current.id])
        else setUnknown((prev) => [...prev, current.id])
    }

    function advance(overrideUnknown?: string[]) {
        const k = known
        const u = overrideUnknown ?? unknown
        if (index + 1 >= shuffled.length) {
            onFinish(k, u)
        } else {
            setIndex((i) => i + 1)
            setInput("")
            setSubmitted(false)
            setIsCorrect(false)
        }
    }

    function handleSkip() {
        const newUnknown = [...unknown, current.id]
        setUnknown(newUnknown)
        advance(newUnknown)
    }

    const inputStatus = submitted ? (isCorrect ? undefined : "error") : undefined
    const inputStyle = submitted && isCorrect
        ? { borderColor: "#16A34A", background: "#ECFDF3" }
        : submitted && !isCorrect
        ? { background: "#FEF2F2" }
        : {}

    return (
        <div className={styles.practiceContainer}>
            <PracticeHeader onBack={onBack} index={index} total={shuffled.length} />
            <ProgressBar index={index} total={shuffled.length} />

            <div className={styles.writingCard}>
                <TypeBadge type={current.item_type} />
                {current.display.meaning && (
                    <div className={styles.writingMeaning}>{current.display.meaning}</div>
                )}
                {current.display.subtitle && (
                    <div className={styles.writingHint}>{current.display.subtitle}</div>
                )}
                <div className={styles.writingPrompt}>Gõ từ tiếng Nhật tương ứng</div>
            </div>

            <div className={styles.writingInputWrap}>
                <Input
                    ref={inputRef}
                    size="large"
                    status={inputStatus}
                    style={{ fontSize: 18, textAlign: "center", ...inputStyle }}
                    value={input}
                    onChange={(e) => !submitted && setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            if (!submitted) handleSubmit()
                            else advance()
                        }
                    }}
                    placeholder="Nhập từ tiếng Nhật..."
                    autoComplete="off"
                    autoCapitalize="none"
                    readOnly={submitted}
                />

                {submitted && !isCorrect && (
                    <Text style={{ display: "block", marginTop: 8, color: "#EF4444", textAlign: "center" }}>
                        Đáp án đúng: <strong>{current.display.title}</strong>
                    </Text>
                )}
                {submitted && isCorrect && (
                    <Text style={{ display: "block", marginTop: 8, color: "#16A34A", textAlign: "center", fontWeight: 600 }}>
                        Chính xác!
                    </Text>
                )}
            </div>

            <div className={styles.actions}>
                {!submitted ? (
                    <Space>
                        <Button onClick={handleSkip}>Bỏ qua</Button>
                        <Button type="primary" onClick={handleSubmit} disabled={!input.trim()}>
                            Kiểm tra
                        </Button>
                    </Space>
                ) : (
                    <Button type="primary" icon={<ChevronRight size={16} />} iconPosition="end" onClick={() => advance()}>
                        {index + 1 >= shuffled.length ? "Xem kết quả" : "Tiếp theo"}
                    </Button>
                )}
            </div>
        </div>
    )
}
