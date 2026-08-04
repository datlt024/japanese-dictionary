"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, RotateCcw, ChevronRight } from "lucide-react"
import styles from "./MockExamClient.module.css"

// ── Types ──────────────────────────────────────────────────────────────

type QType = "kanji_reading" | "orthography" | "vocab_meaning" | "grammar_meaning"
type Phase = "info" | "loading" | "error" | "section_intro" | "question" | "summary"

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
        duration: 90 * 60,
        passingDisplay: "80",
        passing: { secMin: 19, total: 53 }, // 19/60 per section, 53/120 (≈80/180 scaled, no listening)
        infoRows: [
            { title: "文字・語彙", count: 21 },
            { title: "文法・読解", count: 22 },
            { title: "聴解",       count: 24, skipped: true },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（文字・語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 25,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "漢字の読み方", type: "kanji_reading", count: 8 },
                    { id: "q2", label: "問題2", sublabel: "漢字の書き方", type: "orthography",   count: 6 },
                    { id: "q3", label: "問題3", sublabel: "文脈規定",      type: "vocab_meaning", count: 7 },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 65,
                groups: [
                    { id: "q4", label: "問題1", sublabel: "文の文法1", type: "grammar_meaning", count: 16 },
                    { id: "q5", label: "問題2", sublabel: "文の文法2", type: "grammar_meaning", count: 6  },
                ],
            },
        ],
    },
    N4: {
        duration: 105 * 60,
        passingDisplay: "90",
        passing: { secMin: 19, total: 60 },
        infoRows: [
            { title: "文字・語彙",  count: 29 },
            { title: "文法・読解",  count: 26 },
            { title: "聴解",        count: 35, skipped: true },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（文字・語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 25,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "漢字の読み方",  type: "kanji_reading", count: 9  },
                    { id: "q2", label: "問題2", sublabel: "漢字の書き方",  type: "orthography",   count: 6  },
                    { id: "q3", label: "問題3", sublabel: "（　　）に入れるのに最もよいものを選んでください", type: "vocab_meaning", count: 10 },
                    { id: "q4", label: "問題4", sublabel: "____に意味が最も近いものを選んでください",          type: "vocab_meaning", count: 5  },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 55,
                groups: [
                    { id: "q5", label: "問題1", sublabel: "文の文法1",  type: "grammar_meaning", count: 15 },
                    { id: "q6", label: "問題2", sublabel: "文の文法2",  type: "grammar_meaning", count: 5  },
                    { id: "q7", label: "問題3", sublabel: "文章の文法", type: "grammar_meaning", count: 5  },
                ],
            },
        ],
    },
    N3: {
        duration: 105 * 60,
        passingDisplay: "95",
        passing: { secMin: 19, total: 63 },
        infoRows: [
            { title: "語彙",      count: 31 },
            { title: "文法・読解", count: 34 },
            { title: "聴解",      count: 37, skipped: true },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 30,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "漢字の読み方",   type: "kanji_reading", count: 8 },
                    { id: "q2", label: "問題2", sublabel: "漢字の書き方",   type: "orthography",   count: 6 },
                    { id: "q3", label: "問題3", sublabel: "語彙形成",        type: "vocab_meaning", count: 5 },
                    { id: "q4", label: "問題4", sublabel: "文脈規定",        type: "vocab_meaning", count: 7 },
                    { id: "q5", label: "問題5", sublabel: "言い換え類義",    type: "vocab_meaning", count: 5 },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 70,
                groups: [
                    { id: "q6", label: "問題1", sublabel: "文の文法1",  type: "grammar_meaning", count: 13 },
                    { id: "q7", label: "問題2", sublabel: "文の文法2",  type: "grammar_meaning", count: 5  },
                    { id: "q8", label: "問題3", sublabel: "文章の文法", type: "grammar_meaning", count: 5  },
                ],
            },
        ],
    },
    N2: {
        duration: 105 * 60,
        passingDisplay: "90",
        passing: { secMin: 19, total: 60 },
        infoRows: [
            { title: "語彙",       count: 27 },
            { title: "文法・読解",  count: 46 },
            { title: "聴解",        count: 35, skipped: true },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 40,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "漢字の読み方", type: "kanji_reading", count: 5 },
                    { id: "q2", label: "問題2", sublabel: "語彙形成",      type: "vocab_meaning", count: 5 },
                    { id: "q3", label: "問題3", sublabel: "文脈規定",      type: "vocab_meaning", count: 7 },
                    { id: "q4", label: "問題4", sublabel: "言い換え類義",  type: "vocab_meaning", count: 5 },
                    { id: "q5", label: "問題5", sublabel: "用法",          type: "vocab_meaning", count: 5 },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 65,
                groups: [
                    { id: "q6", label: "問題1", sublabel: "文の文法1",  type: "grammar_meaning", count: 12 },
                    { id: "q7", label: "問題2", sublabel: "文の文法2",  type: "grammar_meaning", count: 5  },
                    { id: "q8", label: "問題3", sublabel: "文章の文法", type: "grammar_meaning", count: 5  },
                ],
            },
        ],
    },
    N1: {
        duration: 110 * 60,
        passingDisplay: "100",
        passing: { secMin: 19, total: 67 },
        infoRows: [
            { title: "語彙",       count: 24 },
            { title: "文法・読解",  count: 46 },
            { title: "聴解",        count: 37, skipped: true },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 40,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "漢字の読み方", type: "kanji_reading", count: 6 },
                    { id: "q2", label: "問題2", sublabel: "文脈規定",      type: "vocab_meaning", count: 7 },
                    { id: "q3", label: "問題3", sublabel: "言い換え類義",  type: "vocab_meaning", count: 6 },
                    { id: "q4", label: "問題4", sublabel: "用法",          type: "vocab_meaning", count: 5 },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 70,
                groups: [
                    { id: "q5", label: "問題1", sublabel: "文の文法1",  type: "grammar_meaning", count: 10 },
                    { id: "q6", label: "問題2", sublabel: "文の文法2",  type: "grammar_meaning", count: 5  },
                    { id: "q7", label: "問題3", sublabel: "文章の文法", type: "grammar_meaning", count: 5  },
                ],
            },
        ],
    },
}

