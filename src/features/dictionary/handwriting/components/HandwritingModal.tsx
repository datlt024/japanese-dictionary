"use client"

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react"
import { createPortal } from "react-dom"
import Script from "next/script"
import { X } from "lucide-react"
import { Button } from "antd"

import styles from "./HandwritingModal.module.css"

import { useFocusTrap } from "@/shared/hooks/useFocusTrap"

type Props = {
    open: boolean
    onClose: () => void
    onSelect: (text: string) => void
    onSearch: () => void
}

type KanjiCanvasResult =
    | string
    | Array<string | number>
    | {
        kanji?: string
        character?: string
        char?: string
    }

type KanjiCanvasRecognizeResult =
    | string
    | KanjiCanvasResult[]
    | undefined

type KanjiCanvasApi = {
    refPatterns?: unknown[]
    init: (canvasId: string) => void
    erase: (canvasId: string) => void
    deleteLast: (canvasId: string) => void
    recognize: (canvasId: string) => KanjiCanvasRecognizeResult
}

declare global {
    interface Window {
        KanjiCanvas?: KanjiCanvasApi
    }
}

const DEFAULT_CANVAS_ID = "handwriting-kanji-canvas"

function createCanvasId() {
    return `${DEFAULT_CANVAS_ID}-${Date.now()}`
}

function normalizeCandidates(result: KanjiCanvasRecognizeResult) {
    if (!result) {
        return []
    }

    if (typeof result === "string") {
        return Array.from(result)
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 12)
    }

    if (!Array.isArray(result)) {
        return []
    }

    return result
        .map((item) => {
            if (typeof item === "string") {
                return item.trim()
            }

            if (Array.isArray(item)) {
                return String(item[0] || "").trim()
            }

            return (
                item.kanji ||
                item.character ||
                item.char ||
                ""
            ).trim()
        })
        .filter((item) => item.length > 0)
        .slice(0, 12)
}

