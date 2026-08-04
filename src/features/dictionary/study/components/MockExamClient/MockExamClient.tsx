"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, RotateCcw, ChevronRight, X } from "lucide-react"
import styles from "./MockExamClient.module.css"

// ── Types ──────────────────────────────────────────────────────────────

type QType = "kanji_reading" | "kanji_writing" | "context_vocab" | "grammar_blank"
type Phase = "info" | "loading" | "error" | "question" | "break" | "summary"

type VocabItem  = { id: number; word: string; kana: string | null; meaning: string | null }
type GrammarItem = { id: number; pattern: string; meaning: string | null }

interface Group {
    id: string
    label: string      // 問題1
    sublabel: string   // 漢字の読み方
    type: QType
    count: number
}

interface Section {
    id: string
    title: string   // 言語知識（文字・語彙）
    titleVi: string // Ngôn ngữ — Từ vựng
    allocMin: number // minutes allocated (for reference display)
    groups: Group[]
}

interface Question {
    groupId: string
    sectionId: string
    type: QType
    display: string
    reading?: string
    sentence?: string   // Japanese sentence with [target] marker for highlighted word
    options: string[]
    correctIndex: number
}

// ── JLPT structure ─────────────────────────────────────────────────────
// Source: Official JLPT syllabus

interface InfoRow { title: string; count: number; skipped?: boolean }

