"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import styles from "./MockExamClient.module.css"

import { N5_QUESTIONS_WITH_LISTENING } from "@/features/dictionary/study/data/n5-exam"
import { N5_2021_QUESTIONS }          from "@/features/dictionary/study/data/n5-2021-exam"
import { N5_2024_QUESTIONS }          from "@/features/dictionary/study/data/n5-2024-exam"
import { N4_2021_QUESTIONS }          from "@/features/dictionary/study/data/n4-2021-exam"
import { N3_7_2021_QUESTIONS }        from "@/features/dictionary/study/data/n3-7-2021-exam"
import { N3_12_2021_QUESTIONS }       from "@/features/dictionary/study/data/n3-12-2021-exam"
import { N3_7_2022_QUESTIONS }        from "@/features/dictionary/study/data/n3-7-2022-exam"
import { N3_12_2022_QUESTIONS }       from "@/features/dictionary/study/data/n3-12-2022-exam"
import { N3_7_2023_QUESTIONS }        from "@/features/dictionary/study/data/n3-7-2023-exam"
import { N3_12_2023_QUESTIONS }       from "@/features/dictionary/study/data/n3-12-2023-exam"

import type { Phase, Question, VocabItem, GrammarItem } from "./exam-types"
import { EXAM }                 from "./exam-config"
import { buildQuestions, score60 } from "./exam-utils"
import ExamInfoScreen           from "./ExamInfoScreen"
import ExamBreakScreen          from "./ExamBreakScreen"
import ExamActivePhase          from "./ExamActivePhase"
import ExamReviewScreen         from "./ExamReviewScreen"
import ExamSummaryScreen        from "./ExamSummaryScreen"