// ── Helpers ────────────────────────────────────────────────────────────

const LABELS = ["A", "B", "C", "D"] as const

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
                    ki++
                    if (!item) continue
                    const correct = item.kana!
                    const options = fisher([correct, ...pickOthers(allKana, correct)])
                    questions.push({ groupId: grp.id, sectionId: sec.id, type: grp.type, display: item.word, options, correctIndex: options.indexOf(correct) })

                } else if (grp.type === "orthography") {
                    const item = kanjiItems[ki % Math.max(kanjiItems.length, 1)]
                    ki++
                    if (!item) continue
                    const correct = item.word
                    const options = fisher([correct, ...pickOthers(allWords, correct)])
                    questions.push({ groupId: grp.id, sectionId: sec.id, type: grp.type, display: item.kana!, options, correctIndex: options.indexOf(correct) })

                } else if (grp.type === "vocab_meaning") {
                    const item = meaningItems[vi % Math.max(meaningItems.length, 1)]
                    vi++
                    if (!item || !item.meaning) continue
                    const correct = item.meaning
                    const options = fisher([correct, ...pickOthers(allMeanings, correct)])
                    questions.push({ groupId: grp.id, sectionId: sec.id, type: grp.type, display: item.word, reading: item.kana ?? undefined, options, correctIndex: options.indexOf(correct) })

                } else {
                    const item = grammar[gi % Math.max(grammar.length, 1)]
                    gi++
                    if (!item || !item.meaning) continue
                    const correct = item.meaning
                    const options = fisher([correct, ...pickOthers(allGrammar, correct)])
                    questions.push({ groupId: grp.id, sectionId: sec.id, type: grp.type, display: item.pattern, options, correctIndex: options.indexOf(correct) })
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

    const [phase,        setPhase]        = useState<Phase>("info")
    const [questions,    setQuestions]    = useState<Question[]>([])
    const [answers,      setAnswers]      = useState<(number | null)[]>([])
    const [idx,          setIdx]          = useState(0)
    const [selected,     setSelected]     = useState<number | null>(null)
    const [sectionIdx,   setSectionIdx]   = useState(0)   // which section intro we're on
    const [timeLeft,     setTimeLeft]     = useState(cfg.duration)
    const [timeTaken,    setTimeTaken]    = useState(0)

    const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
    const startRef  = useRef(0)
    const advRef    = useRef(false)

    // ── Data loading ──────────────────────────────────────────────────

    const load = useCallback((mounted: { v: boolean }) => {
        const grammarCount = cfg.sections.flatMap(s => s.groups).filter(g => g.type === "grammar_meaning").reduce((a, g) => a + g.count, 0)
        Promise.all([
            fetch(`/api/study/jlpt?level=${level}&limit=100`).then(r => r.json()),
            fetch(`/api/study/grammar?level=${level}&limit=${Math.min(grammarCount * 4, 100)}`).then(r => r.json()),
        ]).then(([vocab, grammar]) => {
            if (!mounted.v) return
            const qs = buildQuestions(vocab as VocabItem[], grammar as GrammarItem[], cfg.sections)
            if (qs.length < 5) { setPhase("error"); return }
            setQuestions(qs)
            setAnswers(new Array(qs.length).fill(null))
            setIdx(0); setSectionIdx(0); setSelected(null)
            setTimeLeft(cfg.duration)
            advRef.current = false
            setPhase("section_intro")
        }).catch(() => { if (mounted.v) setPhase("error") })
    }, [level, cfg])

    const startExam = useCallback(() => {
        const mounted = { v: true }
        setPhase("loading")
        load(mounted)
    }, [load])

    // ── Timer (single, starts on first "Bắt đầu", runs until summary) ──

    const finish = useCallback(() => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
        setTimeTaken(Math.round((Date.now() - startRef.current) / 1000))
        setPhase("summary")
    }, [])

    const startTimer = useCallback(() => {
        if (timerRef.current) return
        startRef.current = Date.now()
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { finish(); return 0 }
                return t - 1
            })
        }, 1000)
    }, [finish])

    useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

    // ── Section intro handler ─────────────────────────────────────────

    const handleStartSection = useCallback(() => {
        startTimer()
        setPhase("question")
    }, [startTimer])

    // ── Answer handler ────────────────────────────────────────────────

    const handleSelect = useCallback((optIdx: number) => {
        if (selected !== null || advRef.current || phase !== "question") return
        advRef.current = true
        setSelected(optIdx)
        setAnswers(prev => { const n = [...prev]; n[idx] = optIdx; return n })

        setTimeout(() => {
            const next = idx + 1
            if (next >= questions.length) { finish(); return }

            const nextSec = questions[next].sectionId
            const currSec = questions[idx].sectionId
            if (nextSec !== currSec) {
                const nextSecIdx = cfg.sections.findIndex(s => s.id === nextSec)
                setIdx(next); setSectionIdx(nextSecIdx)
                setSelected(null); advRef.current = false
                setPhase("section_intro")
            } else {
                setIdx(next); setSelected(null); advRef.current = false
            }
        }, 900)
    }, [selected, idx, questions, cfg.sections, phase, finish])

    // ── Keyboard ──────────────────────────────────────────────────────

    useEffect(() => {
        if (phase !== "question") return
        const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, "1": 0, "2": 1, "3": 2, "4": 3 }
        const fn = (e: KeyboardEvent) => { const i = map[e.key.toLowerCase()]; if (i !== undefined) handleSelect(i) }
        window.addEventListener("keydown", fn)
        return () => window.removeEventListener("keydown", fn)
    }, [phase, handleSelect])

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

    // ── Render: section intro ─────────────────────────────────────────

    if (phase === "section_intro") {
        const sec = cfg.sections[sectionIdx]
        const isFirst = sectionIdx === 0
        const secQCount = questions.filter(q => q.sectionId === sec.id).length

        return (
            <div className={styles.introWrap}>
                <Link href="/study?tab=thi-thu" className={styles.backBtn}>
                    <ArrowLeft size={14} /> Danh sách đề thi
                </Link>

                <div className={styles.introCard}>
                    <div className={styles.introMeta}>
                        <span className={styles.introBadge} data-level={level}>{level}</span>
                        {!isFirst && (
                            <span className={styles.timerPill}>
                                <Clock size={12} /> {formatTime(timeLeft)}
                            </span>
                        )}
                    </div>
                    <p className={styles.introSection}>Phần {sectionIdx + 1} / {cfg.sections.length}</p>
                    <h2 className={styles.introTitle}>{sec.title}</h2>
                    <p className={styles.introTitleVi}>{sec.titleVi}</p>

                    <div className={styles.introDivider} />

                    <div className={styles.introGroups}>
                        {sec.groups.map(g => (
                            <div key={g.id} className={styles.introGroup}>
                                <span className={styles.introGroupLabel}>{g.label}</span>
                                <span className={styles.introGroupSub}>{g.sublabel}</span>
                                <span className={styles.introGroupCount}>{g.count} câu</span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.introFooter}>
                        <span className={styles.introTotal}>{secQCount} câu hỏi</span>
                        {isFirst && <span className={styles.introTime}>Tổng thời gian: {formatTime(cfg.duration)}</span>}
                    </div>

                    <button className={styles.btnStart} onClick={handleStartSection}>
                        {isFirst ? "Bắt đầu thi" : "Tiếp tục"}
                        <ChevronRight size={16} />
                    </button>
                </div>

                <p className={styles.introNote}>
                    * Bài thi bao gồm phần <strong>Ngôn ngữ</strong> (từ vựng + ngữ pháp). Không có phần nghe và đọc hiểu.
                </p>
            </div>
        )
    }

    // ── Render: question ──────────────────────────────────────────────

    if (phase === "question") {
        const q   = questions[idx]
        if (!q) return null

        const sec = cfg.sections.find(s => s.id === q.sectionId)!
        const grp = sec.groups.find(g => g.id === q.groupId)!
        const grpQs = questions.map((qq, i) => ({ qq, i })).filter(({ qq }) => qq.groupId === grp.id)
        const posInGrp  = grpQs.findIndex(({ i }) => i === idx) + 1
        const progress  = (idx / questions.length) * 100
        const warn      = timeLeft < 60

        return (
            <div className={styles.exam}>
                {/* Header */}
                <div className={styles.examHeader}>
                    <Link href="/study?tab=thi-thu" className={styles.exitBtn}>
                        <ArrowLeft size={14} />
                    </Link>
                    <div className={styles.headerCenter}>
                        <span className={styles.groupLabel} data-level={level}>{grp.label}</span>
                        <span className={styles.groupSub}>{grp.sublabel}</span>
                    </div>
                    <div className={styles.headerRight}>
                        <span className={styles.posText}>{posInGrp}/{grp.count}</span>
                        <span className={styles.timer} data-warn={warn || undefined}>
                            <Clock size={11} /> {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                {/* Progress */}
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} data-level={level} style={{ width: `${progress}%` }} />
                </div>

                {/* Body */}
                <div className={styles.body}>
                    <div className={styles.questionCard}>
                        <div className={styles.wordBlock} data-type={q.type}>
                            <span className={styles.wordDisplay}>{q.display}</span>
                            {q.reading && q.reading !== q.display && (
                                <span className={styles.wordReading}>{q.reading}</span>
                            )}
                        </div>
                        <p className={styles.qNote}>
                            {q.type === "kanji_reading"  && "この言葉の読み方は？"}
                            {q.type === "orthography"    && "このひらがなの書き方は？"}
                            {q.type === "vocab_meaning"  && "この言葉の意味は？"}
                            {q.type === "grammar_meaning"&& "この文型の意味は？"}
                        </p>
                    </div>

                    <div className={styles.options}>
                        {q.options.map((opt, i) => {
                            let state = "default"
                            if (selected !== null) {
                                if (i === q.correctIndex) state = "correct"
                                else if (i === selected)  state = "wrong"
                                else                      state = "dim"
                            }
                            return (
                                <button
                                    key={i}
                                    className={styles.option}
                                    data-state={state}
                                    onClick={() => handleSelect(i)}
                                    disabled={selected !== null}
                                >
                                    <span className={styles.optLabel}>{LABELS[i]}</span>
                                    <span className={styles.optText}>{opt}</span>
                                </button>
                            )
                        })}
                    </div>

                    <p className={styles.keyHint}>Nhấn A B C D hoặc 1 2 3 4 để chọn</p>
                </div>
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
                    <span className={styles.scoreMax}>/120</span>
                </div>
                <p className={styles.scoreNote}>Điểm tổng hợp (語彙 + 文法)</p>

                {/* Per-section scores */}
                <div className={styles.sectionScores}>
                    <div className={styles.sectionScore} data-passed={String(vocabPassed)}>
                        <p className={styles.sectionScoreTitle}>語彙 · Từ vựng</p>
                        <div className={styles.sectionScoreVal}>
                            <span>{vocabScore}</span><small>/60</small>
                        </div>
                        <p className={styles.sectionScoreDetail}>{vocabCorrect}/{vocabQs.length} câu đúng</p>
                        {!vocabPassed && <p className={styles.sectionFail}>Chưa đạt tối thiểu 19 điểm</p>}
                    </div>
                    <div className={styles.sectionScore} data-passed={String(grammarPassed)}>
                        <p className={styles.sectionScoreTitle}>文法 · Ngữ pháp</p>
                        <div className={styles.sectionScoreVal}>
                            <span>{grammarScore}</span><small>/60</small>
                        </div>
                        <p className={styles.sectionScoreDetail}>{grammarCorrect}/{grammarQs.length} câu đúng</p>
                        {!grammarPassed && <p className={styles.sectionFail}>Chưa đạt tối thiểu 19 điểm</p>}
                    </div>
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
