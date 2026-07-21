"use client"

import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    BookOpen,
    Timer,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    Volume2,
    Star,
    MoreHorizontal,
} from "lucide-react"

import { useNotebooks } from "@/features/notebook/hooks/useNotebooks"
import type { EnrichedNotebookItem } from "@/domain/notebook/notebook.type"
import { speakJapanese } from "@/shared/lib/tts/speakJapanese"
import QuickLookupModal from "@/features/dictionary/quick-lookup/components/QuickLookupModal"
import {
    getQuickLookupTarget,
    type QuickLookupTarget,
} from "@/features/dictionary/quick-lookup/services/quick-lookup.service"

import type { ModeProps } from "./practice.types"
import type { Rating } from "./practice.constants"
import { RATINGS, RATING_MAP } from "./practice.constants"
import { shuffle } from "./practice.utils"
import styles from "./PracticeClient.module.css"

type HistoryEntry = {
    item: EnrichedNotebookItem
    rating: Rating
}

export default function FlashCardMode({
    items,
    onFinish,
    onBack,
    notebookId,
}: ModeProps & { notebookId: string }) {
    const router = useRouter()
    const shuffled = useMemo(() => shuffle(items), [items])
    const [index, setIndex] = useState(0)
    const [flipped, setFlipped] = useState(false)
    const [ratings, setRatings] = useState<Record<string, Rating>>({})
    const [history, setHistory] = useState<HistoryEntry[]>([])
    const [slideDir, setSlideDir] = useState<"next" | "prev" | null>(null)
    const [switcherOpen, setSwitcherOpen] = useState(false)
    const switcherRef = useRef<HTMLDivElement>(null)

    const { notebooks } = useNotebooks(true)
    const currentNotebook = notebooks.find((nb) => nb.id === notebookId)

    const [quickLookupTarget, setQuickLookupTarget] = useState<QuickLookupTarget | null>(null)
    const [quickLookupOpen, setQuickLookupOpen] = useState(false)
    const [detailLoading, setDetailLoading] = useState(false)

    useEffect(() => {
        if (!switcherOpen) return
        function handleClick(e: MouseEvent) {
            if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
                setSwitcherOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [switcherOpen])

    function goPrev() {
        if (index === 0) return
        setSlideDir("prev")
        setIndex((i) => i - 1)
        setFlipped(false)
    }

    const keyHandlerRef = useRef<{ skip: () => void; prev: () => void }>(null!)

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
            if (e.key === "ArrowRight") keyHandlerRef.current.skip()
            else if (e.key === "ArrowLeft") keyHandlerRef.current.prev()
        }
        document.addEventListener("keydown", handleKey)
        return () => document.removeEventListener("keydown", handleKey)
    }, [])

    const seen = Object.keys(ratings).length
    const correct = Object.values(ratings).filter((r) => r === "normal" || r === "easy").length
    const wrong = Object.values(ratings).filter((r) => r === "forget" || r === "hard").length
    const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0

    function buildResult(ratingMap: Record<string, Rating>) {
        const known = Object.entries(ratingMap)
            .filter(([, r]) => r === "normal" || r === "easy")
            .map(([id]) => id)
        const unknown = Object.entries(ratingMap)
            .filter(([, r]) => r === "forget" || r === "hard")
            .map(([id]) => id)
        return { known, unknown }
    }

    function handleRate(rating: Rating) {
        const item = shuffled[index]
        const newRatings = { ...ratings, [item.id]: rating }
        setRatings(newRatings)
        setHistory((prev) => [{ item, rating }, ...prev].slice(0, 20))

        if (index + 1 >= shuffled.length) {
            const { known, unknown } = buildResult(newRatings)
            onFinish(known, unknown)
        } else {
            setSlideDir("next")
            setIndex((i) => i + 1)
            setFlipped(false)
        }
    }

    function handleSkip() {
        if (index + 1 >= shuffled.length) {
            const { known, unknown } = buildResult(ratings)
            onFinish(known, unknown)
        } else {
            setSlideDir("next")
            setIndex((i) => i + 1)
            setFlipped(false)
        }
    }
    useLayoutEffect(() => { keyHandlerRef.current = { skip: handleSkip, prev: goPrev } })

    function handleEndSession() {
        const { known, unknown } = buildResult(ratings)
        onFinish(known, unknown)
    }

    async function handleOpenDetail(title: string) {
        if (detailLoading) return
        setDetailLoading(true)
        try {
            const target = await getQuickLookupTarget(title, "vi")
            setQuickLookupTarget(target)
            setQuickLookupOpen(true)
        } finally {
            setDetailLoading(false)
        }
    }

    const current = shuffled[index]

    return (
        <div className={styles.fcLayout}>
            <div className={styles.fcTopBar}>
                <button type="button" className={styles.fcBackBtn} onClick={onBack}>
                    <ArrowLeft size={15} />
                    Quay lại
                </button>

                <div className={styles.fcTitleArea} ref={switcherRef}>
                    <BookOpen size={15} className={styles.fcTitleIcon} />
                    <button
                        type="button"
                        className={styles.fcNotebookBtn}
                        onClick={() => setSwitcherOpen((v) => !v)}
                    >
                        <span className={styles.fcNotebookName}>
                            {currentNotebook?.name ?? "Sổ tay"}
                        </span>
                        <span className={styles.fcTitleCount}>· {shuffled.length} từ</span>
                        <ChevronDown
                            size={13}
                            className={`${styles.fcSwitcherChevron} ${switcherOpen ? styles.fcSwitcherChevronOpen : ""}`}
                        />
                    </button>

                    {switcherOpen && notebooks.length > 0 && (
                        <div className={styles.fcNotebookDropdown}>
                            {notebooks.map((nb) => (
                                <button
                                    key={nb.id}
                                    type="button"
                                    className={`${styles.fcNotebookDropdownItem} ${nb.id === notebookId ? styles.fcNotebookDropdownItemActive : ""}`}
                                    onClick={() => {
                                        setSwitcherOpen(false)
                                        router.push(`/notebooks/${nb.id}/practice`)
                                    }}
                                >
                                    <span className={styles.fcDropdownName}>{nb.name}</span>
                                    <span className={styles.fcDropdownCount}>{nb.item_count} từ</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button type="button" className={styles.fcEndBtn} onClick={handleEndSession}>
                    <Timer size={14} />
                    Kết thúc ôn tập
                </button>
            </div>

            <div className={styles.fcBody}>
                <div className={styles.fcMain}>
                    <div className={styles.fcCardRow}>
                        <button
                            type="button"
                            className={styles.fcNavArrow}
                            onClick={goPrev}
                            disabled={index === 0}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className={styles.fcCardWrapper}>
                            <div
                                key={index}
                                className={`${styles.fcCardSlide} ${slideDir === "next" ? styles.fcSlideNext : slideDir === "prev" ? styles.fcSlidePrev : ""}`}
                            >
                                <div className={`${styles.fcCard} ${flipped ? styles.fcCardFlipped : ""}`}>
                                    <div
                                        className={styles.fcCardFront}
                                        onClick={() => setFlipped(true)}
                                    >
                                        <div className={styles.fcCardTop}>
                                            <span className={styles.fcCounter}>
                                                {index + 1} / {shuffled.length}
                                            </span>
                                            <div className={styles.fcCardControls}>
                                                <button type="button" className={styles.fcIconBtn}>
                                                    <Star size={16} />
                                                </button>
                                                <button type="button" className={styles.fcIconBtn}>
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className={styles.fcCardContent}>
                                            <div className={styles.fcWord}>{current.display.title}</div>
                                            <div className={styles.fcHint}>
                                                <span>👆</span>
                                                Nhấn để lật
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={styles.fcCardBack}
                                        onClick={() => setFlipped(false)}
                                    >
                                        <div className={styles.fcCardTop}>
                                            <span className={styles.fcCounter}>
                                                {index + 1} / {shuffled.length}
                                            </span>
                                            <div className={styles.fcCardControls}>
                                                <button
                                                    type="button"
                                                    className={styles.fcIconBtn}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        speakJapanese(current.display.subtitle ?? current.display.title)
                                                    }}
                                                >
                                                    <Volume2 size={16} />
                                                </button>
                                                <button type="button" className={styles.fcIconBtn} onClick={(e) => e.stopPropagation()}>
                                                    <Star size={16} />
                                                </button>
                                                <button type="button" className={styles.fcIconBtn} onClick={(e) => e.stopPropagation()}>
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className={styles.fcCardContent}>
                                            <div className={styles.fcWordBack}>{current.display.title}</div>
                                            {current.display.han_viet && (
                                                <div className={styles.fcHanViet}>
                                                    {current.display.han_viet}
                                                </div>
                                            )}
                                            {current.display.subtitle && (
                                                <div className={styles.fcReading}>
                                                    <span>{current.display.subtitle}</span>
                                                </div>
                                            )}
                                            {current.display.meaning && (
                                                <div className={styles.fcMeaning}>
                                                    {current.display.meaning}
                                                </div>
                                            )}
                                            <button
                                                className={styles.fcDetailLink}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleOpenDetail(current.display.title)
                                                }}
                                                disabled={detailLoading}
                                            >
                                                {detailLoading ? "Đang tải..." : "Xem chi tiết"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            className={styles.fcNavArrow}
                            onClick={handleSkip}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className={styles.fcRatingGrid}>
                        {RATINGS.map((r) => (
                            <button
                                key={r.id}
                                type="button"
                                className={styles.fcRatingBtn}
                                style={{
                                    background: r.bg,
                                    borderColor: r.border,
                                    color: r.color,
                                    opacity: flipped ? 1 : 0.45,
                                    cursor: flipped ? "pointer" : "not-allowed",
                                }}
                                onClick={() => flipped && handleRate(r.id)}
                            >
                                <span className={styles.fcRatingEmoji}>{r.emoji}</span>
                                <div className={styles.fcRatingText}>
                                    <span className={styles.fcRatingLabel}>{r.label}</span>
                                    <span className={styles.fcRatingSub}>{r.sublabel}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <button type="button" className={styles.fcSkipBtn} onClick={handleSkip}>
                        ▷ Bỏ qua từ này
                    </button>
                </div>

                <div className={styles.fcSidebar}>
                    <div className={styles.fcSidebarSection}>
                        <div className={styles.fcSidebarTitle}>Tiến độ ôn tập</div>
                        <div className={styles.fcSbProgressBar}>
                            <div
                                className={styles.fcSbProgressFill}
                                style={{ width: `${(seen / shuffled.length) * 100}%` }}
                            />
                        </div>
                        <div className={styles.fcSbProgressRow}>
                            <span className={styles.fcSbProgressSub}>
                                Còn lại hôm nay:{" "}
                                <strong>{shuffled.length - seen} từ</strong>
                            </span>
                            <span className={styles.fcSbProgressNum}>
                                {seen} / {shuffled.length}
                            </span>
                        </div>
                    </div>

                    <div className={styles.fcSidebarSection}>
                        <div className={styles.fcSidebarTitle}>Thống kê nhanh</div>
                        <div className={styles.fcStatsGrid}>
                            <div className={styles.fcStatCell}>
                                <span className={styles.fcStatNum}>{seen}</span>
                                <span className={styles.fcStatLabel}>Đã học</span>
                            </div>
                            <div className={`${styles.fcStatCell} ${styles.fcStatRight}`}>
                                <span className={`${styles.fcStatNum} ${styles.fcStatGreen}`}>
                                    {correct}
                                </span>
                                <span className={styles.fcStatLabel}>Đúng</span>
                            </div>
                            <div className={`${styles.fcStatCell} ${styles.fcStatBottom}`}>
                                <span className={`${styles.fcStatNum} ${styles.fcStatRed}`}>
                                    {wrong}
                                </span>
                                <span className={styles.fcStatLabel}>Sai</span>
                            </div>
                            <div className={`${styles.fcStatCell} ${styles.fcStatRight} ${styles.fcStatBottom}`}>
                                <span className={`${styles.fcStatNum} ${styles.fcStatBlue}`}>
                                    {accuracy}%
                                </span>
                                <span className={styles.fcStatLabel}>Tỷ lệ đúng</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.fcSidebarSection}>
                        <div className={styles.fcSidebarTitle}>Lịch sử gần đây</div>
                        {history.length === 0 ? (
                            <p className={styles.fcHistoryEmpty}>Chưa có từ nào được ôn tập</p>
                        ) : (
                            <>
                                <ul className={styles.fcHistoryList}>
                                    {history.slice(0, 5).map((entry, i) => (
                                        <li key={i} className={styles.fcHistoryItem}>
                                            <span
                                                className={`${styles.fcHistoryDot} ${
                                                    entry.rating === "normal" || entry.rating === "easy"
                                                        ? styles.fcDotGreen
                                                        : styles.fcDotRed
                                                }`}
                                            />
                                            <div className={styles.fcHistoryInfo}>
                                                <span className={styles.fcHistoryWord}>
                                                    {entry.item.display.title}
                                                </span>
                                                {entry.item.display.subtitle && (
                                                    <span className={styles.fcHistoryReading}>
                                                        {entry.item.display.subtitle}
                                                    </span>
                                                )}
                                            </div>
                                            <span
                                                className={styles.fcHistoryRating}
                                                style={{ color: RATING_MAP[entry.rating].color }}
                                            >
                                                {RATING_MAP[entry.rating].label}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                {history.length > 5 && (
                                    <button type="button" className={styles.fcSeeAllBtn}>Xem tất cả</button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <QuickLookupModal
                open={quickLookupOpen}
                target={quickLookupTarget}
                onClose={() => setQuickLookupOpen(false)}
            />
        </div>
    )
}