export default function MockExamClient({ level, year }: { level: string; year?: string }) {
    const examKey = level === "N5" && year === "2021"   ? "N5-2021"
                  : level === "N5" && year === "2024"   ? "N5-2024"
                  : level === "N3" && year === "7-2021"  ? "N3-7-2021"
                  : level === "N3" && year === "12-2021" ? "N3-12-2021"
                  : level === "N3" && year === "7-2022"  ? "N3-7-2022"
                  : level === "N3" && year === "12-2022" ? "N3-12-2022"
                  : level === "N3" && year === "7-2023"  ? "N3-7-2023"
                  : level === "N3" && year === "12-2023" ? "N3-12-2023"
                  : level
    const cfg = EXAM[examKey] ?? EXAM["N5"]

    const [phase,             setPhase]             = useState<Phase>("info")
    const [questions,         setQuestions]         = useState<Question[]>([])
    const [answers,           setAnswers]           = useState<(number | null)[]>([])
    const [idx,               setIdx]               = useState(0)
    const [timeLeft,          setTimeLeft]          = useState(0)
    const [timeTaken,         setTimeTaken]         = useState(0)
    const [languageTimeTaken, setLanguageTimeTaken] = useState(0)
    const [showReview,        setShowReview]        = useState(false)

    const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null)
    const startRef     = useRef(0)
    const endTimeRef   = useRef(0)
    const questionRefs = useRef<(HTMLDivElement | null)[]>([])
    const audioRef     = useRef<HTMLAudioElement>(null)

    // ── Timer ──────────────────────────────────────────────────────────

    const startTimer = useCallback((totalMin: number) => {
        startRef.current   = Date.now()
        endTimeRef.current = Date.now() + totalMin * 60 * 1000
        setTimeLeft(totalMin * 60)
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
            setTimeLeft(Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000)))
        }, 500)
    }, [])

    const stopTimer = useCallback(() => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }, [])

    // ── Finish / transition ────────────────────────────────────────────

    const finish = useCallback(() => {
        stopTimer()
        if (cfg.listeningAudio && phase === "question") {
            setLanguageTimeTaken(Math.round((Date.now() - startRef.current) / 1000))
            setPhase("break")
        } else {
            setTimeTaken(Math.round((Date.now() - startRef.current) / 1000))
            setPhase("summary")
        }
    }, [stopTimer, cfg.listeningAudio, phase])

    const startListening = useCallback(() => {
        const listeningMin = cfg.sections.find(s => s.id === "listening")?.allocMin ?? 30
        startRef.current = Date.now()
        startTimer(listeningMin)
        const firstIdx = questions.findIndex(q => q.sectionId === "listening")
        setIdx(Math.max(0, firstIdx))
        setPhase("listening")
    }, [cfg.sections, startTimer, questions])

    // ── Data loading ───────────────────────────────────────────────────

    const load = useCallback((mounted: { v: boolean }) => {
        const staticExams: Record<string, Question[]> = {
            "N5":         N5_QUESTIONS_WITH_LISTENING  as Question[],
            "N5-2021":    N5_2021_QUESTIONS             as Question[],
            "N5-2024":    N5_2024_QUESTIONS             as Question[],
            "N4":         N4_2021_QUESTIONS             as Question[],
            "N3-7-2021":  N3_7_2021_QUESTIONS           as Question[],
            "N3-12-2021": N3_12_2021_QUESTIONS          as Question[],
            "N3-7-2022":  N3_7_2022_QUESTIONS           as Question[],
            "N3-12-2022": N3_12_2022_QUESTIONS          as Question[],
            "N3-7-2023":  N3_7_2023_QUESTIONS           as Question[],
            "N3-12-2023": N3_12_2023_QUESTIONS          as Question[],
        }

        const qs = staticExams[examKey]
        if (qs) {
            if (!mounted.v) return
            const languageMin = cfg.sections.filter(s => s.id !== "listening").reduce((acc, s) => acc + s.allocMin, 0)
            questionRefs.current = new Array(qs.length).fill(null)
            setQuestions(qs)
            setAnswers(new Array(qs.length).fill(null))
            setIdx(0)
            setLanguageTimeTaken(0)
            startTimer(languageMin)
            setPhase("question")
            return
        }

        const totalMin     = cfg.sections.reduce((acc, s) => acc + s.allocMin, 0)
        const grammarCount = cfg.sections.flatMap(s => s.groups).filter(g => g.type === "grammar_blank").reduce((a, g) => a + g.count, 0)
        Promise.all([
            fetch(`/api/study/jlpt?level=${level}&limit=100`).then(r => r.json()),
            fetch(`/api/study/grammar?level=${level}&limit=${Math.min(grammarCount * 4, 100)}`).then(r => r.json()),
        ]).then(([vocab, grammar]) => {
            if (!mounted.v) return
            const built = buildQuestions(vocab as VocabItem[], grammar as GrammarItem[], cfg.sections)
            if (built.length < 5) { setPhase("error"); return }
            questionRefs.current = new Array(built.length).fill(null)
            setQuestions(built)
            setAnswers(new Array(built.length).fill(null))
            setIdx(0)
            startTimer(totalMin)
            setPhase("question")
        }).catch(() => { if (mounted.v) setPhase("error") })
    }, [examKey, level, cfg, startTimer])

    const startExam = useCallback(() => {
        stopTimer()
        setLanguageTimeTaken(0); setShowReview(false); setTimeTaken(0)
        const mounted = { v: true }
        setPhase("loading")
        load(mounted)
    }, [load, stopTimer])

    // ── Effects ────────────────────────────────────────────────────────

    useEffect(() => {
        if ((phase !== "question" && phase !== "listening") || timeLeft !== 0) return
        finish()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, phase])

    useEffect(() => () => stopTimer(), [stopTimer])

    useEffect(() => {
        if (!showReview || !cfg.listeningAudio) return
        audioRef.current?.load()
    }, [showReview, cfg.listeningAudio])

    useEffect(() => {
        if (phase !== "question" && phase !== "listening") return
        const block    = (e: Event) => e.preventDefault()
        const blockKey = (e: KeyboardEvent) => {
            if (e.key === "PrintScreen") {
                e.preventDefault()
                navigator.clipboard?.writeText("").catch(() => {})
                return
            }
            if ((e.ctrlKey || e.metaKey) && ["c", "x", "a", "p"].includes(e.key.toLowerCase()))
                e.preventDefault()
        }
        document.addEventListener("copy", block)
        document.addEventListener("cut", block)
        document.addEventListener("contextmenu", block)
        document.addEventListener("keydown", blockKey)
        return () => {
            document.removeEventListener("copy", block)
            document.removeEventListener("cut", block)
            document.removeEventListener("contextmenu", block)
            document.removeEventListener("keydown", blockKey)
        }
    }, [phase])

    useEffect(() => {
        if (phase !== "question" && phase !== "listening") return
        const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, "1": 0, "2": 1, "3": 2, "4": 3 }
        const fn = (e: KeyboardEvent) => {
            const i = map[e.key.toLowerCase()]
            if (i !== undefined) setAnswers(prev => { const n = [...prev]; n[idx] = i; return n })
        }
        window.addEventListener("keydown", fn)
        return () => window.removeEventListener("keydown", fn)
    }, [phase, idx])

    // ── Handlers ───────────────────────────────────────────────────────

    const handleSelect = useCallback((qIdx: number, optIdx: number) => {
        setAnswers(prev => { const n = [...prev]; n[qIdx] = optIdx; return n })
        setIdx(qIdx)
    }, [])

    const scrollToQuestion = useCallback((qIdx: number) => {
        setIdx(qIdx)
        questionRefs.current[qIdx]?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, [])

    // ── Results ────────────────────────────────────────────────────────

    function getResults() {
        const correctIn = (qs: Question[]) => qs.filter(q => answers[questions.indexOf(q)] === q.correctIndex).length

        const vocabQs     = questions.filter(q => q.sectionId === "vocab")
        const grammarQs   = questions.filter(q => q.sectionId === "grammar")
        const listeningQs = questions.filter(q => q.sectionId === "listening")

        const vocabCorrect     = correctIn(vocabQs)
        const grammarCorrect   = correctIn(grammarQs)
        const listeningCorrect = correctIn(listeningQs)

        const vocabScore     = score60(vocabCorrect,     vocabQs.length)
        const grammarScore   = score60(grammarCorrect,   grammarQs.length)
        const listeningScore = score60(listeningCorrect, listeningQs.length)
        const total          = vocabScore + grammarScore + listeningScore

        const vocabPassed     = vocabQs.length     === 0 || vocabScore     >= cfg.passing.secMin
        const grammarPassed   = grammarQs.length   === 0 || grammarScore   >= cfg.passing.secMin
        const listeningPassed = listeningQs.length === 0 || listeningScore >= cfg.passing.secMin
        const passed          = total >= cfg.passing.total && vocabPassed && grammarPassed && listeningPassed

        const totalCorrect = vocabCorrect + grammarCorrect + listeningCorrect
        const totalQ       = questions.length

        return {
            vocabScore, grammarScore, listeningScore,
            vocabCorrect, grammarCorrect, listeningCorrect,
            vocabQsLen: vocabQs.length, grammarQsLen: grammarQs.length, listeningQsLen: listeningQs.length,
            vocabPassed, grammarPassed, listeningPassed,
            total, totalCorrect, totalQ, passed,
        }
    }

    // ── Render ─────────────────────────────────────────────────────────

    if (phase === "info") return <ExamInfoScreen level={level} cfg={cfg} startExam={startExam} />

    if (phase === "loading") {
        return (
            <div className={styles.center}>
                <div className={styles.spinner} />
                <p className={styles.hint}>Đang chuẩn bị đề thi...</p>
            </div>
        )
    }

    if (phase === "error") {
        return (
            <div className={styles.center}>
                <p className={styles.hint}>Không thể tải đề thi. Vui lòng thử lại.</p>
                <button className={styles.btnPrimary} onClick={startExam}>Thử lại</button>
            </div>
        )
    }

    if (phase === "question" || phase === "listening") {
        return (
            <ExamActivePhase
                level={level}
                cfg={cfg}
                phase={phase}
                questions={questions}
                answers={answers}
                idx={idx}
                timeLeft={timeLeft}
                audioRef={audioRef}
                questionRefs={questionRefs}
                onSelect={handleSelect}
                onSetIdx={setIdx}
                onScrollToQuestion={scrollToQuestion}
                onFinish={finish}
            />
        )
    }

    if (phase === "break") {
        return (
            <ExamBreakScreen
                cfg={cfg}
                startListening={startListening}
                goToSummary={() => setPhase("summary")}
            />
        )
    }

    const results = getResults()

    if (showReview) {
        return (
            <ExamReviewScreen
                level={level}
                cfg={cfg}
                questions={questions}
                answers={answers}
                sectionCounts={{ totalCorrect: results.totalCorrect, totalQ: results.totalQ }}
                questionRefs={questionRefs}
                onBack={() => setShowReview(false)}
            />
        )
    }

    return (
        <ExamSummaryScreen
            level={level}
            cfg={cfg}
            results={results}
            languageTimeTaken={languageTimeTaken}
            timeTaken={timeTaken}
            onRetry={() => setPhase("info")}
            onShowReview={() => setShowReview(true)}
        />
    )
}
