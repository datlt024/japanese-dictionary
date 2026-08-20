"use client"

import { useMemo, useRef, useEffect, useLayoutEffect, useState } from "react"
import { Button } from "antd"
import type { ModeProps } from "./practice.types"
import { shuffle, getAnswerText } from "./practice.utils"
import { PracticeHeader, ProgressBar, TypeBadge } from "./PracticeShared"
import styles from "./PracticeClient.module.css"

export default function QuizMode({ items, onFinish, onBack }: ModeProps) {
    const shuffled = useMemo(() => shuffle(items), [items])
    const [index, setIndex] = useState(0)
    const [selected, setSelected] = useState<string | null>(null)
    const [known, setKnown] = useState<string[]>([])
    const [unknown, setUnknown] = useState<string[]>([])

    const knownRef = useRef<string[]>([])
    const unknownRef = useRef<string[]>([])
    const onFinishRef = useRef(onFinish)
    const selectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    useLayoutEffect(() => { onFinishRef.current = onFinish })
    useEffect(() => { knownRef.current = known }, [known])
    useEffect(() => { unknownRef.current = unknown }, [unknown])
    useEffect(() => () => { if (selectTimerRef.current) clearTimeout(selectTimerRef.current) }, [])

    const current = shuffled[index]
    const correctAnswer = getAnswerText(current)

    const options = useMemo(() => {
        const wrongs = shuffled
            .filter((i) => i.id !== current.id)
            .map((i) => getAnswerText(i))
            .filter(Boolean)
        return shuffle([correctAnswer, ...shuffle(wrongs).slice(0, 3)])
    }, [current, shuffled, correctAnswer])

    function handleSelect(opt: string) {
        if (selected !== null) return
        setSelected(opt)
        const isKnown = opt === correctAnswer
        const newKnown = isKnown ? [...knownRef.current, current.id] : knownRef.current
        const newUnknown = isKnown ? unknownRef.current : [...unknownRef.current, current.id]

        if (selectTimerRef.current) clearTimeout(selectTimerRef.current)
        selectTimerRef.current = setTimeout(() => {
            if (index + 1 >= shuffled.length) {
                onFinishRef.current(newKnown, newUnknown)
            } else {
                setKnown(newKnown)
                setUnknown(newUnknown)
                setIndex((i) => i + 1)
                setSelected(null)
            }
        }, 1000)
    }

    function getOptionStyle(opt: string): React.CSSProperties {
        if (selected === null) return {}
        if (opt === correctAnswer) return { background: "#ECFDF3", borderColor: "#16A34A", color: "#16A34A" }
        if (opt === selected) return { background: "#FEF2F2", borderColor: "#EF4444", color: "#EF4444" }
        return { opacity: 0.4 }
    }

    return (
        <div className={styles.practiceContainer}>
            <PracticeHeader onBack={onBack} index={index} total={shuffled.length} />
            <ProgressBar index={index} total={shuffled.length} />

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
