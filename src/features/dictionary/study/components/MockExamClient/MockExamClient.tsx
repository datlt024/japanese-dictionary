"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, RotateCcw, Trophy } from "lucide-react"
import styles from "./MockExamClient.module.css"

type StudyItem = { id: number; word: string; kana: string | null; meaning: string | null }
type Question = { id: number; word: string; kana: string | null; options: string[]; correctIndex: number }
type Phase = "loading" | "error" | "exam" | "summary"

const OPTION_LABELS = ["A", "B", "C", "D"]

const EXAM_CONFIG: Record<string, { questions: number; duration: number }> = {
    N5: { questions: 30, duration: 20 * 60 },
    N4: { questions: 35, duration: 25 * 60 },
    N3: { questions: 40, duration: 30 * 60 },
    N2: { questions: 40, duration: 35 * 60 },
    N1: { questions: 40, duration: 40 * 60 },
}

const PASSING_RATE = 0.7

function formatTime(s: number): string {
    const m = Math.floor(s / 60).toString().padStart(2, "0")
    const sec = (s % 60).toString().padStart(2, "0")
    return `${m}:${sec}`
}

function fisher<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

function buildQuestions(items: StudyItem[], count: number): Question[] {
    const valid = items.filter(x => x.meaning?.trim())
    if (valid.length < 4) return []
    const shuffled = fisher(valid)
    const selected = shuffled.slice(0, Math.min(count, shuffled.length))

    return selected.map(item => {
        const correct = item.meaning!
        const candidates = fisher(shuffled.filter(x => x.id !== item.id && x.meaning && x.meaning !== correct))
        const distractors = candidates.slice(0, 3).map(x => x.meaning!)
        while (distractors.length < 3) distractors.push("—")
        const options = fisher([correct, ...distractors])
        return { id: item.id, word: item.word, kana: item.kana, options, correctIndex: options.indexOf(correct) }
    })
}

async function fetchQuestions(level: string, count: number): Promise<Question[]> {
    const r = await fetch(`/api/study/jlpt?level=${level}&limit=100`)
    if (!r.ok) throw new Error("fetch failed")
    return buildQuestions(await r.json(), count)
}

