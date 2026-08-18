"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, RotateCcw, X, Play, Pause } from "lucide-react"
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
import { formatTime, parseSentence, buildQuestions, score60 } from "./exam-utils"
import ExamInfoScreen           from "./ExamInfoScreen"
import ExamBreakScreen          from "./ExamBreakScreen"

export default function MockExamClient({ level, year }: { level: string; year?: string }) {
    const router = useRouter()
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
    const allGroups = cfg.sections.flatMap(s => s.groups)

    const [phase,              setPhase]              = useState<Phase>("info")
    const [questions,          setQuestions]          = useState<Question[]>([])
    const [answers,            setAnswers]            = useState<(number | null)[]>([])
    const [idx,                setIdx]                = useState(0)
    const [timeLeft,           setTimeLeft]           = useState(0)
    const [timeTaken,          setTimeTaken]          = useState(0)
    const [languageTimeTaken,  setLanguageTimeTaken]  = useState(0)

    const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null)
    const startRef     = useRef(0)
    const endTimeRef   = useRef(0)
    const questionRefs = useRef<(HTMLDivElement | null)[]>([])
    const audioRef     = useRef<HTMLAudioElement>(null)

    const [audioStarted,  setAudioStarted]  = useState(false)
    const [audioEnded,    setAudioEnded]    = useState(false)
    const [audioTime,     setAudioTime]     = useState(0)
    const [audioDuration, setAudioDuration] = useState(0)
    const [showReview,        setShowReview]        = useState(false)
    const [reviewPlayingGi,   setReviewPlayingGi]   = useState<number | null>(null)
    const [reviewIsPaused,    setReviewIsPaused]    = useState(false)
    const [reviewCurrentTime, setReviewCurrentTime] = useState(0)
    const reviewPlayingGiRef = useRef<number | null>(null)

    const startAudio = useCallback(() => { audioRef.current?.play() }, [])

    // ── Timer ──────────────────────────────────────────────────────────

    const startTimer = useCallback((totalMin: number) => {
        startRef.current = Date.now()
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

    // ── Data loading ───────────────────────────────────────────────────

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const load = useCallback((mounted: { v: boolean }) => {
        const staticExams: Record<string, Question[]> = {
            "N5":       N5_QUESTIONS_WITH_LISTENING as Question[],
            "N5-2021":  N5_2021_QUESTIONS  as Question[],
            "N5-2024":  N5_2024_QUESTIONS  as Question[],
            "N4":       N4_2021_QUESTIONS  as Question[],
            "N3-7-2021":  N3_7_2021_QUESTIONS  as Question[],
            "N3-12-2021": N3_12_2021_QUESTIONS as Question[],
            "N3-7-2022":  N3_7_2022_QUESTIONS  as Question[],
            "N3-12-2022": N3_12_2022_QUESTIONS as Question[],
            "N3-7-2023":  N3_7_2023_QUESTIONS  as Question[],
            "N3-12-2023": N3_12_2023_QUESTIONS as Question[],
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

        const totalMin = cfg.sections.reduce((acc, s) => acc + s.allocMin, 0)
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

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
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

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const startListening = useCallback(() => {
        const listeningMin = cfg.sections.find(s => s.id === "listening")?.allocMin ?? 30
        startRef.current = Date.now()
        startTimer(listeningMin)
        const firstIdx = questions.findIndex(q => q.sectionId === "listening")
        setIdx(Math.max(0, firstIdx))
        setPhase("listening")
    }, [cfg.sections, startTimer, questions])

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const startExam = useCallback(() => {
        stopTimer()
        setAudioStarted(false); setAudioEnded(false)
        setAudioTime(0); setAudioDuration(0)
        setLanguageTimeTaken(0); setShowReview(false)
        setReviewPlayingGi(null); setTimeTaken(0)
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
        const block = (e: Event) => e.preventDefault()
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

    // ── Handlers ───────────────────────────────────────────────────────

    const handleSelect = useCallback((qIdx: number, optIdx: number) => {
        setAnswers(prev => { const n = [...prev]; n[qIdx] = optIdx; return n })
        setIdx(qIdx)
    }, [])

    const scrollToQuestion = useCallback((qIdx: number) => {
        setIdx(qIdx)
        questionRefs.current[qIdx]?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, [])

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

    // ── Results ────────────────────────────────────────────────────────

    function getResults() {
        const correctIn = (qs: Question[]) => qs.filter(q => answers[questions.indexOf(q)] === q.correctIndex).length

        const vocabQs      = questions.filter(q => q.sectionId === "vocab")
        const grammarQs    = questions.filter(q => q.sectionId === "grammar")
        const listeningQs  = questions.filter(q => q.sectionId === "listening")

        const vocabCorrect     = correctIn(vocabQs)
        const grammarCorrect   = correctIn(grammarQs)
        const listeningCorrect = correctIn(listeningQs)

        const vocabScore     = score60(vocabCorrect,     vocabQs.length)
        const grammarScore   = score60(grammarCorrect,   grammarQs.length)
        const listeningScore = score60(listeningCorrect, listeningQs.length)

        const total = vocabScore + grammarScore + listeningScore

        const vocabPassed     = vocabQs.length     === 0 || vocabScore     >= cfg.passing.secMin
        const grammarPassed   = grammarQs.length   === 0 || grammarScore   >= cfg.passing.secMin
        const listeningPassed = listeningQs.length === 0 || listeningScore >= cfg.passing.secMin
        const passed = total >= cfg.passing.total && vocabPassed && grammarPassed && listeningPassed

        const totalCorrect = vocabCorrect + grammarCorrect + listeningCorrect
        const totalQ       = questions.length

        const groupResults = allGroups.map(grp => {
            const grpQs = questions.map((q, i) => ({ q, i })).filter(({ q }) => q.groupId === grp.id)
            const correct = grpQs.filter(({ q, i }) => answers[i] === q.correctIndex).length
            return { ...grp, correct, total: grpQs.length }
        })

        return { vocabCorrect, grammarCorrect, listeningCorrect, vocabQs, grammarQs, listeningQs,
                 vocabScore, grammarScore, listeningScore, total, vocabPassed, grammarPassed,
                 listeningPassed, passed, totalCorrect, totalQ, groupResults }
    }

    // ── Render: info ───────────────────────────────────────────────────

    if (phase === "info") {
        return <ExamInfoScreen level={level} cfg={cfg} startExam={startExam} />
    }

    // ── Render: loading / error ────────────────────────────────────────

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

    // ── Render: question / listening ───────────────────────────────────

    if (phase === "question" || phase === "listening") {
        const isListeningPhase = phase === "listening"

        const phaseSections = cfg.listeningAudio
            ? cfg.sections.filter(s => isListeningPhase ? s.id === "listening" : s.id !== "listening")
            : cfg.sections

        const phaseQsWithIdx = questions
            .map((q, gi) => ({ q, gi }))
            .filter(({ q }) => !cfg.listeningAudio || (isListeningPhase === (q.sectionId === "listening")))

        const answeredCount = phaseQsWithIdx.filter(({ gi }) => answers[gi] !== null).length
        const unanswered = phaseQsWithIdx.length - answeredCount
        const progress = phaseQsWithIdx.length > 0 ? (answeredCount / phaseQsWithIdx.length) * 100 : 0
        const warn = timeLeft < 60

        const handleExit = () => {
            if (!window.confirm("Thoát khỏi bài thi? Tiến trình sẽ không được lưu.")) return
            router.push("/study?tab=thi-thu")
        }

        const handleFinish = () => {
            if (unanswered > 0 && !window.confirm(`Còn ${unanswered} câu chưa trả lời. Xác nhận nộp bài?`)) return
            finish()
        }

        return (
            <div className={styles.examPage}>
                <div className={styles.examTopBar}>
                    <button className={styles.examExitBtn} onClick={handleExit}>
                        <X size={14} /> Thoát
                    </button>
                    <div className={styles.examBarCenter}>
                        <span className={styles.examBarTitle}>
                            JLPT {level}{cfg.subtitle ? ` · ${cfg.subtitle}` : ""}
                            {isListeningPhase && " — 聴解"}
                        </span>
                        <span className={styles.examBarTimer} data-warn={warn || undefined}>
                            <Clock size={12} /> {formatTime(timeLeft)}
                        </span>
                    </div>
                    <button className={styles.examSubmitBtn} onClick={handleFinish}>
                        {cfg.listeningAudio && !isListeningPhase ? "Sang phần Nghe →" : "Nộp bài"}
                    </button>
                </div>

                <div className={styles.progressBar}>
                    <div className={styles.progressFill} data-level={level} style={{ width: `${progress}%` }} />
                </div>

                <div className={styles.examBody}>
                    <div className={styles.questionsPanel}>
                        {phaseSections.map(sec => {
                            const isSkippedSec = sec.groups.every(g => g.skipped)
                            const secQs = questions.map((q, gi) => ({ q, gi })).filter(({ q }) => q.sectionId === sec.id)
                            if (!isSkippedSec && secQs.length === 0) return null

                            let secOffset = 0
                            return (
                                <div key={sec.id} className={styles.qSectionBlock}>
                                    <div className={styles.qSectionHeader} data-skipped={isSkippedSec || undefined}>
                                        <span className={styles.qSectionTitle}>{sec.title}</span>
                                        <span className={styles.qSectionCount}>
                                            {isSkippedSec ? "Không thi" : `${secQs.length} câu`}
                                        </span>
                                    </div>

                                    {sec.id === "listening" && cfg.listeningAudio && (
                                        <div className={styles.audioPlayer}>
                                            <audio
                                                ref={audioRef}
                                                src={cfg.listeningAudio}
                                                onTimeUpdate={() => setAudioTime(audioRef.current?.currentTime ?? 0)}
                                                onDurationChange={() => setAudioDuration(audioRef.current?.duration ?? 0)}
                                                onPlay={() => setAudioStarted(true)}
                                                onEnded={() => setAudioEnded(true)}
                                            />
                                            {!audioStarted ? (
                                                <button className={styles.audioPlayBtn} onClick={startAudio}>
                                                    <Play size={15} fill="currentColor" />
                                                </button>
                                            ) : (
                                                <span className={styles.audioStatusDot} data-ended={audioEnded || undefined} />
                                            )}
                                            <span className={styles.audioTimestamp}>
                                                {audioEnded ? "Đã kết thúc" : audioStarted ? "Đang phát..." : "Bắt đầu nghe"}
                                            </span>
                                            <div className={styles.audioSeekTrack}>
                                                <div
                                                    className={styles.audioSeekFill}
                                                    style={{ width: audioDuration > 0 ? `${(audioTime / audioDuration) * 100}%` : "0%" }}
                                                />
                                            </div>
                                            <span className={styles.audioTimestamp}>
                                                {formatTime(Math.floor(audioTime))} / {formatTime(Math.floor(audioDuration))}
                                            </span>
                                        </div>
                                    )}

                                    {sec.groups.map(grp => {
                                        if (grp.skipped) {
                                            return (
                                                <div key={grp.id} className={styles.qGroupBlock}>
                                                    <div className={styles.qGroupHeader}>
                                                        <span className={styles.qGroupLabel}>{grp.label}</span>
                                                        <span className={styles.qGroupSub}>{grp.sublabel}</span>
                                                    </div>
                                                    <div className={styles.qGroupSkipped}>
                                                        <span>🔇</span>
                                                        <span>Phần này yêu cầu audio — không có trong bài thi thử</span>
                                                    </div>
                                                </div>
                                            )
                                        }

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
                                                    const isListeningQ = q.type === "listening_pic" || q.type === "listening_text" || q.type === "listening_scene"
                                                    const prevContext = pos > 0 ? grpQs[pos - 1].q.context : undefined
                                                    const showContext = q.context != null && q.context !== prevContext
                                                    return (
                                                        <React.Fragment key={gi}>
                                                            {showContext && (
                                                                <div className={styles.qContext} dangerouslySetInnerHTML={{ __html: q.context! }} />
                                                            )}
                                                            <div
                                                                id={`q-${gi}`}
                                                                ref={el => { questionRefs.current[gi] = el }}
                                                                className={styles.qItem}
                                                                data-active={idx === gi || undefined}
                                                                data-type={q.type}
                                                                onClick={() => setIdx(gi)}
                                                            >
                                                                <div className={styles.qItemHead}>
                                                                    <span className={styles.qNum}>{grpOffset + pos + 1}</span>
                                                                    <div className={styles.qWordInline}>
                                                                        {isListeningQ ? (
                                                                            cfg.listeningAudio ? (
                                                                                <span className={styles.qListenLabel}>{q.display}</span>
                                                                            ) : (
                                                                                <button
                                                                                    className={styles.qListenPlayBtn}
                                                                                    data-ready={!!q.audioSrc || undefined}
                                                                                    disabled={!q.audioSrc}
                                                                                    onClick={e => e.stopPropagation()}
                                                                                >
                                                                                    <Play size={13} fill="currentColor" />
                                                                                    {q.audioSrc ? "Phát âm thanh" : "Chưa có âm thanh"}
                                                                                </button>
                                                                            )
                                                                        ) : (q.type === "kanji_reading" || q.type === "kanji_writing") ? (
                                                                            <p className={styles.qSentence}>
                                                                                {q.sentence ? parseSentence(q.sentence) : q.display}
                                                                            </p>
                                                                        ) : q.type === "context_vocab" ? (
                                                                            q.sentence ? (
                                                                                <p className={styles.qSentence}>{parseSentence(q.sentence)}</p>
                                                                            ) : (
                                                                                <>
                                                                                    <span className={styles.qVocabWord}>{q.display}</span>
                                                                                    {q.reading && <span className={styles.qVocabReading}>{q.reading}</span>}
                                                                                </>
                                                                            )
                                                                        ) : (
                                                                            q.sentence ? (
                                                                                <p className={styles.qSentence}>{parseSentence(q.sentence)}</p>
                                                                            ) : (
                                                                                <span className={styles.qGrammarWord}>{q.display}</span>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {q.type === "listening_scene" && (
                                                                    q.imageSrc ? (
                                                                        <div className={styles.qPicThumb}>
                                                                            <Image src={q.imageSrc} alt={`Hình câu ${q.display}`} width={800} height={600} className={styles.qPic4ImgFull} />
                                                                        </div>
                                                                    ) : (
                                                                        <div className={styles.qSceneImg}>
                                                                            <span className={styles.qSceneLabel}>Hình minh họa</span>
                                                                        </div>
                                                                    )
                                                                )}

                                                                {q.type === "listening_pic" && q.imageSrc ? (
                                                                    <>
                                                                        <div className={styles.qPicThumb}>
                                                                            <Image src={q.imageSrc} alt={`Hình câu ${q.display}`} width={800} height={600} className={styles.qPic4ImgFull} />
                                                                        </div>
                                                                        <div className={styles.qOptions}>
                                                                            {[1,2,3,4].map((num, oi) => {
                                                                                const isSel = answers[gi] === oi
                                                                                return (
                                                                                    <label key={oi} className={styles.qOption} data-selected={isSel || undefined}
                                                                                        onClick={e => { e.stopPropagation(); handleSelect(gi, oi) }}>
                                                                                        <span className={styles.qRadio} data-selected={isSel || undefined} />
                                                                                        <span className={styles.qOptText}>{num}</span>
                                                                                    </label>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className={styles.qOptions} data-grid={isKanjiType || undefined}>
                                                                        {q.options.map((opt, oi) => {
                                                                            const isSel = answers[gi] === oi
                                                                            return (
                                                                                <label key={oi} className={styles.qOption} data-selected={isSel || undefined}
                                                                                    onClick={e => { e.stopPropagation(); handleSelect(gi, oi) }}>
                                                                                    <span className={styles.qRadio} data-selected={isSel || undefined} />
                                                                                    <span className={styles.qOptNum}>{oi + 1}</span>
                                                                                    <span className={styles.qOptText}>{opt}</span>
                                                                                </label>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </React.Fragment>
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

                    <div className={styles.navPanel}>
                        <p className={styles.navStat}>
                            <span data-done>{answeredCount}</span>/{phaseQsWithIdx.length} đã trả lời
                        </p>
                        {phaseSections.map(sec => {
                            const secQs = phaseQsWithIdx.filter(({ q }) => q.sectionId === sec.id)
                            if (secQs.length === 0) return null
                            return (
                                <div key={sec.id} className={styles.navSection}>
                                    <p className={styles.navSectionTitle}>{sec.title}</p>
                                    <div className={styles.navGrid}>
                                        {secQs.map(({ gi }, localIdx) => (
                                            <button key={gi} className={styles.navBtn}
                                                data-answered={answers[gi] !== null || undefined}
                                                data-current={idx === gi || undefined}
                                                data-level={answers[gi] !== null ? level : undefined}
                                                onClick={() => scrollToQuestion(gi)}>
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

    // ── Render: break ──────────────────────────────────────────────────

    if (phase === "break") {
        return (
            <ExamBreakScreen
                cfg={cfg}
                startListening={startListening}
                goToSummary={() => setPhase("summary")}
            />
        )
    }

    // ── Compute results ────────────────────────────────────────────────

    const { vocabCorrect, grammarCorrect, listeningCorrect,
            vocabQs, grammarQs, listeningQs,
            vocabScore, grammarScore, listeningScore, total,
            vocabPassed, grammarPassed, listeningPassed,
            passed, totalCorrect, totalQ } = getResults()

    const maxScore = (vocabQs.length > 0 ? 60 : 0) + (grammarQs.length > 0 ? 60 : 0) + (listeningQs.length > 0 ? 60 : 0)
    const scoreLabel = listeningQs.length > 0 && vocabQs.length > 0
        ? "Tổng điểm"
        : listeningQs.length > 0
        ? "Điểm nghe hiểu"
        : "Điểm từ vựng + ngữ pháp"
    const totalTimeTaken = languageTimeTaken + timeTaken

    // ── Render: review ─────────────────────────────────────────────────

    if (showReview) {
        const handleReviewPlay = (gi: number, q: Question) => {
            const el = audioRef.current
            if (!el || !cfg.listeningAudio) return

            if (reviewPlayingGiRef.current === gi) {
                if (!el.paused) {
                    el.pause(); setReviewIsPaused(true)
                } else {
                    el.play().catch(() => {}); setReviewIsPaused(false)
                }
                return
            }

            el.pause()
            reviewPlayingGiRef.current = gi
            setReviewPlayingGi(gi)
            setReviewIsPaused(false)
            const start = q.audioStart ?? 0
            el.addEventListener('seeked', () => {
                if (reviewPlayingGiRef.current === gi) el.play().catch(() => {})
            }, { once: true })
            el.currentTime = start
        }

        return (
            <div className={styles.examPage}>
                <div className={styles.examTopBar}>
                    <button className={styles.examExitBtn} onClick={() => {
                        audioRef.current?.pause()
                        reviewPlayingGiRef.current = null
                        setReviewPlayingGi(null); setReviewIsPaused(false); setShowReview(false)
                    }}>
                        <ArrowLeft size={14} /> Quay lại kết quả
                    </button>
                    <span className={styles.examBarTitle}>
                        JLPT {level}{cfg.subtitle ? ` · ${cfg.subtitle}` : ""} — Xem đáp án
                    </span>
                    <div style={{ width: 90 }} />
                </div>

                <div className={styles.examBody}>
                    <div className={styles.questionsPanel}>
                        {cfg.listeningAudio && (
                            <audio
                                ref={audioRef}
                                src={cfg.listeningAudio}
                                preload="auto"
                                onTimeUpdate={() => {
                                    const gi = reviewPlayingGiRef.current
                                    if (gi === null || !audioRef.current) return
                                    const pq = questions[gi]
                                    const el = audioRef.current
                                    setReviewCurrentTime(el.currentTime)
                                    if (pq?.audioStart !== undefined && el.currentTime < pq.audioStart) {
                                        el.currentTime = pq.audioStart; return
                                    }
                                    if (pq?.audioEnd !== undefined && el.currentTime >= pq.audioEnd) {
                                        el.pause()
                                        reviewPlayingGiRef.current = null
                                        setReviewPlayingGi(null); setReviewIsPaused(false); setReviewCurrentTime(0)
                                    }
                                }}
                                onEnded={() => { reviewPlayingGiRef.current = null; setReviewPlayingGi(null); setReviewIsPaused(false) }}
                            />
                        )}

                        {cfg.sections.map(sec => {
                            const secQsWithIdx = questions.map((q, gi) => ({ q, gi })).filter(({ q }) => q.sectionId === sec.id)
                            if (secQsWithIdx.length === 0) return null

                            let secOffset = 0
                            return (
                                <div key={sec.id} className={styles.qSectionBlock}>
                                    <div className={styles.qSectionHeader}>
                                        <span className={styles.qSectionTitle}>{sec.title}</span>
                                        <span className={styles.qSectionCount}>{secQsWithIdx.length} câu</span>
                                    </div>

                                    {sec.groups.map(grp => {
                                        const grpQs = secQsWithIdx.filter(({ q }) => q.groupId === grp.id)
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
                                                    const ans = answers[gi]
                                                    const isCorrect = ans === q.correctIndex
                                                    const isSkipped = ans === null
                                                    const isKanjiType = q.type === "kanji_reading" || q.type === "kanji_writing"
                                                    const prevContext = pos > 0 ? grpQs[pos - 1].q.context : undefined
                                                    const showContext = q.context != null && q.context !== prevContext

                                                    return (
                                                        <React.Fragment key={gi}>
                                                            {showContext && (
                                                                <div className={styles.qContext} dangerouslySetInnerHTML={{ __html: q.context! }} />
                                                            )}
                                                            <div id={`rev-${gi}`} ref={el => { questionRefs.current[gi] = el }}
                                                                className={styles.qItem} data-readonly>
                                                                <div className={styles.qItemHead}>
                                                                    <span className={styles.qNum}>{grpOffset + pos + 1}</span>
                                                                    <div className={styles.qWordInline}>
                                                                        {(q.type === "listening_pic" || q.type === "listening_text" || q.type === "listening_scene") ? (
                                                                            <span className={styles.qListenLabel}>{q.display}</span>
                                                                        ) : (q.type === "kanji_reading" || q.type === "kanji_writing") ? (
                                                                            <p className={styles.qSentence}>
                                                                                {q.sentence ? parseSentence(q.sentence) : q.display}
                                                                            </p>
                                                                        ) : q.type === "context_vocab" ? (
                                                                            q.sentence ? (
                                                                                <p className={styles.qSentence}>{parseSentence(q.sentence)}</p>
                                                                            ) : (
                                                                                <>
                                                                                    <span className={styles.qVocabWord}>{q.display}</span>
                                                                                    {q.reading && <span className={styles.qVocabReading}>{q.reading}</span>}
                                                                                </>
                                                                            )
                                                                        ) : (
                                                                            q.sentence ? (
                                                                                <p className={styles.qSentence}>{parseSentence(q.sentence)}</p>
                                                                            ) : (
                                                                                <span className={styles.qGrammarWord}>{q.display}</span>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                    <span className={styles.reviewResultTag}
                                                                        data-correct={isSkipped ? undefined : String(isCorrect)}
                                                                        data-skipped={isSkipped || undefined}>
                                                                        {isSkipped ? "Bỏ trống" : isCorrect ? "✓ Đúng" : "✗ Sai"}
                                                                    </span>
                                                                </div>

                                                                {cfg.listeningAudio && q.audioStart !== undefined && q.audioEnd !== undefined && (
                                                                    <button className={styles.reviewPlayBtn}
                                                                        data-playing={reviewPlayingGi === gi && !reviewIsPaused || undefined}
                                                                        style={{ '--progress': reviewPlayingGi === gi && (q.audioEnd - q.audioStart) > 0 ? `${Math.min(100, Math.max(0, (reviewCurrentTime - q.audioStart) / (q.audioEnd - q.audioStart) * 100))}%` : '0%' } as React.CSSProperties}
                                                                        onClick={() => handleReviewPlay(gi, q)}>
                                                                        {reviewPlayingGi === gi && !reviewIsPaused
                                                                            ? <><Pause size={12} fill="currentColor" /> Tạm dừng</>
                                                                            : reviewPlayingGi === gi && reviewIsPaused
                                                                            ? <><Play  size={12} fill="currentColor" /> Tiếp tục</>
                                                                            : <><Play  size={12} fill="currentColor" /> Nghe lại</>
                                                                        }
                                                                    </button>
                                                                )}

                                                                {q.type === "listening_scene" && q.imageSrc && (
                                                                    <div className={styles.qPicThumb}>
                                                                        <Image src={q.imageSrc} alt={`Hình câu ${q.display}`} width={800} height={600} className={styles.qPic4ImgFull} />
                                                                    </div>
                                                                )}

                                                                {q.type === "listening_pic" && q.imageSrc ? (
                                                                    <>
                                                                        <div className={styles.qPicThumb}>
                                                                            <Image src={q.imageSrc} alt={`Hình câu ${q.display}`} width={800} height={600} className={styles.qPic4ImgFull} />
                                                                        </div>
                                                                        <div className={styles.qOptions}>
                                                                            {[1,2,3,4].map((num, oi) => {
                                                                                const isCor   = oi === q.correctIndex
                                                                                const isWrong = ans !== null && ans !== q.correctIndex && oi === ans
                                                                                return (
                                                                                    <div key={oi} className={styles.qOption}
                                                                                        data-review-correct={isCor || undefined}
                                                                                        data-review-wrong={isWrong || undefined}>
                                                                                        <span className={styles.reviewRadio} data-correct={isCor || undefined} data-wrong={isWrong || undefined} />
                                                                                        <span className={styles.qOptText}>{num}</span>
                                                                                        {isCor   && <span className={styles.reviewOptMark} data-correct>✓</span>}
                                                                                        {isWrong && <span className={styles.reviewOptMark} data-wrong>✗</span>}
                                                                                    </div>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className={styles.qOptions} data-grid={isKanjiType || undefined}>
                                                                        {q.options.map((opt, oi) => {
                                                                            const isCor   = oi === q.correctIndex
                                                                            const isWrong = ans !== null && ans !== q.correctIndex && oi === ans
                                                                            return (
                                                                                <div key={oi} className={styles.qOption}
                                                                                    data-review-correct={isCor || undefined}
                                                                                    data-review-wrong={isWrong || undefined}>
                                                                                    <span className={styles.reviewRadio} data-correct={isCor || undefined} data-wrong={isWrong || undefined} />
                                                                                    <span className={styles.qOptNum}>{oi + 1}</span>
                                                                                    <span className={styles.qOptText}>{opt}</span>
                                                                                    {isCor   && <span className={styles.reviewOptMark} data-correct>✓</span>}
                                                                                    {isWrong && <span className={styles.reviewOptMark} data-wrong>✗</span>}
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                )}

                                                                {q.script && (
                                                                    <div className={styles.reviewScript}>
                                                                        <span className={styles.reviewScriptLabel}>スクリプト</span>
                                                                        <p className={styles.reviewScriptText}>{q.script}</p>
                                                                    </div>
                                                                )}
                                                                {q.explanation && (
                                                                    <p className={styles.reviewExplanation}>{q.explanation}</p>
                                                                )}
                                                            </div>
                                                        </React.Fragment>
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

                    <div className={styles.navPanel}>
                        <p className={styles.navStat}>
                            <span data-done>{totalCorrect}</span>/{totalQ} câu đúng
                        </p>
                        {cfg.sections.map(sec => {
                            const secQs = questions.map((q, i) => ({ q, i })).filter(({ q }) => q.sectionId === sec.id)
                            if (secQs.length === 0) return null
                            return (
                                <div key={sec.id} className={styles.navSection}>
                                    <p className={styles.navSectionTitle}>{sec.title}</p>
                                    <div className={styles.navGrid}>
                                        {secQs.map(({ q, i }, localIdx) => {
                                            const ans = answers[i]
                                            const isCor = ans === q.correctIndex
                                            return (
                                                <button key={i} className={styles.navBtn}
                                                    data-nav-correct={ans !== null && isCor  || undefined}
                                                    data-nav-wrong={ans !== null && !isCor || undefined}
                                                    onClick={() => questionRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}>
                                                    {localIdx + 1}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                        <div className={styles.reviewNavLegend}>
                            <span data-correct>✓ Đúng</span>
                            <span data-wrong>✗ Sai</span>
                            <span>Bỏ trống</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ── Render: summary ────────────────────────────────────────────────

    return (
        <div className={styles.summary}>
            <Link href="/study?tab=thi-thu" className={styles.backBtn}>
                <ArrowLeft size={14} /> Danh sách đề thi
            </Link>

            <div className={styles.scoreCard}>
                <div className={styles.scoreTop}>
                    <span className={styles.resultBadge} data-passed={String(passed)}>
                        {passed ? "ĐẠT" : "CHƯA ĐẠT"}
                    </span>
                    <span className={styles.levelBadge} data-level={level}>{level}</span>
                </div>
                <div className={styles.scoreMain}>
                    <span className={styles.scoreNum}>{total}</span>
                    <span className={styles.scoreMax}>/{maxScore}</span>
                </div>
                <p className={styles.scoreNote}>{scoreLabel} · Ngưỡng đạt {cfg.passingDisplay} điểm (mỗi phần ≥ {cfg.passing.secMin})</p>

                <div className={styles.sectionScores}>
                    {cfg.infoRows.map((row, rowIdx) => {
                        const skipped   = !!row.skipped
                        const testedIdx = cfg.infoRows.slice(0, rowIdx).filter(r => !r.skipped).length
                        const secId = row.sectionId
                        const scoreMap   = [vocabScore,   grammarScore,   listeningScore]
                        const correctMap = [vocabCorrect, grammarCorrect, listeningCorrect]
                        const totalMap   = [vocabQs.length, grammarQs.length, listeningQs.length]
                        const passedMap  = [vocabPassed,  grammarPassed,  listeningPassed]
                        const mapIdx     = secId === "listening" ? 2 : testedIdx
                        const rowScore   = skipped ? null : scoreMap[mapIdx]   ?? 0
                        const rowCorrect = skipped ? null : correctMap[mapIdx] ?? 0
                        const rowTotal   = skipped ? null : totalMap[mapIdx]   ?? 0
                        const rowPassed  = skipped ? null : passedMap[mapIdx]  ?? true
                        return (
                            <div key={row.title} className={styles.sectionScoreRow}
                                data-skipped={skipped || undefined}
                                data-passed={rowPassed !== null ? String(rowPassed) : undefined}>
                                <div className={styles.sectionScoreInfo}>
                                    <span className={styles.sectionScoreTitle}>{row.title}</span>
                                    {!skipped && rowCorrect !== null && (
                                        <span className={styles.sectionScoreDetail}>{rowCorrect}/{rowTotal} câu đúng</span>
                                    )}
                                    {rowPassed === false && <span className={styles.sectionFail}>Điểm liệt</span>}
                                </div>
                                <div className={styles.sectionScoreVal}>
                                    {skipped ? (
                                        <span className={styles.sectionScoreSkipped}>Không thi</span>
                                    ) : (
                                        <><span>{rowScore}</span><small>/60</small></>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

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
                        <span className={styles.statV}>{totalQ > 0 ? Math.round(totalCorrect / totalQ * 100) : 0}%</span>
                        <span className={styles.statL}>Chính xác</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statV}>{formatTime(totalTimeTaken)}</span>
                        <span className={styles.statL}>Thời gian</span>
                    </div>
                </div>

                <div className={styles.scoreActions}>
                    <button className={styles.btnPrimary} onClick={() => setPhase("info")}>
                        <RotateCcw size={14} /> Thi lại
                    </button>
                    <button className={styles.btnReview} onClick={() => setShowReview(true)}>
                        Xem đáp án
                    </button>
                    <Link href="/study?tab=thi-thu" className={styles.btnOutline}>Đề khác</Link>
                </div>
            </div>
        </div>
    )
}
