import React, { useRef, useState } from "react"
import Image from "next/image"
import { ArrowLeft, Pause, Play } from "lucide-react"
import styles from "./MockExamClient.module.css"
import { parseSentence, sanitizeExamContext } from "./exam-utils"
import type { ExamConfig, Question } from "./exam-types"

interface SectionCounts {
    totalCorrect: number
    totalQ: number
}

interface Props {
    level: string
    cfg: ExamConfig
    questions: Question[]
    answers: (number | null)[]
    sectionCounts: SectionCounts
    questionRefs: React.MutableRefObject<(HTMLDivElement | null)[]>
    onBack: () => void
}

export default function ExamReviewScreen({ level, cfg, questions, answers, sectionCounts, questionRefs, onBack }: Props) {
    const { totalCorrect, totalQ } = sectionCounts
    const audioRef = useRef<HTMLAudioElement>(null)
    const reviewPlayingGiRef = useRef<number | null>(null)

    const [reviewPlayingGi,   setReviewPlayingGi]   = useState<number | null>(null)
    const [reviewIsPaused,    setReviewIsPaused]    = useState(false)
    const [reviewCurrentTime, setReviewCurrentTime] = useState(0)

    function handleReviewPlay(gi: number, q: Question) {
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
        el.addEventListener("seeked", () => {
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
                    setReviewPlayingGi(null); setReviewIsPaused(false); onBack()
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
                                                const isCorrect  = ans === q.correctIndex
                                                const isSkipped  = ans === null
                                                const isKanjiType = q.type === "kanji_reading" || q.type === "kanji_writing"
                                                const prevContext = pos > 0 ? grpQs[pos - 1].q.context : undefined
                                                const showContext = q.context != null && q.context !== prevContext

                                                return (
                                                    <React.Fragment key={gi}>
                                                        {showContext && (
                                                            <div
                                                                className={styles.qContext}
                                                                dangerouslySetInnerHTML={{
                                                                    __html: sanitizeExamContext(q.context!)
                                                                }}
                                                            />
                                                        )}
                                                        <div id={`rev-${gi}`} ref={el => { questionRefs.current[gi] = el }}
                                                            className={styles.qItem} data-readonly>
                                                            <div className={styles.qItemHead}>
                                                                <span className={styles.qNum}>{grpOffset + pos + 1}</span>
                                                                <div className={styles.qWordInline}>
                                                                    {(q.type === "listening_pic" || q.type === "listening_text" || q.type === "listening_scene") ? (
                                                                        <span className={styles.qListenLabel}>{q.display}</span>
                                                                    ) : isKanjiType ? (
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
                                                                    style={{ "--progress": reviewPlayingGi === gi && (q.audioEnd - q.audioStart) > 0
                                                                        ? `${Math.min(100, Math.max(0, (reviewCurrentTime - q.audioStart) / (q.audioEnd - q.audioStart) * 100))}%`
                                                                        : "0%" } as React.CSSProperties}
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

                {/* ── Review nav panel ── */}
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
                                        const ans   = answers[i]
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