const EXAM: Record<string, {
    duration: number
    passingDisplay: string
    passing: { secMin: number; total: number }
    infoRows: InfoRow[]
    sections: Section[]
}> = {
    N5: {
        duration: 90 * 60,  // 20 + 40 min tested + 30 min 聴解
        passingDisplay: "80",
        passing: { secMin: 19, total: 80 },
        infoRows: [
            { title: "文字・語彙", count: 25 },
            { title: "文法・読解", count: 32 },
            { title: "聴解",       count: 24, skipped: true },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（文字・語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 20,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "漢字の読み方",     type: "kanji_reading", count: 12 },
                    { id: "q2", label: "問題2", sublabel: "漢字の書き方",     type: "kanji_writing", count: 8  },
                    { id: "q3", label: "問題3", sublabel: "文脈規定",          type: "context_vocab", count: 5  },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 40,
                groups: [
                    { id: "q4", label: "問題4", sublabel: "文の文法（文法形式の判断）", type: "grammar_blank", count: 16 },
                ],
            },
        ],
    },
    N4: {
        duration: 115 * 60,  // 25 + 55 min tested + 35 min 聴解
        passingDisplay: "90",
        passing: { secMin: 19, total: 90 },
        infoRows: [
            { title: "文字・語彙",  count: 25 },
            { title: "文法・読解",  count: 35 },
            { title: "聴解",        count: 28, skipped: true },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（文字・語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 25,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "漢字の読み方",  type: "kanji_reading", count: 7  },
                    { id: "q2", label: "問題2", sublabel: "漢字の書き方",  type: "kanji_writing",   count: 6  },
                    { id: "q3", label: "問題3", sublabel: "（　　）に入れるのに最もよいものを選んでください", type: "context_vocab", count: 7  },
                    { id: "q4", label: "問題4", sublabel: "____に意味が最も近いものを選んでください",          type: "context_vocab", count: 5  },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 55,
                groups: [
                    { id: "q5", label: "問題1", sublabel: "文の文法1",  type: "grammar_blank", count: 20 },
                    { id: "q6", label: "問題2", sublabel: "文の文法2",  type: "grammar_blank", count: 9  },
                    { id: "q7", label: "問題3", sublabel: "文章の文法", type: "grammar_blank", count: 6  },
                ],
            },
        ],
    },
    N3: {
        duration: 140 * 60,  // 30 + 70 min tested + 40 min 聴解
        passingDisplay: "95",
        passing: { secMin: 19, total: 95 },
        infoRows: [
            { title: "語彙",      count: 35 },
            { title: "文法・読解", count: 39 },
            { title: "聴解",      count: 28, skipped: true },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 30,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "漢字の読み方",   type: "kanji_reading", count: 10 },
                    { id: "q2", label: "問題2", sublabel: "漢字の書き方",   type: "kanji_writing",   count: 8  },
                    { id: "q3", label: "問題3", sublabel: "語彙形成",        type: "context_vocab", count: 5  },
                    { id: "q4", label: "問題4", sublabel: "文脈規定",        type: "context_vocab", count: 7  },
                    { id: "q5", label: "問題5", sublabel: "言い換え類義",    type: "context_vocab", count: 5  },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 70,
                groups: [
                    { id: "q6", label: "問題1", sublabel: "文の文法1",  type: "grammar_blank", count: 20 },
                    { id: "q7", label: "問題2", sublabel: "文の文法2",  type: "grammar_blank", count: 10 },
                    { id: "q8", label: "問題3", sublabel: "文章の文法", type: "grammar_blank", count: 9  },
                ],
            },
        ],
    },
    N2: {
        duration: 155 * 60,  // 105 min tested (gộp) + 50 min 聴解
        passingDisplay: "90",
        passing: { secMin: 19, total: 90 },
        infoRows: [
            { title: "語彙",       count: 27 },
            { title: "文法・読解",  count: 48 },
            { title: "聴解",        count: 30, skipped: true },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（語彙・文法）・読解", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 40,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "漢字の読み方", type: "kanji_reading", count: 5 },
                    { id: "q2", label: "問題2", sublabel: "語彙形成",      type: "context_vocab", count: 5 },
                    { id: "q3", label: "問題3", sublabel: "文脈規定",      type: "context_vocab", count: 7 },
                    { id: "q4", label: "問題4", sublabel: "言い換え類義",  type: "context_vocab", count: 5 },
                    { id: "q5", label: "問題5", sublabel: "用法",          type: "context_vocab", count: 5 },
                ],
            },
            {
                id: "grammar", title: "言語知識（語彙・文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 65,
                groups: [
                    { id: "q6", label: "問題1", sublabel: "文の文法1",  type: "grammar_blank", count: 25 },
                    { id: "q7", label: "問題2", sublabel: "文の文法2",  type: "grammar_blank", count: 15 },
                    { id: "q8", label: "問題3", sublabel: "文章の文法", type: "grammar_blank", count: 8  },
                ],
            },
        ],
    },
    N1: {
        duration: 165 * 60,  // 110 min tested (gộp) + 55 min 聴解
        passingDisplay: "100",
        passing: { secMin: 19, total: 100 },
        infoRows: [
            { title: "語彙",       count: 24 },
            { title: "文法・読解",  count: 46 },
            { title: "聴解",        count: 35, skipped: true },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（語彙・文法）・読解", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 40,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "漢字の読み方", type: "kanji_reading", count: 6 },
                    { id: "q2", label: "問題2", sublabel: "文脈規定",      type: "context_vocab", count: 7 },
                    { id: "q3", label: "問題3", sublabel: "言い換え類義",  type: "context_vocab", count: 6 },
                    { id: "q4", label: "問題4", sublabel: "用法",          type: "context_vocab", count: 5 },
                ],
            },
            {
                id: "grammar", title: "言語知識（語彙・文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 70,
                groups: [
                    { id: "q5", label: "問題1", sublabel: "文の文法1",  type: "grammar_blank", count: 25 },
                    { id: "q6", label: "問題2", sublabel: "文の文法2",  type: "grammar_blank", count: 15 },
                    { id: "q7", label: "問題3", sublabel: "文章の文法", type: "grammar_blank", count: 6  },
                ],
            },
        ],
    },
}

// ── Question type metadata ─────────────────────────────────────────────

const Q_TYPE_LABEL: Record<QType, string> = {
    kanji_reading: "読み方",
    kanji_writing: "書き方",
    context_vocab: "語彙",
    grammar_blank: "文法",
}

const Q_TYPE_INSTRUCTION: Record<QType, string> = {
    kanji_reading: "の言葉の読み方として正しいものはどれですか。",
    kanji_writing: "の言葉はどう書きますか。",
    context_vocab: "の言葉の意味はどれですか。",
    grammar_blank: "の文型の意味はどれですか。",
}

