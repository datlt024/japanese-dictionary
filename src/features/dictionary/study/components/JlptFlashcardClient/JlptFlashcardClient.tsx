"use client"

import { useState, useCallback, useLayoutEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Volume2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"

import type { JlptStudyItem, JlptLevel } from "@/domain/study"
import { RATINGS, type Rating } from "@/features/notebook/components/PracticeClient/practice.constants"
import styles from "./JlptFlashcardClient.module.css"

type Phase = "practice" | "summary"

type Props = {
    level: JlptLevel
    initialItems: JlptStudyItem[]
}


export default function JlptFlashcardClient({ level, initialItems }: Props) {
    const [items, setItems] = useState(initialItems)
    const [index, setIndex] = useState(0)
    const [flipped, setFlipped] = useState(false)
    const [ratings, setRatings] = useState<Record<number, Rating>>({})
    const [phase, setPhase] = useState<Phase>("practice")
    const [slideDir, setSlideDir] = useState<"next" | "prev" | null>(null)
    const [loadingNew, setLoadingNew] = useState(false)
    const [fetchError, setFetchError] = useState<string | null>(null)

    const current = items[index]
    const seen = Object.keys(ratings).length
    const correct = Object.values(ratings).filter((r) => r === "normal" || r === "easy").length
    const wrong = Object.values(ratings).filter((r) => r === "forget" || r === "hard").length

    function goPrev() {
        if (index === 0) return
        setSlideDir("prev")
        setIndex((i) => i - 1)
        setFlipped(false)
    }

    function handleRate(rating: Rating) {
        const newRatings = { ...ratings, [current.id]: rating }
        setRatings(newRatings)

        if (index + 1 >= items.length) {
            setPhase("summary")
        } else {
            setSlideDir("next")
            setIndex((i) => i + 1)
            setFlipped(false)
        }
    }

    function handleSkip() {
        if (index + 1 >= items.length) {
            setPhase("summary")
        } else {
            setSlideDir("next")
            setIndex((i) => i + 1)
            setFlipped(false)
        }
    }

    const keyRef = useRef<{ skip: () => void; prev: () => void }>(null!)
    useLayoutEffect(() => { keyRef.current = { skip: handleSkip, prev: goPrev } })

    const handleKey = useCallback((e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
        if (phase !== "practice") return
        if (e.key === "ArrowRight") keyRef.current.skip()
        else if (e.key === "ArrowLeft") keyRef.current.prev()
        else if (e.key === " ") { e.preventDefault(); setFlipped((f) => !f) }
    }, [phase])

    useLayoutEffect(() => {
        document.addEventListener("keydown", handleKey)
        return () => document.removeEventListener("keydown", handleKey)
    }, [handleKey])

    async function handleNewSession() {
        setLoadingNew(true)
        setFetchError(null)
        try {
            const res = await fetch(`/api/study/jlpt?level=${level}&limit=50`)
            if (!res.ok) throw new Error("fetch failed")
            const data: JlptStudyItem[] = await res.json()
            if (data.length === 0) {
                setFetchError("Không tải được từ mới. Vui lòng thử lại.")
                return
            }
            setItems(data)
            setIndex(0)
            setFlipped(false)
            setRatings({})
            setPhase("practice")
            setSlideDir(null)
        } catch {
            setFetchError("Không thể tải từ mới. Vui lòng thử lại.")
        } finally {
            setLoadingNew(false)
        }
    }

    function handleSpeak(text: string) {
        import("@/shared/lib/tts/speakJapanese").then(({ speakJapanese }) => speakJapanese(text))
    }

    if (phase === "summary") {
        const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0
        const unknownItems = items.filter((item) => {
            const r = ratings[item.id]
            return r === "forget" || r === "hard"
        })

        return (
            <div className={styles.summary}>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryLevel}>{level}</div>
                    <h2 className={styles.summaryTitle}>Hoàn thành phiên học!</h2>
                    <div className={styles.summaryStats}>
                        <div className={styles.statItem}>
                            <span className={styles.statNum}>{items.length}</span>
                            <span className={styles.statLabel}>Tổng từ</span>
                        </div>
                        <div className={`${styles.statItem} ${styles.statGreen}`}>
                            <span className={styles.statNum}>{correct}</span>
                            <span className={styles.statLabel}>Đúng</span>
                        </div>
                        <div className={`${styles.statItem} ${styles.statRed}`}>
                            <span className={styles.statNum}>{wrong}</span>
                            <span className={styles.statLabel}>Sai</span>
                        </div>
                        <div className={`${styles.statItem} ${styles.statBlue}`}>
                            <span className={styles.statNum}>{accuracy}%</span>
                            <span className={styles.statLabel}>Chính xác</span>
                        </div>
                    </div>

                    {unknownItems.length > 0 && (
                        <div className={styles.unknownSection}>
                            <p className={styles.unknownTitle}>Từ cần ôn lại ({unknownItems.length})</p>
                            <div className={styles.unknownList}>
                                {unknownItems.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/vocabulary/${item.id}`}
                                        className={styles.unknownItem}
                                        target="_blank"
                                    >
                                        <span className={styles.unknownWord}>{item.word}</span>
                                        {item.kana && <span className={styles.unknownKana}>{item.kana}</span>}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.summaryActions}>
                        {fetchError && (
                            <p style={{ color: "var(--color-danger)", fontSize: "0.85rem", margin: "0 0 8px" }}>{fetchError}</p>
                        )}
                        <button
                            className={styles.newSessionBtn}
                            onClick={handleNewSession}
                            disabled={loadingNew}
                        >
                            <RefreshCw size={16} />
                            {loadingNew ? "Đang tải…" : "Học tiếp 50 từ mới"}
                        </button>
                        <Link href="/study?tab=thu-vien" className={styles.backToStudyBtn}>
                            <ArrowLeft size={15} />
                            Chọn cấp độ khác
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (!current) {
        return (
            <div className={styles.root}>
                <div className={styles.topBar}>
                    <Link href="/study?tab=thu-vien" className={styles.backBtn}>
                        <ArrowLeft size={15} />
                        Chọn cấp độ
                    </Link>
                    <div className={styles.levelBadge}>{level}</div>
                    <span />
                </div>
                <div className={styles.emptyState}>
                    <p className={styles.emptyTitle}>Chưa có từ vựng cho cấp độ {level}</p>
                    <Link href="/study?tab=thu-vien" className={styles.backToStudyBtn}>Quay lại</Link>
                </div>
            </div>
        )
    }

    const progress = (seen / items.length) * 100

    return (
        <div className={styles.root}>
            <div className={styles.topBar}>
                <Link href="/study?tab=thu-vien" className={styles.backBtn}>
                    <ArrowLeft size={15} />
                    Chọn cấp độ
                </Link>
                <div className={styles.levelBadge}>{level}</div>
                <span className={styles.counter}>{index + 1} / {items.length}</span>
            </div>

            <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>

            <div className={styles.cardArea}>
                <button
                    type="button"
                    className={styles.navArrow}
                    onClick={goPrev}
                    disabled={index === 0}
                    aria-label="Từ trước"
                >
                    <ChevronLeft size={22} />
                </button>

                <div className={styles.cardWrapper}>
                    <div
                        key={index}
                        className={`${styles.cardSlide} ${slideDir === "next" ? styles.slideNext : slideDir === "prev" ? styles.slidePrev : ""}`}
                    >
                        <div className={`${styles.card} ${flipped ? styles.cardFlipped : ""}`}>
                            {/* Front */}
                            <div className={styles.cardFront} onClick={() => setFlipped(true)}>
                                <div className={styles.cardWord}>{current.word}</div>
                                {current.kana && (
                                    <div className={styles.cardKana}>{current.kana}</div>
                                )}
                                <div className={styles.flipHint}>Nhấn để xem nghĩa</div>
                            </div>

                            {/* Back */}
                            <div className={styles.cardBack} onClick={() => setFlipped(false)}>
                                <div className={styles.cardBackWord}>{current.word}</div>
                                {current.kana && (
                                    <div className={styles.cardBackKana}>
                                        <button
                                            type="button"
                                            className={styles.ttsBtn}
                                            onClick={(e) => { e.stopPropagation(); handleSpeak(current.kana ?? current.word) }}
                                            aria-label="Phát âm"
                                        >
                                            <Volume2 size={14} />
                                        </button>
                                        {current.kana}
                                    </div>
                                )}
                                <div className={styles.cardMeaning}>{current.meaning ?? "—"}</div>
                                <Link
                                    href={`/vocabulary/${current.id}`}
                                    className={styles.detailLink}
                                    target="_blank"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Xem chi tiết ↗
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className={styles.navArrow}
                    onClick={handleSkip}
                    aria-label="Từ tiếp theo"
                >
                    <ChevronRight size={22} />
                </button>
            </div>

            <div className={styles.ratingGrid}>
                {RATINGS.map((r) => (
                    <button
                        key={r.id}
                        type="button"
                        className={styles.ratingBtn}
                        style={{
                            background: r.bg,
                            borderColor: r.border,
                            color: r.color,
                            opacity: flipped ? 1 : 0.4,
                            cursor: flipped ? "pointer" : "not-allowed",
                            pointerEvents: flipped ? "auto" : "none",
                        }}
                        onClick={() => handleRate(r.id)}
                    >
                        <span className={styles.ratingEmoji}>{r.emoji}</span>
                        <span className={styles.ratingLabel}>{r.label}</span>
                    </button>
                ))}
            </div>

            <button type="button" className={styles.skipBtn} onClick={handleSkip}>
                Bỏ qua →
            </button>
        </div>
    )
}
