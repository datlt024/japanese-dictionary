"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { Button } from "antd"

import type { DailyVocabularyItem } from "./DailyVocabularySection"

import {
    getQuickLookupTarget,
    type QuickLookupTarget,
} from "@/features/dictionary/quick-lookup/services/quick-lookup.service"
import QuickLookupModal from "@/features/dictionary/quick-lookup/components/QuickLookupModal"

import styles from "./DailyVocabularySection.module.css"
import modalStyles from "./DailyVocabularyModal.module.css"

import { useFocusTrap } from "@/shared/hooks/useFocusTrap"

const VISIBLE_COUNT = 4

type Props = {
    items: DailyVocabularyItem[]
}

function VocabCard({
    item,
    className,
    onClick,
    onMouseEnter,
}: {
    item: DailyVocabularyItem
    className: string
    onClick: () => void
    onMouseEnter?: () => void
}) {
    return (
        <Button
            type="text"
            className={className}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            style={{ display: "flex", flexDirection: "column", alignItems: "stretch", height: "auto", width: "100%", padding: "18px 20px", textAlign: "left", gap: 8 }}
        >
            <div className={styles.cardTop}>
                <span className={styles.word}>{item.word}</span>
                {item.jlpt && (
                    <span className={styles.jlptBadge} data-level={item.jlpt}>{item.jlpt}</span>
                )}
            </div>

            <span className={styles.reading}>{item.reading}</span>

            <div className={styles.divider} />

            <div className={styles.cardBottom}>
                <span className={styles.type}>{item.type}</span>
                <span className={styles.meaning}>{item.meaning}</span>
            </div>
        </Button>
    )
}

function SuggestionsModal({
    items,
    onClose,
    onSelectItem,
    onHoverItem,
}: {
    items: DailyVocabularyItem[]
    onClose: () => void
    onSelectItem: (item: DailyVocabularyItem) => void
    onHoverItem: (item: DailyVocabularyItem) => void
}) {
    const onCloseRef = useRef(onClose)
    const modalRef = useRef<HTMLDivElement>(null)
    useFocusTrap(modalRef, true, onClose)

    useEffect(() => { onCloseRef.current = onClose }, [onClose])

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onCloseRef.current()
        }
        document.addEventListener("keydown", handleKey)
        return () => document.removeEventListener("keydown", handleKey)
    }, [])

    const modal = (
        <div
            className={modalStyles.overlay}
            onClick={onClose}
            role="presentation"
        >
            <div
                className={modalStyles.modal}
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Từ vựng đề xuất"
            >
                <div className={modalStyles.header}>
                    <h2>Từ vựng đề xuất</h2>
                    <Button
                        type="text"
                        icon={<X size={15} />}
                        onClick={onClose}
                        aria-label="Đóng"
                        className={modalStyles.closeButton}
                    />
                </div>

                <div className={modalStyles.body}>
                    <div className={modalStyles.grid}>
                        {items.map((item) => (
                            <VocabCard
                                key={item.word}
                                item={item}
                                className={`${styles.card} ${modalStyles.card}`}
                                onClick={() => {
                                    onClose()
                                    onSelectItem(item)
                                }}
                                onMouseEnter={() => onHoverItem(item)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )

    const root =
        typeof document !== "undefined"
            ? document.getElementById("portal-root") ?? document.body
            : null

    return root ? createPortal(modal, root) : null
}

export default function DailyVocabularySectionClient({ items }: Props) {
    const [suggestionsOpen, setSuggestionsOpen] = useState(false)
    const [lookupOpen, setLookupOpen] = useState(false)
    const [lookupTarget, setLookupTarget] = useState<QuickLookupTarget | null>(null)
    const [loadingWord, setLoadingWord] = useState<string | null>(null)
    const cacheRef = useRef(new Map<string, QuickLookupTarget>())
    const pendingRef = useRef(new Map<string, Promise<QuickLookupTarget>>())
    const activeWordRef = useRef<string | null>(null)

    const visible = items.slice(0, VISIBLE_COUNT)

    // Returns cached result immediately, reuses in-flight promise, or starts new fetch
    function fetchAndCache(word: string): Promise<QuickLookupTarget> {
        const cached = cacheRef.current.get(word)
        if (cached) return Promise.resolve(cached)

        const pending = pendingRef.current.get(word)
        if (pending) return pending

        const promise = getQuickLookupTarget(word, "vi").then((t) => {
            cacheRef.current.set(word, t)
            pendingRef.current.delete(word)
            return t
        })
        pendingRef.current.set(word, promise)
        return promise
    }

    // Prefetch all visible cards on mount so first click is instant
    useEffect(() => {
        visible.forEach((item) => fetchAndCache(item.word))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function handleCardClick(item: DailyVocabularyItem) {
        const cached = cacheRef.current.get(item.word)
        if (cached) {
            setLookupTarget(cached)
            setLoadingWord(null)
            setLookupOpen(true)
            return
        }

        // Open modal immediately with loading state, reuse in-flight fetch
        activeWordRef.current = item.word
        setLookupTarget(null)
        setLoadingWord(item.word)
        setLookupOpen(true)

        const target = await fetchAndCache(item.word)
        if (activeWordRef.current === item.word) {
            setLookupTarget(target)
            setLoadingWord(null)
        }
    }

    function handleCardHover(item: DailyVocabularyItem) {
        fetchAndCache(item.word)
    }

    function handleClose() {
        activeWordRef.current = null
        setLookupOpen(false)
        setLookupTarget(null)
        setLoadingWord(null)
    }

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>Từ vựng trong ngày</h2>
                <Button
                    type="link"
                    className={styles.viewMore}
                    onClick={() => setSuggestionsOpen(true)}
                >
                    Xem thêm
                </Button>
            </div>

            <div className={styles.grid}>
                {visible.map((item) => (
                    <VocabCard
                        key={item.word}
                        item={item}
                        className={styles.card}
                        onClick={() => handleCardClick(item)}
                        onMouseEnter={() => handleCardHover(item)}
                    />
                ))}
            </div>

            {suggestionsOpen && (
                <SuggestionsModal
                    items={items}
                    onClose={() => setSuggestionsOpen(false)}
                    onSelectItem={(item) => {
                        setSuggestionsOpen(false)
                        handleCardClick(item)
                    }}
                    onHoverItem={handleCardHover}
                />
            )}

            <QuickLookupModal
                open={lookupOpen}
                target={lookupTarget}
                loadingTitle={loadingWord ?? undefined}
                onClose={handleClose}
            />
        </section>
    )
}
