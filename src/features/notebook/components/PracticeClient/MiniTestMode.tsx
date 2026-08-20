"use client"

import { useMemo, useRef, useEffect, useLayoutEffect, useState } from "react"
import { Timer } from "lucide-react"
import { Button, Typography } from "antd"
import type { ModeProps } from "./practice.types"
import { MINI_TEST_TIME, MINI_TEST_COUNT } from "./practice.constants"
import { shuffle, getAnswerText, formatTime } from "./practice.utils"
import { PracticeHeader, ProgressBar, TypeBadge } from "./PracticeShared"
import styles from "./PracticeClient.module.css"

const { Text } = Typography

export default function MiniTestMode({ items, onFinish, onBack }: ModeProps) {
    const questions = useMemo(() => shuffle(items).slice(0, MINI_TEST_COUNT), [items])
    const [index, setIndex] = useState(0)
    const [selected, setSelected] = useState<string | null>(null)
    const [known, setKnown] = useState<string[]>([])
    const [unknown, setUnknown] = useState<string[]>([])
    const [timeLeft, setTimeLeft] = useState(MINI_TEST_TIME)

    const finishedRef = useRef(false)
    const knownRef = useRef<string[]>([])
    const unknownRef = useRef<string[]>([])
    const indexRef = useRef(0)
    const questionsRef = useRef(questions)
    const timeLeftRef = useRef(MINI_TEST_TIME)
    const onFinishRef = useRef(onFinish)
    const selectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    useLayoutEffect(() => { onFinishRef.current = onFinish })

    useEffect(() => { knownRef.current = known }, [known])
    useEffect(() => { unknownRef.current = unknown }, [unknown])
    useEffect(() => { indexRef.current = index }, [index])

    useEffect(() => {
        return () => { if (selectTimerRef.current) clearTimeout(selectTimerRef.current) }
    }, [])

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((t) => {
                const next = t - 1
                timeLeftRef.current = next
                if (next <= 0 && !finishedRef.current) {
                    clearInterval(timer)
                    finishedRef.current = true
                    const remaining = questionsRef.current
                        .slice(indexRef.current)
                        .map((q) => q.id)
                    onFinishRef.current(knownRef.current, [...unknownRef.current, ...remaining], MINI_TEST_TIME)
                    return 0
                }
                return next
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const current = questions[index]
    const correctAnswer = getAnswerText(current)

    const options = useMemo(() => {
        const wrongs = items
            .filter((i) => i.id !== current.id)
            .map((i) => getAnswerText(i))
            .filter(Boolean)
        return shuffle([correctAnswer, ...shuffle(wrongs).slice(0, 3)])
    }, [current, items, correctAnswer])

    function handleSelect(opt: string) {
        if (selected !== null || finishedRef.current) return
        setSelected(opt)
        const isKnown = opt === correctAnswer
        const newKnown = isKnown ? [...knownRef.current, current.id] : knownRef.current
        const newUnknown = isKnown ? unknownRef.current : [...unknownRef.current, current.id]

        if (selectTimerRef.current) clearTimeout(selectTimerRef.current)
        selectTimerRef.current = setTimeout(() => {
            if (index + 1 >= questions.length && !finishedRef.current) {
                finishedRef.current = true
                const timeTaken = MINI_TEST_TIME - timeLeftRef.current
                onFinishRef.current(newKnown, newUnknown, timeTaken)
            } else {
                setKnown(newKnown)
                setUnknown(newUnknown)
                setIndex((i) => i + 1)
                setSelected(null)
            }
        }, 800)
    }

    const timerWarning = timeLeft <= 60

    function getOptionStyle(opt: string): React.CSSProperties {
        if (selected === null) return {}
        if (opt === correctAnswer) return { background: "#ECFDF3", borderColor: "#16A34A", color: "#16A34A" }
        if (opt === selected) return { background: "#FEF2F2", borderColor: "#EF4444", color: "#EF4444" }
        return { opacity: 0.4 }
    }

    const timerEl = (
        <Text style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 13, fontWeight: 600,
            color: timerWarning ? "#EF4444" : "#6B7280",
            background: timerWarning ? "#FEF2F2" : "#F3F4F6",
            padding: "2px 10px", borderRadius: 999,
        }}>
            <Timer size={14} />
            {formatTime(timeLeft)}
        </Text>
    )

    return (
        <div className={styles.practiceContainer}>
            <PracticeHeader
                onBack={onBack}
                index={index}
                total={questions.length}
                extra={timerEl}
            />
            <ProgressBar index={index} total={questions.length} />

            <div className={styles.quizCard}>
                <TypeBadge type={current.item_type} />
                <div className={styles.cardTitle}>{current.display.title}</div>
                {current.display.subtitle && (
                    <div className={styles.cardSubtitle}>{current.display.subtitle}</div>
                )}
                <div className={styles.quizQuestion}>Nghĩa của từ này là gì?</div>
            </div>

            <div className={styles.optionsList}>
                {options.map((opt, i) => (
                    <Button
                        key={i}
                        block
                        size="large"
                        onClick={() => handleSelect(opt)}
                        style={{
                            textAlign: "left",
                            height: "auto",
                            padding: "12px 16px",
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            transition: "all 0.2s",
                            ...getOptionStyle(opt),
                        }}
                    >
                        <span style={{ fontWeight: 700, minWidth: 20, color: "#9CA3AF" }}>
                            {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                    </Button>
                ))}
            </div>
        </div>
    )
}
