"use client"

import { useMemo, useRef, useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"
import type { ModeProps } from "./practice.types"
import { shuffle } from "./practice.utils"
import { PracticeHeader, ProgressBar, TypeBadge } from "./PracticeShared"
import styles from "./PracticeClient.module.css"

export default function WritingMode({ items, onFinish, onBack }: ModeProps) {
    const shuffled = useMemo(() => shuffle(items), [items])
    const [index, setIndex] = useState(0)
    const [input, setInput] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [isCorrect, setIsCorrect] = useState(false)
    const [known, setKnown] = useState<string[]>([])
    const [unknown, setUnknown] = useState<string[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

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
                <input
                    ref={inputRef}
                    className={`${styles.writingInput} ${
                        submitted
                            ? isCorrect
                                ? styles.writingInputCorrect
                                : styles.writingInputWrong
                            : ""
                    }`}
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
                    <div className={styles.writingFeedbackWrong}>
                        Đáp án đúng: <strong>{current.display.title}</strong>
                    </div>
                )}
                {submitted && isCorrect && (
                    <div className={styles.writingFeedbackCorrect}>Chính xác!</div>
                )}
            </div>

            <div className={styles.actions}>
                {!submitted ? (
                    <div className={styles.writingActions}>
                        <button type="button" className={styles.skipBtn} onClick={handleSkip}>
                            Bỏ qua
                        </button>
                        <button
                            type="button"
                            className={styles.submitBtn}
                            onClick={handleSubmit}
                            disabled={!input.trim()}
                        >
                            Kiểm tra
                        </button>
                    </div>
                ) : (
                    <button type="button" className={styles.nextBtn} onClick={() => advance()}>
                        {index + 1 >= shuffled.length ? "Xem kết quả" : "Tiếp theo"}
                        <ChevronRight size={16} />
                    </button>
                )}
            </div>
        </div>
    )
}