export default function HandwritingModal({
    open,
    onClose,
    onSelect,
    onSearch,
}: Props) {
    const initializedRef = useRef(false)
    const kanjiCanvasLoadedRef = useRef(false)
    const refPatternsLoadedRef = useRef(false)
    const recognizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const modalRef = useRef<HTMLDivElement>(null)

    const [mounted, setMounted] = useState(false)
    const [canvasId, setCanvasId] = useState(DEFAULT_CANVAS_ID)
    const [scriptsReady, setScriptsReady] = useState(false)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [hasDrawing, setHasDrawing] = useState(false)
    const [isRecognizing, setIsRecognizing] = useState(false)

    const updateScriptsReady = useCallback(() => {
        setScriptsReady(
            kanjiCanvasLoadedRef.current &&
            refPatternsLoadedRef.current &&
            Boolean(window.KanjiCanvas)
        )
    }, [])

    const resetState = useCallback(() => {
        setSuggestions([])
        setHasDrawing(false)
        setIsRecognizing(false)
    }, [])

    const clearCanvas = useCallback(() => {
        if (!window.KanjiCanvas) {
            return
        }

        try {
            window.KanjiCanvas.erase(canvasId)
        } catch {
            // ignore vendor canvas errors
        }
    }, [canvasId])

    const resetWritingArea = useCallback(() => {
        clearCanvas()
        resetState()
    }, [clearCanvas, resetState])

    const handleClose = useCallback(() => {
        initializedRef.current = false
        resetWritingArea()
        onClose()
    }, [onClose, resetWritingArea])

    useFocusTrap(modalRef, open, handleClose)

    const recognize = useCallback(() => {
        if (!window.KanjiCanvas || !hasDrawing) {
            setSuggestions([])
            return
        }

        setIsRecognizing(true)

        try {
            const result = window.KanjiCanvas.recognize(canvasId)
            setSuggestions(normalizeCandidates(result))
        } catch {
            setSuggestions([])
        } finally {
            setIsRecognizing(false)
        }
    }, [canvasId, hasDrawing])

    function handleStartDrawing() {
        setHasDrawing(true)
        setSuggestions([])
    }

    function handleEndDrawing() {
        if (recognizeTimerRef.current) clearTimeout(recognizeTimerRef.current)
        recognizeTimerRef.current = setTimeout(() => { recognize() }, 350)
    }

    function handleClear() {
        resetWritingArea()
    }

    function handleUndo() {
        if (!window.KanjiCanvas || !hasDrawing) {
            return
        }

        try {
            window.KanjiCanvas.deleteLast(canvasId)
            setSuggestions([])

            if (recognizeTimerRef.current) clearTimeout(recognizeTimerRef.current)
            recognizeTimerRef.current = setTimeout(() => { recognize() }, 350)
        } catch {
            // ignore vendor canvas errors
        }
    }

    function handleSearch() {
        onSearch()
        handleClose()
    }

    function handleSelect(text: string) {
        onSelect(text)
        resetWritingArea()
    }

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setMounted(true)
        }, 0)

        return () => {
            window.clearTimeout(timer)
            if (recognizeTimerRef.current) window.clearTimeout(recognizeTimerRef.current)
        }
    }, [])

    useEffect(() => {
        if (!window.KanjiCanvas) {
            return
        }

        const timer = window.setTimeout(() => {
            kanjiCanvasLoadedRef.current = true
            refPatternsLoadedRef.current = true
            setScriptsReady(true)
        }, 0)

        return () => {
            window.clearTimeout(timer)
        }
    }, [])

    useEffect(() => {
        if (!open) {
            return
        }

        initializedRef.current = false

        const timer = window.setTimeout(() => {
            setCanvasId(createCanvasId())
            resetState()
        }, 0)

        return () => {
            window.clearTimeout(timer)
        }
    }, [open, resetState])

    useEffect(() => {
        if (
            !open ||
            !scriptsReady ||
            !window.KanjiCanvas ||
            initializedRef.current
        ) {
            return
        }

        let timer: number | null = null
        try {
            window.KanjiCanvas.init(canvasId)

            timer = window.setTimeout(() => {
                window.KanjiCanvas?.erase(canvasId)
                initializedRef.current = true
            }, 50)
        } catch {
            // ignore vendor canvas errors
        }
        return () => { if (timer !== null) window.clearTimeout(timer) }
    }, [canvasId, open, scriptsReady])

    const modal = (
        <div
            className={
                open
                    ? styles.overlay
                    : `${styles.overlay} ${styles.overlayHidden}`
            }
            aria-hidden={!open}
        >
            <div
                className={styles.modal}
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-label="Nhập chữ tay"
            >
                <div className={styles.header}>
                    <h2>Nhận dạng nét vẽ</h2>

                    <Button
                        type="text"
                        icon={<X size={20} />}
                        onClick={handleClose}
                        aria-label="Đóng"
                        className={styles.closeButton}
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, padding: 0, borderRadius: 999, border: "1px solid var(--color-border)", background: "var(--color-surface-muted)" }}
                    />
                </div>

                <div className={styles.body}>
                    <div className={styles.drawArea}>
                        <div className={styles.canvasWrap}>
                            <canvas
                                key={canvasId}
                                id={canvasId}
                                className={styles.canvas}
                                width={330}
                                height={330}
                                data-stroke-numbers="false"
                                onMouseDown={handleStartDrawing}
                                onMouseUp={handleEndDrawing}
                                onTouchStart={handleStartDrawing}
                                onTouchEnd={handleEndDrawing}
                            />
                        </div>

                        <div className={styles.actions}>
                            <Button
                                type="default"
                                onClick={handleClear}
                                disabled={!hasDrawing}
                            >
                                <span>🗑</span>
                                <span>Xóa tất cả</span>
                            </Button>

                            <Button
                                type="default"
                                onClick={handleUndo}
                                disabled={!hasDrawing}
                            >
                                <span>↩</span>
                                <span>Hoàn tác</span>
                            </Button>

                            <Button
                                type="primary"
                                className={styles.searchButton}
                                onClick={handleSearch}
                                disabled={!scriptsReady}
                            >
                                <span>🔍</span>
                                <span>
                                    {isRecognizing
                                        ? "Đang nhận dạng..."
                                        : "Tra cứu"}
                                </span>
                            </Button>
                        </div>
                    </div>

                    <div className={styles.resultArea}>
                        <h3>Kết quả gợi ý</h3>

                        {suggestions.length > 0 ? (
                            <div className={styles.suggestions}>
                                {suggestions.map((item) => (
                                    <Button
                                        key={item}
                                        type="default"
                                        onClick={() =>
                                            handleSelect(item)
                                        }
                                    >
                                        {item}
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.emptyHint}>
                                {scriptsReady
                                    ? "Vẽ một chữ kanji, chọn chữ gợi ý để viết tiếp."
                                    : "Đang tải bộ nhận dạng chữ viết tay..."}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <>
            <Script
                src="/vendor/kanji-canvas/kanji-canvas.min.js?v=12"
                strategy="lazyOnload"
                onLoad={() => {
                    kanjiCanvasLoadedRef.current = true
                    const script = document.createElement("script")
                    script.src = "/vendor/kanji-canvas/ref-patterns.js?v=12"
                    script.onload = () => {
                        refPatternsLoadedRef.current = true
                        updateScriptsReady()
                    }
                    script.onerror = () => { /* suppress window error event */ }
                    document.head.appendChild(script)
                }}
                onError={() => { /* suppress window error event */ }}
            />

            {mounted ? createPortal(modal, document.body) : null}
        </>
    )
}