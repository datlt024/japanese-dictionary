"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    BookOpen,
    RotateCcw,
    ClipboardList,
    Timer,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    Volume2,
    Star,
    MoreHorizontal,
} from "lucide-react"

import { useNotebookItems } from "@/features/notebook/hooks/useNotebookItems"
import { useNotebooks } from "@/features/notebook/hooks/useNotebooks"
import type { EnrichedNotebookItem } from "@/domain/notebook/notebook.type"
import { speakJapanese } from "@/shared/lib/tts/speakJapanese"

import QuickLookupModal from "@/features/dictionary/quick-lookup/components/QuickLookupModal"
import {
    getQuickLookupTarget,
    type QuickLookupTarget,
} from "@/features/dictionary/quick-lookup/services/quick-lookup.service"

import styles from "./PracticeClient.module.css"

// ─── Constants ────────────────────────────────────────────────────────────────

type PracticeMode = "flashcard" | "quiz" | "writing" | "minitest"

const TYPE_LABEL: Record<string, string> = {
    vocabulary: "Từ vựng",
    kanji: "Hán tự",
    grammar: "Ngữ pháp",
}

// ─── FlashCard rating system ──────────────────────────────────────────────────

type Rating = "forget" | "hard" | "normal" | "easy"

type HistoryEntry = {
    item: EnrichedNotebookItem
    rating: Rating
}

const RATINGS = [
    {
        id: "forget" as Rating,
        label: "Không nhớ",
        sublabel: "Ôn lại ngay",
        emoji: "😟",
        color: "#ef4444",
        bg: "#fef2f2",
        border: "#fca5a5",
    },
    {
        id: "hard" as Rating,
        label: "Khó nhớ",
        sublabel: "Ôn lại sau",
        emoji: "😕",
        color: "#d97706",
        bg: "#fffbeb",
        border: "#fcd34d",
    },
    {
        id: "normal" as Rating,
        label: "Bình thường",
        sublabel: "Ôn lại sau 3 ngày",
        emoji: "😊",
        color: "#16a34a",
        bg: "#f0fdf4",
        border: "#86efac",
    },
    {
        id: "easy" as Rating,
        label: "Dễ nhớ",
        sublabel: "Ôn lại sau 7 ngày",
        emoji: "😄",
        color: "#2563eb",
        bg: "#eff6ff",
        border: "#93c5fd",
    },
] as const

const RATING_MAP = Object.fromEntries(RATINGS.map((r) => [r.id, r])) as Record<
    Rating,
    (typeof RATINGS)[number]
>

const MODE_LABEL: Record<PracticeMode, string> = {
    flashcard: "FlashCard",
    quiz: "Trắc nghiệm",
    writing: "Luyện viết",
    minitest: "Mini Test",
}

const MINI_TEST_TIME = 300
const MINI_TEST_COUNT = 10

const VALID_MODES = new Set<string>(["flashcard", "quiz", "writing", "minitest"])

function toValidMode(m?: string): PracticeMode | undefined {
    return m && VALID_MODES.has(m) ? (m as PracticeMode) : undefined
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
}

