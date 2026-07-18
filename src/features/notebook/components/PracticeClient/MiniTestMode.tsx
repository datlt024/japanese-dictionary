"use client"

import { useMemo, useRef, useEffect, useState } from "react"
import { Timer } from "lucide-react"
import type { ModeProps } from "./practice.types"
import { MINI_TEST_TIME, MINI_TEST_COUNT } from "./practice.constants"
import { shuffle, getAnswerText, formatTime } from "./practice.utils"
import { PracticeHeader, ProgressBar, TypeBadge } from "./PracticeShared"
import styles from "./PracticeClient.module.css"

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

    useEffect(() => { knownRef.current = known }, [known])
    useEffect(() => { unknownRef.current = unknown }, [unknown])
    useEffect(() => { indexRef.current = index }, [index])

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
                    onFinish(knownRef.current, [...unknownRef.current, ...remaining], MINI_TEST_TIME)
                    return 0
                }
                return next
            })
        }, 1000)
        return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        setTimeout(() => {
            if (index + 1 >= questions.length && !finishedRef.current) {
                finishedRef.current = true
                const timeTaken = MINI_TEST_TIME - timeLeftRef.current
                onFinish(newKnown, newUnknown, timeTaken)
            } else {
                setKnown(newKnown)
                setUnknown(newUnknown)
                setIndex((i) => i + 1)
                setSelected(null)
            }
        }, 800)
    }

    const timerWarning = timeLeft <= 60

    return (
        <div className={styles.practiceContainer}>
            <PracticeHeader
                onBack={onBack}
                index={index}
                total={questions.length}
                extra={
                    <div className={`${styles.timer} ${timerWarning ? styles.timerWarning : ""}`}>
                        <Timer size={14} />
                        {formatTime(timeLeft)}
                    </div>
                }
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
                {options.map((opt, i) => {
                    let cls = styles.optionBtn
                    if (selected !== null) {
                        if (opt === correctAnswer) cls += ` ${styles.optionCorrect}`
                        else if (opt === selected) cls += ` ${styles.optionWrong}`
                        else cls += ` ${styles.optionDimmed}`
                    }
                    return (
                        <button key={i} type="button" className={cls} onClick={() => handleSelect(opt)}>
                            <span className={styles.optionLabel}>
                                {String.fromCharCode(65 + i)}
                            </span>
                            {opt}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