export default function MockExamClient({ level }: { level: string }) {
    const cfg = EXAM_CONFIG[level] ?? { questions: 40, duration: 30 * 60 }

    const [phase, setPhase] = useState<Phase>("loading")
    const [questions, setQuestions] = useState<Question[]>([])
    const [current, setCurrent] = useState(0)
    const [answers, setAnswers] = useState<(number | null)[]>([])
    const [selected, setSelected] = useState<number | null>(null)
    const [timeLeft, setTimeLeft] = useState(cfg.duration)
    const [timeTaken, setTimeTaken] = useState(0)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const startRef = useRef(0)
    const advRef = useRef(false)

    const finish = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current)
        setTimeTaken(Math.round((Date.now() - startRef.current) / 1000))
        setPhase("summary")
    }, [])

    const applyQuestions = useCallback((qs: Question[], duration: number) => {
        setQuestions(qs)
        setAnswers(new Array(qs.length).fill(null))
        setCurrent(0)
        setSelected(null)
        setTimeLeft(duration)
        startRef.current = Date.now()
        advRef.current = false
        setPhase("exam")
    }, [])

    const startExam = useCallback(() => {
        setPhase("loading")
        fetchQuestions(level, cfg.questions)
            .then(qs => {
                if (qs.length === 0) { setPhase("error"); return }
                applyQuestions(qs, cfg.duration)
            })
            .catch(() => setPhase("error"))
    }, [level, cfg.questions, cfg.duration, applyQuestions])

    // Initial load — direct fetch avoids setState-in-effect lint rule
    useEffect(() => {
        let mounted = true
        fetchQuestions(level, cfg.questions)
            .then(qs => {
                if (!mounted) return
                if (qs.length === 0) { setPhase("error"); return }
                applyQuestions(qs, cfg.duration)
            })
            .catch(() => { if (mounted) setPhase("error") })
        return () => { mounted = false }
        // cfg values are derived from level (constant map), level change reloads
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [level])

    useEffect(() => {
        if (phase !== "exam") return
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { finish(); return 0 }
                return t - 1
            })
        }, 1000)
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [phase, finish])

    const handleSelect = useCallback((idx: number) => {
        if (selected !== null || advRef.current || phase !== "exam") return
        advRef.current = true
        setSelected(idx)
        setAnswers(prev => { const n = [...prev]; n[current] = idx; return n })
        setTimeout(() => {
            if (current + 1 >= questions.length) {
                finish()
            } else {
                setCurrent(c => c + 1)
                setSelected(null)
                advRef.current = false
            }
        }, 900)
    }, [selected, current, questions.length, phase, finish])

    useEffect(() => {
        if (phase !== "exam") return
        const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, "1": 0, "2": 1, "3": 2, "4": 3 }
        const fn = (e: KeyboardEvent) => {
            const i = map[e.key.toLowerCase()]
            if (i !== undefined) handleSelect(i)
        }
        window.addEventListener("keydown", fn)
        return () => window.removeEventListener("keydown", fn)
    }, [phase, handleSelect])

    // ── Loading ────────────────────────────────────────────
    if (phase === "loading") {
        return (
            <div className={styles.center}>
                <div className={styles.spinner} />
                <p className={styles.loadingText}>Đang tải câu hỏi...</p>
            </div>
        )
    }

    // ── Error ──────────────────────────────────────────────
    if (phase === "error") {
        return (
            <div className={styles.center}>
                <p className={styles.errorText}>Không thể tải câu hỏi. Vui lòng thử lại.</p>
                <button className={styles.btnPrimary} onClick={startExam}>Thử lại</button>
            </div>
        )
    }

    // ── Summary ────────────────────────────────────────────
    if (phase === "summary") {
        const answered = answers.filter(a => a !== null).length
        const correct = answers.filter((a, i) => a !== null && a === questions[i]?.correctIndex).length
        const pct = Math.round((correct / questions.length) * 100)
        const passed = correct / questions.length >= PASSING_RATE
        const wrong = questions.filter((_, i) => answers[i] !== null && answers[i] !== questions[i].correctIndex)

        return (
            <div className={styles.summary}>
                <Link href="/study?tab=thi-thu" className={styles.backBtn}>
                    <ArrowLeft size={14} /> Danh sách đề thi
                </Link>

                <div className={styles.summaryCard}>
                    <span className={styles.resultBadge} data-passed={String(passed)}>
                        {passed ? "ĐẠT" : "CHƯA ĐẠT"}
                    </span>
                    <div className={styles.scoreRow}>
                        <span className={styles.scoreNum}>{correct}</span>
                        <span className={styles.scoreDen}>/{questions.length}</span>
                    </div>
                    <p className={styles.scorePct}>{pct}% chính xác</p>

                    <div className={styles.statsRow}>
                        <div className={styles.stat}>
                            <span className={styles.statVal}>{answered}</span>
                            <span className={styles.statLbl}>Đã trả lời</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statVal} data-color="green">{correct}</span>
                            <span className={styles.statLbl}>Đúng</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statVal} data-color="red">{answered - correct}</span>
                            <span className={styles.statLbl}>Sai</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statVal}>{formatTime(timeTaken)}</span>
                            <span className={styles.statLbl}>Thời gian</span>
                        </div>
                    </div>

                    <div className={styles.summaryActions}>
                        <button className={styles.btnPrimary} onClick={startExam}>
                            <RotateCcw size={14} /> Thi lại
                        </button>
                        <Link href="/study?tab=thi-thu" className={styles.btnOutline}>
                            <Trophy size={14} /> Chọn đề khác
                        </Link>
                    </div>
                </div>

                {wrong.length > 0 && (
                    <div className={styles.wrongSection}>
                        <p className={styles.wrongTitle}>Từ cần ôn lại ({wrong.length})</p>
                        <div className={styles.wrongList}>
                            {wrong.map((q, i) => (
                                <div key={i} className={styles.wrongItem}>
                                    <div className={styles.wrongWordBlock}>
                                        <span className={styles.wrongWord}>{q.word}</span>
                                        {q.kana && q.kana !== q.word && (
                                            <span className={styles.wrongKana}>{q.kana}</span>
                                        )}
                                    </div>
                                    <span className={styles.wrongMeaning}>{q.options[q.correctIndex]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // ── Exam ───────────────────────────────────────────────
    const q = questions[current]
    const progress = (current / questions.length) * 100
    const warn = timeLeft < 60

    return (
        <div className={styles.exam}>
            <div className={styles.examHeader}>
                <Link href="/study?tab=thi-thu" className={styles.exitBtn}>
                    <ArrowLeft size={14} /> Thoát
                </Link>
                <span className={styles.levelLabel} data-level={level}>{level}</span>
                <span className={styles.progressText}>{current + 1} / {questions.length}</span>
                <span className={styles.timer} data-warn={warn || undefined}>
                    <Clock size={12} /> {formatTime(timeLeft)}
                </span>
            </div>

            <div className={styles.progressBar}>
                <div className={styles.progressFill} data-level={level} style={{ width: `${progress}%` }} />
            </div>

            <div className={styles.body}>
                <div className={styles.questionCard}>
                    <div className={styles.wordBlock}>
                        <span className={styles.wordJp}>{q.word}</span>
                        {q.kana && q.kana !== q.word && (
                            <span className={styles.wordKana}>{q.kana}</span>
                        )}
                    </div>
                    <p className={styles.qPrompt}>có nghĩa là gì?</p>
                </div>

                <div className={styles.options}>
                    {q.options.map((opt, i) => {
                        let state = "default"
                        if (selected !== null) {
                            if (i === q.correctIndex) state = "correct"
                            else if (i === selected) state = "wrong"
                            else state = "dim"
                        }
                        return (
                            <button
                                key={i}
                                className={styles.option}
                                data-state={state}
                                onClick={() => handleSelect(i)}
                                disabled={selected !== null}
                            >
                                <span className={styles.optLabel}>{OPTION_LABELS[i]}</span>
                                <span className={styles.optText}>{opt}</span>
                            </button>
                        )
                    })}
                </div>

                <p className={styles.keyHint}>Nhấn A / B / C / D hoặc 1 / 2 / 3 / 4 để chọn</p>
            </div>
        </div>
    )
}