function getAnswerText(item: EnrichedNotebookItem): string {
    return item.display.meaning ?? item.display.subtitle ?? item.display.title
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ModeProps = {
    items: EnrichedNotebookItem[]
    onFinish: (known: string[], unknown: string[], timeTaken?: number) => void
    onBack: () => void
}

type SummaryData = {
    known: string[]
    unknown: string[]
    timeTaken?: number
}

// ─── Root Component ───────────────────────────────────────────────────────────

type Props = { notebookId: string; initialMode?: string }

export default function PracticeClient({ notebookId, initialMode }: Props) {
    const router = useRouter()
    const { items, loading } = useNotebookItems(notebookId)
    const [phase, setPhase] = useState<"practice" | "summary">("practice")
    const [mode] = useState<PracticeMode>(toValidMode(initialMode) ?? "flashcard")
    const [summary, setSummary] = useState<SummaryData>({ known: [], unknown: [] })

    function finishPractice(known: string[], unknown: string[], timeTaken?: number) {
        setSummary({ known, unknown, timeTaken })
        setPhase("summary")
    }

    if (loading) return <div className={styles.centered}>Đang tải...</div>

    if (items.length === 0) {
        return (
            <div className={styles.centered}>
                <div className={styles.emptyState}>
                    <BookOpen size={40} className={styles.emptyIcon} />
                    <p>Sổ tay này chưa có mục nào để luyện tập.</p>
                    <Link href="/notebooks" className={styles.backLink}>
                        <ArrowLeft size={15} />
                        Quay lại sổ tay
                    </Link>
                </div>
            </div>
        )
    }

    if (phase === "summary") {
        return (
            <Summary
                items={items}
                summary={summary}
                mode={mode}
                onRestart={() => setPhase("practice")}
                onChangeMode={() => router.push("/notebooks")}
            />
        )
    }

    const modeProps: ModeProps = {
        items,
        onFinish: finishPractice,
        onBack: () => router.push("/notebooks"),
    }

    if (mode === "flashcard") return <FlashCardMode {...modeProps} notebookId={notebookId} />
    if (mode === "quiz") return <QuizMode {...modeProps} />
    if (mode === "writing") return <WritingMode {...modeProps} />
    if (mode === "minitest") return <MiniTestMode {...modeProps} />
    return null
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function PracticeHeader({
    onBack,
    index,
    total,
    extra,
}: {
    onBack: () => void
    index: number
    total: number
    extra?: React.ReactNode
}) {
    return (
        <div className={styles.practiceHeader}>
            <button className={styles.backBtn} onClick={onBack}>
                <ArrowLeft size={16} />
                Đổi chế độ
            </button>
            <div className={styles.practiceHeaderRight}>
                {extra}
                <span className={styles.progressText}>
                    {index + 1} / {total}
                </span>
            </div>
        </div>
    )
}

function ProgressBar({ index, total }: { index: number; total: number }) {
    return (
        <div className={styles.progressBar}>
            <div
                className={styles.progressFill}
                style={{ width: `${((index + 1) / total) * 100}%` }}
            />
        </div>
    )
}

function TypeBadge({ type }: { type: string }) {
    return (
        <span className={`${styles.typeBadge} ${styles[type]}`}>
            {TYPE_LABEL[type]}
        </span>
    )
}

// ─── FlashCard Mode ───────────────────────────────────────────────────────────

function FlashCardMode({ items, onFinish, onBack, notebookId }: ModeProps & { notebookId: string }) {
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

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
            if (e.key === "ArrowRight") {
                handleSkip()
            } else if (e.key === "ArrowLeft") {
                goPrev()
            }
        }
        document.addEventListener("keydown", handleKey)
        return () => document.removeEventListener("keydown", handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index, shuffled.length, ratings])

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
            {/* Top bar */}
            <div className={styles.fcTopBar}>
                <button className={styles.fcBackBtn} onClick={onBack}>
                    <ArrowLeft size={15} />
                    Quay lại
                </button>

                <div className={styles.fcTitleArea} ref={switcherRef}>
                    <BookOpen size={15} className={styles.fcTitleIcon} />
                    <button
                        className={styles.fcNotebookBtn}
                        onClick={() => setSwitcherOpen((v) => !v)}
                    >
                        <span className={styles.fcNotebookName}>
                            {currentNotebook?.name ?? "Sổ tay"}
                        </span>
                        <span className={styles.fcTitleCount}>· {shuffled.length} từ</span>
                        <ChevronDown size={13} className={`${styles.fcSwitcherChevron} ${switcherOpen ? styles.fcSwitcherChevronOpen : ""}`} />
                    </button>

                    {switcherOpen && notebooks.length > 0 && (
                        <div className={styles.fcNotebookDropdown}>
                            {notebooks.map((nb) => (
                                <button
                                    key={nb.id}
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

                <button className={styles.fcEndBtn} onClick={handleEndSession}>
                    <Timer size={14} />
                    Kết thúc ôn tập
                </button>
            </div>

            {/* Body: main + sidebar */}
            <div className={styles.fcBody}>
                {/* Left: card + rating */}
                <div className={styles.fcMain}>
                    {/* Card row with arrows */}
                    <div className={styles.fcCardRow}>
                        <button
                            className={styles.fcNavArrow}
                            onClick={goPrev}
                            disabled={index === 0}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {/* 3D Card */}
                        <div className={styles.fcCardWrapper}>
                            <div
                                key={index}
                                className={`${styles.fcCardSlide} ${slideDir === "next" ? styles.fcSlideNext : slideDir === "prev" ? styles.fcSlidePrev : ""}`}
                            >
                            <div
                                className={`${styles.fcCard} ${flipped ? styles.fcCardFlipped : ""}`}
                            >
                                {/* Front face */}
                                <div
                                    className={styles.fcCardFront}
                                    onClick={() => setFlipped(true)}
                                >
                                    <div className={styles.fcCardTop}>
                                        <span className={styles.fcCounter}>
                                            {index + 1} / {shuffled.length}
                                        </span>
                                        <div className={styles.fcCardControls}>
                                            <button className={styles.fcIconBtn}>
                                                <Star size={16} />
                                            </button>
                                            <button className={styles.fcIconBtn}>
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

                                {/* Back face */}
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
                                                className={styles.fcIconBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    speakJapanese(current.display.subtitle ?? current.display.title)
                                                }}
                                            >
                                                <Volume2 size={16} />
                                            </button>
                                            <button className={styles.fcIconBtn} onClick={(e) => e.stopPropagation()}>
                                                <Star size={16} />
                                            </button>
                                            <button className={styles.fcIconBtn} onClick={(e) => e.stopPropagation()}>
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
                            className={styles.fcNavArrow}
                            onClick={handleSkip}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Rating buttons */}
                    <div className={styles.fcRatingGrid}>
                        {RATINGS.map((r) => (
                            <button
                                key={r.id}
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

                    <button className={styles.fcSkipBtn} onClick={handleSkip}>
                        ▷ Bỏ qua từ này
                    </button>
                </div>

                {/* Right sidebar */}
                <div className={styles.fcSidebar}>
                    {/* Progress */}
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

                    {/* Quick stats */}
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
                            <div
                                className={`${styles.fcStatCell} ${styles.fcStatRight} ${styles.fcStatBottom}`}
                            >
                                <span className={`${styles.fcStatNum} ${styles.fcStatBlue}`}>
                                    {accuracy}%
                                </span>
                                <span className={styles.fcStatLabel}>Tỷ lệ đúng</span>
                            </div>
                        </div>
                    </div>

                    {/* History */}
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
                                                    entry.rating === "normal" ||
                                                    entry.rating === "easy"
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
                                    <button className={styles.fcSeeAllBtn}>Xem tất cả</button>
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

// ─── Quiz Mode ────────────────────────────────────────────────────────────────

function QuizMode({ items, onFinish, onBack }: ModeProps) {
    const shuffled = useMemo(() => shuffle(items), [items])
    const [index, setIndex] = useState(0)
    const [selected, setSelected] = useState<string | null>(null)
    const [known, setKnown] = useState<string[]>([])
    const [unknown, setUnknown] = useState<string[]>([])

    const knownRef = useRef<string[]>([])
    const unknownRef = useRef<string[]>([])
    useEffect(() => { knownRef.current = known }, [known])
    useEffect(() => { unknownRef.current = unknown }, [unknown])

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

        setTimeout(() => {
            if (index + 1 >= shuffled.length) {
                onFinish(newKnown, newUnknown)
            } else {
                setKnown(newKnown)
                setUnknown(newUnknown)
                setIndex((i) => i + 1)
                setSelected(null)
            }
        }, 1000)
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
                {options.map((opt, i) => {
                    let cls = styles.optionBtn
                    if (selected !== null) {
                        if (opt === correctAnswer) cls += ` ${styles.optionCorrect}`
                        else if (opt === selected) cls += ` ${styles.optionWrong}`
                        else cls += ` ${styles.optionDimmed}`
                    }
                    return (
                        <button key={i} className={cls} onClick={() => handleSelect(opt)}>
                            <span className={styles.optionLabel}>
                                {String.fromCharCode(65 + i)}
                            </span>
                            {opt}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// ─── Writing Mode ─────────────────────────────────────────────────────────────

function WritingMode({ items, onFinish, onBack }: ModeProps) {
    const shuffled = useMemo(() => shuffle(items), [items])
    const [index, setIndex] = useState(0)
    const [input, setInput] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [isCorrect, setIsCorrect] = useState(false)
    const [known, setKnown] = useState<string[]>([])
    const [unknown, setUnknown] = useState<string[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        inputRef.current?.focus()
    }, [index])

    const current = shuffled[index]

    function handleSubmit() {
        if (!input.trim() || submitted) return
        const correct = input.trim() === current.display.title
        setIsCorrect(correct)
        setSubmitted(true)
        if (correct) setKnown((prev) => [...prev, current.id])
        else setUnknown((prev) => [...prev, current.id])
    }

    function advance(overrideUnknown?: string[]) {
        const k = known
        const u = overrideUnknown ?? unknown
        if (index + 1 >= shuffled.length) {
            onFinish(k, u)
        } else {
            setIndex((i) => i + 1)
            setInput("")
            setSubmitted(false)
            setIsCorrect(false)
        }
    }

    function handleSkip() {
        const newUnknown = [...unknown, current.id]
        setUnknown(newUnknown)
        advance(newUnknown)
    }

    return (
        <div className={styles.practiceContainer}>
            <PracticeHeader onBack={onBack} index={index} total={shuffled.length} />
            <ProgressBar index={index} total={shuffled.length} />

            <div className={styles.writingCard}>
                <TypeBadge type={current.item_type} />
                {current.display.meaning && (
                    <div className={styles.writingMeaning}>{current.display.meaning}</div>
                )}
                {current.display.subtitle && (
                    <div className={styles.writingHint}>{current.display.subtitle}</div>
                )}
                <div className={styles.writingPrompt}>Gõ từ tiếng Nhật tương ứng</div>
            </div>

            <div className={styles.writingInputWrap}>
                <input
                    ref={inputRef}
                    className={`${styles.writingInput} ${
                        submitted
                            ? isCorrect
                                ? styles.writingInputCorrect
                                : styles.writingInputWrong
                            : ""
                    }`}
                    value={input}
                    onChange={(e) => !submitted && setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            if (!submitted) handleSubmit()
                            else advance()
                        }
                    }}
                    placeholder="Nhập từ tiếng Nhật..."
                    autoComplete="off"
                    autoCapitalize="none"
                    readOnly={submitted}
                />

                {submitted && !isCorrect && (
                    <div className={styles.writingFeedbackWrong}>
                        Đáp án đúng: <strong>{current.display.title}</strong>
                    </div>
                )}
                {submitted && isCorrect && (
                    <div className={styles.writingFeedbackCorrect}>Chính xác!</div>
                )}
            </div>

            <div className={styles.actions}>
                {!submitted ? (
                    <div className={styles.writingActions}>
                        <button className={styles.skipBtn} onClick={handleSkip}>
                            Bỏ qua
                        </button>
                        <button
                            className={styles.submitBtn}
                            onClick={handleSubmit}
                            disabled={!input.trim()}
                        >
                            Kiểm tra
                        </button>
                    </div>
                ) : (
                    <button className={styles.nextBtn} onClick={() => advance()}>
                        {index + 1 >= shuffled.length ? "Xem kết quả" : "Tiếp theo"}
                        <ChevronRight size={16} />
                    </button>
                )}
            </div>
        </div>
    )
}

// ─── Mini Test Mode ───────────────────────────────────────────────────────────

function MiniTestMode({ items, onFinish, onBack }: ModeProps) {
    const questions = useMemo(
        () => shuffle(items).slice(0, MINI_TEST_COUNT),
        [items]
    )
    const [index, setIndex] = useState(0)
    const [selected, setSelected] = useState<string | null>(null)
    const [known, setKnown] = useState<string[]>([])
    const [unknown, setUnknown] = useState<string[]>([])
    const [timeLeft, setTimeLeft] = useState(MINI_TEST_TIME)

    const finishedRef = useRef(false)
    const knownRef = useRef<string[]>([])
    const unknownRef = useRef<string[]>([])
    const indexRef = useRef(0)
    const questionsRef = useRef(questions)
    const timeLeftRef = useRef(MINI_TEST_TIME)

    useEffect(() => { knownRef.current = known }, [known])
    useEffect(() => { unknownRef.current = unknown }, [unknown])
    useEffect(() => { indexRef.current = index }, [index])

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((t) => {
                const next = t - 1
                timeLeftRef.current = next
                if (next <= 0 && !finishedRef.current) {
                    clearInterval(timer)
                    finishedRef.current = true
                    const timeTaken = MINI_TEST_TIME
                    const remaining = questionsRef.current
                        .slice(indexRef.current)
                        .map((q) => q.id)
                    onFinish(knownRef.current, [...unknownRef.current, ...remaining], timeTaken)
                    return 0
                }
                return next
            })
        }, 1000)
        return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const current = questions[index]
    const correctAnswer = getAnswerText(current)

    const options = useMemo(() => {
        const wrongs = items
            .filter((i) => i.id !== current.id)
            .map((i) => getAnswerText(i))
            .filter(Boolean)
        return shuffle([correctAnswer, ...shuffle(wrongs).slice(0, 3)])
    }, [current, items, correctAnswer])

    function handleSelect(opt: string) {
        if (selected !== null || finishedRef.current) return
        setSelected(opt)
        const isKnown = opt === correctAnswer
        const newKnown = isKnown ? [...knownRef.current, current.id] : knownRef.current
        const newUnknown = isKnown ? unknownRef.current : [...unknownRef.current, current.id]

        setTimeout(() => {
            if (index + 1 >= questions.length && !finishedRef.current) {
                finishedRef.current = true
                const timeTaken = MINI_TEST_TIME - timeLeftRef.current
                onFinish(newKnown, newUnknown, timeTaken)
            } else {
                setKnown(newKnown)
                setUnknown(newUnknown)
                setIndex((i) => i + 1)
                setSelected(null)
            }
        }, 800)
    }

    const timerWarning = timeLeft <= 60

    return (
        <div className={styles.practiceContainer}>
            <PracticeHeader
                onBack={onBack}
                index={index}
                total={questions.length}
                extra={
                    <div className={`${styles.timer} ${timerWarning ? styles.timerWarning : ""}`}>
                        <Timer size={14} />
                        {formatTime(timeLeft)}
                    </div>
                }
            />
            <ProgressBar index={index} total={questions.length} />

            <div className={styles.quizCard}>
                <TypeBadge type={current.item_type} />
                <div className={styles.cardTitle}>{current.display.title}</div>
                {current.display.subtitle && (
                    <div className={styles.cardSubtitle}>{current.display.subtitle}</div>
                )}
                <div className={styles.quizQuestion}>Nghĩa của từ này là gì?</div>
            </div>

            <div className={styles.optionsList}>
                {options.map((opt, i) => {
                    let cls = styles.optionBtn
                    if (selected !== null) {
                        if (opt === correctAnswer) cls += ` ${styles.optionCorrect}`
                        else if (opt === selected) cls += ` ${styles.optionWrong}`
                        else cls += ` ${styles.optionDimmed}`
                    }
                    return (
                        <button key={i} className={cls} onClick={() => handleSelect(opt)}>
                            <span className={styles.optionLabel}>
                                {String.fromCharCode(65 + i)}
                            </span>
                            {opt}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// ─── Summary ──────────────────────────────────────────────────────────────────

function Summary({
    items,
    summary,
    mode,
    onRestart,
    onChangeMode,
}: {
    items: EnrichedNotebookItem[]
    summary: SummaryData
    mode: PracticeMode
    onRestart: () => void
    onChangeMode: () => void
}) {
    const total = summary.known.length + summary.unknown.length
    const percent = total > 0 ? Math.round((summary.known.length / total) * 100) : 0
    const unknownItems = items.filter((i) => summary.unknown.includes(i.id))

    return (
        <div className={styles.summaryContainer}>
            <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Kết quả · {MODE_LABEL[mode]}</h2>

                <div className={styles.scoreRow}>
                    <div className={styles.scoreBlock}>
                        <span className={styles.scoreNumber}>{summary.known.length}</span>
                        <span className={styles.scoreLabel}>Đúng</span>
                    </div>
                    <div className={styles.scoreDivider} />
                    <div className={styles.scoreBlock}>
                        <span className={`${styles.scoreNumber} ${styles.unknownScore}`}>
                            {summary.unknown.length}
                        </span>
                        <span className={styles.scoreLabel}>Sai</span>
                    </div>
                    <div className={styles.scoreDivider} />
                    <div className={styles.scoreBlock}>
                        <span className={`${styles.scoreNumber} ${styles.percentScore}`}>
                            {percent}%
                        </span>
                        <span className={styles.scoreLabel}>Chính xác</span>
                    </div>
                    {summary.timeTaken !== undefined && (
                        <>
                            <div className={styles.scoreDivider} />
                            <div className={styles.scoreBlock}>
                                <span className={`${styles.scoreNumber} ${styles.timeScore}`}>
                                    {formatTime(summary.timeTaken)}
                                </span>
                                <span className={styles.scoreLabel}>Thời gian</span>
                            </div>
                        </>
                    )}
                </div>

                {unknownItems.length > 0 && (
                    <div className={styles.unknownSection}>
                        <h3 className={styles.unknownTitle}>
                            Cần ôn lại ({unknownItems.length})
                        </h3>
                        <ul className={styles.unknownList}>
                            {unknownItems.map((item) => (
                                <li key={item.id}>
                                    <Link href={item.display.href} className={styles.unknownItem}>
                                        <span
                                            className={`${styles.typeBadgeSmall} ${styles[item.item_type]}`}
                                        >
                                            {TYPE_LABEL[item.item_type]}
                                        </span>
                                        <span className={styles.unknownItemTitle}>
                                            {item.display.title}
                                        </span>
                                        {item.display.meaning && (
                                            <span className={styles.unknownItemMeaning}>
                                                {item.display.meaning}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className={styles.summaryActions}>
                    <button className={styles.restartBtn} onClick={onRestart}>
                        <RotateCcw size={15} />
                        Luyện lại
                    </button>
                    <button className={styles.changeModeBtn} onClick={onChangeMode}>
                        <ClipboardList size={15} />
                        Đổi chế độ
                    </button>
                    <Link href="/notebooks" className={styles.backToNotebookBtn}>
                        <BookOpen size={15} />
                        Về sổ tay
                    </Link>
                </div>
            </div>
        </div>
    )
}