const SENTENCE_TEMPLATES: ((w: string) => string)[] = [
    w => `毎日[${w}]を使います。`,
    w => `あの[${w}]を見ました。`,
    w => `[${w}]に行きましょう。`,
    w => `これは[${w}]です。`,
    w => `[${w}]が好きです。`,
    w => `[${w}]をください。`,
    w => `[${w}]はどこですか。`,
    w => `[${w}]があります。`,
    w => `[${w}]を勉強します。`,
    w => `[${w}]は大切です。`,
    w => `[${w}]で遊びます。`,
    w => `あの[${w}]はきれいです。`,
    w => `[${w}]はいくらですか。`,
    w => `[${w}]を買いました。`,
    w => `[${w}]を食べます。`,
    w => `[${w}]が来ます。`,
]

function parseSentence(sentence: string): React.ReactNode {
    const parts = sentence.split(/\[([^\]]+)\]/)
    if (parts.length < 3) return <>{sentence}</>
    return (
        <>{parts[0]}<mark className={styles.qSentenceMark}>{parts[1]}</mark>{parts[2]}</>
    )
}

// ── Helpers ────────────────────────────────────────────────────────────

function formatTime(s: number) {
    return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`
}

function fisher<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

function pickOthers(pool: string[], correct: string, n = 3): string[] {
    const seen = new Set([correct])
    const result: string[] = []
    for (const item of fisher(pool)) {
        if (!seen.has(item) && item) { seen.add(item); result.push(item) }
        if (result.length >= n) break
    }
    while (result.length < n) result.push("—")
    return result
}

function buildQuestions(vocab: VocabItem[], grammar: GrammarItem[], sections: Section[]): Question[] {
    const kanjiItems   = fisher(vocab.filter(v => v.kana !== null && v.word !== v.kana))
    const meaningItems = fisher(vocab.filter(v => v.meaning))

    const allKana     = vocab.filter(v => v.kana).map(v => v.kana!)
    const allWords    = vocab.map(v => v.word)
    const allMeanings = vocab.filter(v => v.meaning).map(v => v.meaning!)
    const allGrammar  = grammar.filter(g => g.meaning).map(g => g.meaning!)

    let ki = 0, vi = 0, gi = 0
    const questions: Question[] = []

    for (const sec of sections) {
        for (const grp of sec.groups) {
            for (let q = 0; q < grp.count; q++) {
                if (grp.type === "kanji_reading") {
                    const item = kanjiItems[ki % Math.max(kanjiItems.length, 1)]
                    const tmpl = SENTENCE_TEMPLATES[ki % SENTENCE_TEMPLATES.length]
                    ki++
                    if (!item) continue
                    const correct = item.kana!
                    const options = fisher([correct, ...pickOthers(allKana, correct)])
                    questions.push({ groupId: grp.id, sectionId: sec.id, type: grp.type,
                        display: item.word, sentence: tmpl(item.word), options, correctIndex: options.indexOf(correct) })

                } else if (grp.type === "kanji_writing") {
                    const item = kanjiItems[ki % Math.max(kanjiItems.length, 1)]
                    const tmpl = SENTENCE_TEMPLATES[ki % SENTENCE_TEMPLATES.length]
                    ki++
                    if (!item) continue
                    const correct = item.word
                    const options = fisher([correct, ...pickOthers(allWords, correct)])
                    questions.push({ groupId: grp.id, sectionId: sec.id, type: grp.type,
                        display: item.kana!, sentence: tmpl(item.kana!), options, correctIndex: options.indexOf(correct) })

                } else if (grp.type === "context_vocab") {
                    const item = meaningItems[vi % Math.max(meaningItems.length, 1)]
                    vi++
                    if (!item || !item.meaning) continue
                    const correct = item.meaning
                    const options = fisher([correct, ...pickOthers(allMeanings, correct)])
                    questions.push({ groupId: grp.id, sectionId: sec.id, type: grp.type,
                        display: item.word, reading: item.kana ?? undefined, options, correctIndex: options.indexOf(correct) })

                } else {
                    const item = grammar[gi % Math.max(grammar.length, 1)]
                    gi++
                    if (!item || !item.meaning) continue
                    const correct = item.meaning
                    const options = fisher([correct, ...pickOthers(allGrammar, correct)])
                    questions.push({ groupId: grp.id, sectionId: sec.id, type: grp.type,
                        display: item.pattern, options, correctIndex: options.indexOf(correct) })
                }
            }
        }
    }
    return questions
}

function score60(correct: number, total: number) {
    return total > 0 ? Math.round((correct / total) * 60) : 0
}

// ── Component ──────────────────────────────────────────────────────────

export default function MockExamClient({ level }: { level: string }) {
    const cfg = EXAM[level] ?? EXAM["N5"]
    const allGroups = cfg.sections.flatMap(s => s.groups)

    const [phase,     setPhase]     = useState<Phase>("info")
    const [questions, setQuestions] = useState<Question[]>([])
    const [answers,   setAnswers]   = useState<(number | null)[]>([])
    const [idx,       setIdx]       = useState(0)
    const [timeLeft,  setTimeLeft]  = useState(0)
    const [timeTaken, setTimeTaken] = useState(0)

    const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null)
    const startRef      = useRef(0)
    const questionRefs  = useRef<(HTMLDivElement | null)[]>([])

    // ── Data loading ──────────────────────────────────────────────────

    const load = useCallback((mounted: { v: boolean }) => {
        const grammarCount = cfg.sections.flatMap(s => s.groups).filter(g => g.type === "grammar_blank").reduce((a, g) => a + g.count, 0)
        Promise.all([
            fetch(`/api/study/jlpt?level=${level}&limit=100`).then(r => r.json()),
            fetch(`/api/study/grammar?level=${level}&limit=${Math.min(grammarCount * 4, 100)}`).then(r => r.json()),
        ]).then(([vocab, grammar]) => {
            if (!mounted.v) return
            const qs = buildQuestions(vocab as VocabItem[], grammar as GrammarItem[], cfg.sections)
            if (qs.length < 5) { setPhase("error"); return }
            questionRefs.current = new Array(qs.length).fill(null)
            setQuestions(qs)
            setAnswers(new Array(qs.length).fill(null))
            setIdx(0)
            const totalMin = cfg.sections.reduce((acc, s) => acc + s.allocMin, 0)
            startRef.current = Date.now()
            setTimeLeft(totalMin * 60)
            if (timerRef.current) clearInterval(timerRef.current)
            timerRef.current = setInterval(() => {
                setTimeLeft(t => Math.max(0, t - 1))
            }, 1000)
            setPhase("question")
        }).catch(() => { if (mounted.v) setPhase("error") })
    }, [level, cfg])

    // ── Timer ────────────────────────────────────────────────────────

    const stopTimer = useCallback(() => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }, [])

    const finish = useCallback(() => {
        stopTimer()
        setTimeTaken(Math.round((Date.now() - startRef.current) / 1000))
        setPhase("break")
    }, [stopTimer])

    useEffect(() => {
        if (phase !== "question" || timeLeft !== 0) return
        finish()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, phase])

    useEffect(() => () => stopTimer(), [stopTimer])

    const startExam = useCallback(() => {
        stopTimer()
        const mounted = { v: true }
        setPhase("loading")
        load(mounted)
    }, [load, stopTimer])

    // ── Answer handler ────────────────────────────────────────────────

    const handleSelect = useCallback((qIdx: number, optIdx: number) => {
        setAnswers(prev => { const n = [...prev]; n[qIdx] = optIdx; return n })
        setIdx(qIdx)
    }, [])

    const scrollToQuestion = useCallback((qIdx: number) => {
        setIdx(qIdx)
        questionRefs.current[qIdx]?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, [])

    // ── Keyboard (1-4 / A-D for currently focused question) ──────────

    useEffect(() => {
        if (phase !== "question") return
        const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, "1": 0, "2": 1, "3": 2, "4": 3 }
        const fn = (e: KeyboardEvent) => {
            const i = map[e.key.toLowerCase()]
            if (i !== undefined) setAnswers(prev => { const n = [...prev]; n[idx] = i; return n })
        }
        window.addEventListener("keydown", fn)
        return () => window.removeEventListener("keydown", fn)
    }, [phase, idx])

    // ── Computed results ──────────────────────────────────────────────

    function getResults() {
        const vocabQs   = questions.filter(q => q.sectionId === "vocab")
        const grammarQs = questions.filter(q => q.sectionId === "grammar")
        const vocabCorrect   = vocabQs.filter(q => {
            const globalIdx = questions.indexOf(q)
            return answers[globalIdx] === q.correctIndex
        }).length
        const grammarCorrect = grammarQs.filter(q => {
            const globalIdx = questions.indexOf(q)
            return answers[globalIdx] === q.correctIndex
        }).length

        // per-group results
        const groupResults = allGroups.map(grp => {
            const grpQs = questions.map((q, i) => ({ q, i })).filter(({ q }) => q.groupId === grp.id)
            const correct = grpQs.filter(({ q, i }) => answers[i] === q.correctIndex).length
            return { ...grp, correct, total: grpQs.length }
        })

        const vocabScore   = score60(vocabCorrect,   vocabQs.length)
        const grammarScore = score60(grammarCorrect, grammarQs.length)
        const total = vocabScore + grammarScore
        const vocabPassed   = vocabScore   >= cfg.passing.secMin
        const grammarPassed = grammarScore >= cfg.passing.secMin
        const passed = total >= cfg.passing.total && vocabPassed && grammarPassed
        const totalCorrect = vocabCorrect + grammarCorrect
        const totalQ       = questions.length

        return { vocabCorrect, grammarCorrect, vocabQs, grammarQs, vocabScore, grammarScore, total, vocabPassed, grammarPassed, passed, totalCorrect, totalQ, groupResults }
    }

    // ── Render: info ─────────────────────────────────────────────────

    if (phase === "info") {
        const durationMin = Math.round(cfg.duration / 60)

        return (
            <div className={styles.introWrap}>
                <Link href="/study?tab=thi-thu" className={styles.backBtn}>
                    <ArrowLeft size={14} /> Danh sách đề thi
                </Link>

                <div className={styles.infoCard}>
                    <div className={styles.infoHeader}>
                        <h2 className={styles.infoTitle}>Đề thi thử JLPT</h2>
                        <span className={styles.introBadge} data-level={level}>{level}</span>
                    </div>

                    <div className={styles.infoMeta}>
                        <span className={styles.infoMetaLabel}>Trình độ đề thi</span>
                        <span className={styles.infoMetaVal} data-level={level}>{level}</span>
                    </div>

                    <table className={styles.infoTable}>
                        <thead>
                            <tr>
                                <th>Nội dung</th>
                                <th>Số câu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cfg.infoRows.map(row => (
                                <tr key={row.title} data-skipped={row.skipped || undefined}>
                                    <td>{row.title}</td>
                                    <td>{row.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className={styles.infoStats}>
                        <div className={styles.infoStat}>
                            <span className={styles.infoStatLabel}>Thời gian làm bài</span>
                            <span className={styles.infoStatVal} data-accent>{durationMin} Phút</span>
                        </div>
                        <div className={styles.infoStat}>
                            <span className={styles.infoStatLabel}>Điểm đạt</span>
                            <span className={styles.infoStatVal} data-pass>{cfg.passingDisplay} điểm</span>
                        </div>
                    </div>

                    <button className={styles.btnStart} onClick={startExam}>
                        Bắt đầu <ChevronRight size={16} />
                    </button>

                    <p className={styles.infoNote}>
                        * Đề thi thử bao gồm phần <strong>Ngôn ngữ</strong> (từ vựng + ngữ pháp). Không bao gồm phần 聴解.
                    </p>
                </div>
            </div>
        )
    }

    // ── Render: loading ───────────────────────────────────────────────

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

    // ── Render: question (two-column scroll layout) ───────────────────

    if (phase === "question") {
        const answeredCount = answers.filter(a => a !== null).length
        const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0
        const warn = timeLeft < 60

        return (
            <div className={styles.examPage}>
                {/* Top bar */}
                <div className={styles.examTopBar}>
                    <Link href="/study?tab=thi-thu" className={styles.examExitBtn}>
                        <X size={14} /> Thoát
                    </Link>
                    <div className={styles.examBarCenter}>
                        <span className={styles.examBarTitle}>JLPT {level}</span>
                        <span className={styles.examBarTimer} data-warn={warn || undefined}>
                            <Clock size={12} /> {formatTime(timeLeft)}
                        </span>
                    </div>
                    <button className={styles.examSubmitBtn} onClick={finish}>
                        Nộp bài
                    </button>
                </div>

                {/* Answered progress */}
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} data-level={level} style={{ width: `${progress}%` }} />
                </div>

                {/* Body: left questions + right navigator */}
                <div className={styles.examBody}>

                    {/* ── Left: scrollable question list ── */}
                    <div className={styles.questionsPanel}>
                        {cfg.sections.map(sec => {
                            const secQs = questions
                                .map((q, gi) => ({ q, gi }))
                                .filter(({ q }) => q.sectionId === sec.id)
                            if (secQs.length === 0) return null

                            let secOffset = 0
                            return (
                                <div key={sec.id} className={styles.qSectionBlock}>
                                    <div className={styles.qSectionHeader}>
                                        <span className={styles.qSectionTitle}>{sec.title}</span>
                                        <span className={styles.qSectionCount}>{secQs.length} câu</span>
                                    </div>

                                    {sec.groups.map(grp => {
                                        const grpQs = secQs.filter(({ q }) => q.groupId === grp.id)
                                        if (grpQs.length === 0) return null
                                        const grpOffset = secOffset
                                        secOffset += grpQs.length

                                        return (
                                            <div key={grp.id} className={styles.qGroupBlock}>
                                                <div className={styles.qGroupHeader}>
                                                    <span className={styles.qGroupLabel}>{grp.label}</span>
                                                    <span className={styles.qGroupSub}>{grp.sublabel}</span>
                                                </div>

                                                {grpQs.map(({ q, gi }, pos) => {
                                                    const isKanjiType = q.type === "kanji_reading" || q.type === "kanji_writing"
                                                    return (
                                                        <div
                                                            key={gi}
                                                            id={`q-${gi}`}
                                                            ref={el => { questionRefs.current[gi] = el }}
                                                            className={styles.qItem}
                                                            data-active={idx === gi || undefined}
                                                            data-type={q.type}
                                                            onClick={() => setIdx(gi)}
                                                        >
                                                            {/* ── Header row ── */}
                                                            <div className={styles.qItemHead}>
                                                                <span className={styles.qNum}>{grpOffset + pos + 1}</span>
                                                                <span className={styles.qTypeTag} data-type={q.type}>
                                                                    {Q_TYPE_LABEL[q.type]}
                                                                </span>
                                                            </div>

                                                            {/* ── Question body ── */}
                                                            <div className={styles.qBody}>
                                                                <p className={styles.qInstruction}>
                                                                    {q.type === "kanji_reading" || q.type === "kanji_writing"
                                                                        ? <><mark className={styles.qSentenceMark}>{q.display}</mark>{Q_TYPE_INSTRUCTION[q.type]}</>
                                                                        : Q_TYPE_INSTRUCTION[q.type]
                                                                    }
                                                                </p>

                                                                <div className={styles.qWordCenter}>
                                                                    {(q.type === "kanji_reading" || q.type === "kanji_writing") && (
                                                                        <p className={styles.qSentence}>
                                                                            {q.sentence ? parseSentence(q.sentence) : q.display}
                                                                        </p>
                                                                    )}
                                                                    {q.type === "context_vocab" && (
                                                                        <>
                                                                            <span className={styles.qVocabWord}>{q.display}</span>
                                                                            {q.reading && <span className={styles.qVocabReading}>{q.reading}</span>}
                                                                        </>
                                                                    )}
                                                                    {q.type === "grammar_blank" && (
                                                                        <span className={styles.qGrammarWord}>{q.display}</span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* ── Options ── */}
                                                            <div className={styles.qOptions} data-grid={isKanjiType || undefined}>
                                                                {q.options.map((opt, oi) => {
                                                                    const isSel = answers[gi] === oi
                                                                    return (
                                                                        <label
                                                                            key={oi}
                                                                            className={styles.qOption}
                                                                            data-selected={isSel || undefined}
                                                                            onClick={e => { e.stopPropagation(); handleSelect(gi, oi) }}
                                                                        >
                                                                            <span className={styles.qRadio} data-selected={isSel || undefined} />
                                                                            <span className={styles.qOptNum}>{oi + 1}</span>
                                                                            <span className={styles.qOptText}>{opt}</span>
                                                                        </label>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                        <div style={{ height: 80 }} />
                    </div>

                    {/* ── Right: navigator panel ── */}
                    <div className={styles.navPanel}>
                        <p className={styles.navStat}>
                            <span data-done>{answeredCount}</span>/{questions.length} đã trả lời
                        </p>
                        {cfg.sections.map(sec => {
                            const secQs = questions
                                .map((q, gi) => ({ q, gi }))
                                .filter(({ q }) => q.sectionId === sec.id)
                            if (secQs.length === 0) return null
                            return (
                                <div key={sec.id} className={styles.navSection}>
                                    <p className={styles.navSectionTitle}>{sec.title}</p>
                                    <div className={styles.navGrid}>
                                        {secQs.map(({ gi }, localIdx) => (
                                            <button
                                                key={gi}
                                                className={styles.navBtn}
                                                data-answered={answers[gi] !== null || undefined}
                                                data-current={idx === gi || undefined}
                                                data-level={answers[gi] !== null ? level : undefined}
                                                onClick={() => scrollToQuestion(gi)}
                                            >
                                                {localIdx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                        <p className={styles.navHint}>Nhấn 1 2 3 4 để chọn câu đang xem</p>
                    </div>

                </div>
            </div>
        )
    }

    // ── Render: break (giải lao trước 聴解 trong thi thật) ───────────

    if (phase === "break") {
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
                    <button className={styles.btnStart} onClick={() => setPhase("summary")}>
                        Nộp bài <ChevronRight size={16} />
                    </button>
                </div>

                <p className={styles.introNote}>
                    * Bài thi bao gồm phần <strong>Ngôn ngữ</strong> (từ vựng + ngữ pháp). Không có phần nghe và đọc hiểu.
                </p>
            </div>
        )
    }

    // ── Render: summary ───────────────────────────────────────────────

    const { vocabCorrect, grammarCorrect, vocabQs, grammarQs, vocabScore, grammarScore, total,
            vocabPassed, grammarPassed, passed, totalCorrect, totalQ, groupResults } = getResults()

    const wrongBySection: Record<string, { q: Question; ans: number | null; i: number }[]> = {}
    questions.forEach((q, i) => {
        if (answers[i] !== q.correctIndex) {
            wrongBySection[q.sectionId] ??= []
            wrongBySection[q.sectionId].push({ q, ans: answers[i], i })
        }
    })

    return (
        <div className={styles.summary}>
            <Link href="/study?tab=thi-thu" className={styles.backBtn}>
                <ArrowLeft size={14} /> Danh sách đề thi
            </Link>

            {/* Main score card */}
            <div className={styles.scoreCard}>
                <div className={styles.scoreTop}>
                    <span className={styles.resultBadge} data-passed={String(passed)}>
                        {passed ? "ĐẠT" : "CHƯA ĐẠT"}
                    </span>
                    <span className={styles.levelBadge} data-level={level}>{level}</span>
                </div>

                <div className={styles.scoreMain}>
                    <span className={styles.scoreNum}>{total}</span>
                    <span className={styles.scoreMax}>/180</span>
                </div>
                <p className={styles.scoreNote}>Điểm từ vựng + ngữ pháp · Ngưỡng đạt {cfg.passingDisplay}/180</p>

                {/* Per-section scores — all 3 sections including 聴解 */}
                <div className={styles.sectionScores}>
                    {cfg.infoRows.map((row, rowIdx) => {
                        const skipped   = !!row.skipped
                        const testedIdx = cfg.infoRows.slice(0, rowIdx).filter(r => !r.skipped).length
                        const score   = skipped ? null : testedIdx === 0 ? vocabScore   : grammarScore
                        const correct = skipped ? null : testedIdx === 0 ? vocabCorrect : grammarCorrect
                        const total   = skipped ? null : testedIdx === 0 ? vocabQs.length : grammarQs.length
                        const passed  = skipped ? null : testedIdx === 0 ? vocabPassed  : grammarPassed
                        return (
                            <div key={row.title} className={styles.sectionScoreRow}
                                data-skipped={skipped || undefined}
                                data-passed={passed !== null ? String(passed) : undefined}>
                                <div className={styles.sectionScoreInfo}>
                                    <span className={styles.sectionScoreTitle}>{row.title}</span>
                                    {!skipped && correct !== null && (
                                        <span className={styles.sectionScoreDetail}>{correct}/{total} câu đúng</span>
                                    )}
                                    {passed === false && <span className={styles.sectionFail}>Điểm liệt</span>}
                                </div>
                                <div className={styles.sectionScoreVal}>
                                    {skipped ? (
                                        <span className={styles.sectionScoreSkipped}>Không thi</span>
                                    ) : (
                                        <><span>{score}</span><small>/60</small></>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Stats row */}
                <div className={styles.statsRow}>
                    <div className={styles.stat}>
                        <span className={styles.statV}>{totalCorrect}</span>
                        <span className={styles.statL}>Câu đúng</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statV} data-red>{totalQ - totalCorrect}</span>
                        <span className={styles.statL}>Câu sai</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statV}>{Math.round(totalCorrect / totalQ * 100)}%</span>
                        <span className={styles.statL}>Chính xác</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statV}>{formatTime(timeTaken)}</span>
                        <span className={styles.statL}>Thời gian</span>
                    </div>
                </div>

                <div className={styles.scoreActions}>
                    <button className={styles.btnPrimary} onClick={() => setPhase("info")}>
                        <RotateCcw size={14} /> Thi lại
                    </button>
                    <Link href="/study?tab=thi-thu" className={styles.btnOutline}>Chọn đề khác</Link>
                </div>
            </div>

            {/* Per-group breakdown */}
            <div className={styles.breakdown}>
                {cfg.sections.map(sec => (
                    <div key={sec.id} className={styles.breakdownSection}>
                        <p className={styles.breakdownSectionTitle}>{sec.title}</p>
                        {groupResults.filter(g => sec.groups.some(sg => sg.id === g.id)).map(g => (
                            <div key={g.id} className={styles.breakdownGroup}>
                                <span className={styles.breakdownLabel}>{g.label}</span>
                                <span className={styles.breakdownSub}>{g.sublabel}</span>
                                <span className={styles.breakdownScore} data-ok={g.correct === g.total || undefined}>
                                    {g.correct}/{g.total}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Wrong items */}
            {cfg.sections.map(sec => {
                const wrongs = wrongBySection[sec.id] ?? []
                if (wrongs.length === 0) return null
                return (
                    <div key={sec.id} className={styles.wrongSection}>
                        <p className={styles.wrongTitle}>{sec.titleVi} — Câu sai ({wrongs.length})</p>
                        {wrongs.map(({ q, ans, i }) => (
                            <div key={i} className={styles.wrongItem}>
                                <div className={styles.wrongQ}>
                                    <span className={styles.wrongDisplay}>{q.display}</span>
                                    {q.reading && <span className={styles.wrongReading}>{q.reading}</span>}
                                </div>
                                <div className={styles.wrongAnswers}>
                                    <span className={styles.wrongCorrect}>✓ {q.options[q.correctIndex]}</span>
                                    {ans !== null && <span className={styles.wrongWrong}>✗ {q.options[ans]}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            })}
        </div>
    )
}
