import React, { useState, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Clock, Play, X } from "lucide-react"
import DOMPurify from "isomorphic-dompurify"

function sanitizeExamContext(html: string): string {
    const sanitized = DOMPurify.sanitize(html)
    return sanitized
        .replace(/\bcolor\s*:\s*[^;}"]+;?\s*/gi, "")
        .replace(/\bbackground(?:-color)?\s*:\s*[^;}"]+;?\s*/gi, "")
}
import styles from "./MockExamClient.module.css"
import { formatTime, parseSentence } from "./exam-utils"
import type { ExamConfig } from "./exam-types"
import type { Question } from "./exam-types"

interface Props {
    level: string
    cfg: ExamConfig
    phase: "question" | "listening"
    questions: Question[]
    answers: (number | null)[]
    idx: number
    timeLeft: number
    audioRef: React.RefObject<HTMLAudioElement | null>
    questionRefs: React.MutableRefObject<(HTMLDivElement | null)[]>
    onSelect: (qIdx: number, optIdx: number) => void
    onSetIdx: (i: number) => void
    onScrollToQuestion: (i: number) => void
    onFinish: () => void
}

export default function ExamActivePhase({
    level, cfg, phase, questions, answers, idx, timeLeft,
    audioRef, questionRefs, onSelect, onSetIdx, onScrollToQuestion, onFinish,
}: Props) {
    const router = useRouter()
    const isListeningPhase = phase === "listening"

    const [audioStarted,  setAudioStarted]  = useState(false)
    const [audioEnded,    setAudioEnded]    = useState(false)
    const [audioTime,     setAudioTime]     = useState(0)
    const [audioDuration, setAudioDuration] = useState(0)

    const startAudio = useCallback(() => { audioRef.current?.play() }, [audioRef])

    const phaseSections = cfg.listeningAudio
        ? cfg.sections.filter(s => isListeningPhase ? s.id === "listening" : s.id !== "listening")
        : cfg.sections

    const phaseQsWithIdx = questions
        .map((q, gi) => ({ q, gi }))
        .filter(({ q }) => !cfg.listeningAudio || (isListeningPhase === (q.sectionId === "listening")))

    const answeredCount = phaseQsWithIdx.filter(({ gi }) => answers[gi] !== null).length
    const unanswered    = phaseQsWithIdx.length - answeredCount
    const progress      = phaseQsWithIdx.length > 0 ? (answeredCount / phaseQsWithIdx.length) * 100 : 0
    const warn          = timeLeft < 60

    function handleExit() {
        if (!window.confirm("Thoát khỏi bài thi? Tiến trình sẽ không được lưu.")) return
        router.push("/study?tab=thi-thu")
    }

    function handleFinish() {
        if (unanswered > 0 && !window.confirm(`Còn ${unanswered} câu chưa trả lời. Xác nhận nộp bài?`)) return
        onFinish()
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
                {/* ── Questions panel ── */}
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
                                                const isKanjiType   = q.type === "kanji_reading" || q.type === "kanji_writing"
                                                const isListeningQ  = q.type === "listening_pic" || q.type === "listening_text" || q.type === "listening_scene"
                                                const prevContext    = pos > 0 ? grpQs[pos - 1].q.context : undefined
                                                const showContext    = q.context != null && q.context !== prevContext
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
                                                        <div
                                                            id={`q-${gi}`}
                                                            ref={el => { questionRefs.current[gi] = el }}
                                                            className={styles.qItem}
                                                            role="button"
                                                            tabIndex={0}
                                                            data-active={idx === gi || undefined}
                                                            data-type={q.type}
                                                            onClick={() => onSetIdx(gi)}
                                                            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSetIdx(gi))}
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
                                                                                <button key={oi} type="button" className={styles.qOption} data-selected={isSel || undefined}
                                                                                    aria-pressed={isSel}
                                                                                    onClick={e => { e.stopPropagation(); onSelect(gi, oi) }}>
                                                                                    <span className={styles.qRadio} data-selected={isSel || undefined} />
                                                                                    <span className={styles.qOptText}>{num}</span>
                                                                                </button>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className={styles.qOptions} data-grid={isKanjiType || undefined}>
                                                                    {q.options.map((opt, oi) => {
                                                                        const isSel = answers[gi] === oi
                                                                        return (
                                                                            <button key={oi} type="button" className={styles.qOption} data-selected={isSel || undefined}
                                                                                aria-pressed={isSel}
                                                                                onClick={e => { e.stopPropagation(); onSelect(gi, oi) }}>
                                                                                <span className={styles.qRadio} data-selected={isSel || undefined} />
                                                                                <span className={styles.qOptNum}>{oi + 1}</span>
                                                                                <span className={styles.qOptText}>{opt}</span>
                                                                            </button>
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

                {/* ── Nav panel ── */}
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
                                            onClick={() => onScrollToQuestion(gi)}>
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
