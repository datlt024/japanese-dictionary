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

import styles from "./HandwritingModal.module.css"

type Props = {
    open: boolean
    onClose: () => void
    onSelect: (text: string) => void
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

const CANVAS_ID = "handwriting-kanji-canvas"

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
}: Props) {
    const initializedRef = useRef(false)
    const kanjiCanvasLoadedRef = useRef(false)
    const refPatternsLoadedRef = useRef(false)

    const [mounted, setMounted] = useState(false)
    const [scriptsReady, setScriptsReady] = useState(false)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [hasDrawing, setHasDrawing] = useState(false)
    const [isRecognizing, setIsRecognizing] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

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
            window.KanjiCanvas.erase(CANVAS_ID)
        } catch {
            // ignore vendor canvas errors
        }
    }, [])

    const resetWritingArea = useCallback(() => {
        clearCanvas()
        resetState()
    }, [clearCanvas, resetState])

    const handleClose = useCallback(() => {
        resetWritingArea()
        onClose()
    }, [onClose, resetWritingArea])

    const recognize = useCallback(() => {
        if (!window.KanjiCanvas || !hasDrawing) {
            setSuggestions([])
            return
        }

        setIsRecognizing(true)

        try {
            const result = window.KanjiCanvas.recognize(CANVAS_ID)
            setSuggestions(normalizeCandidates(result))
        } catch {
            setSuggestions([])
        } finally {
            setIsRecognizing(false)
        }
    }, [hasDrawing])

    function handleStartDrawing() {
        setHasDrawing(true)
        setSuggestions([])
    }

    function handleEndDrawing() {
        window.setTimeout(() => {
            recognize()
        }, 350)
    }

    function handleClear() {
        resetWritingArea()
    }

    function handleUndo() {
        if (!window.KanjiCanvas || !hasDrawing) {
            return
        }

        try {
            window.KanjiCanvas.deleteLast(CANVAS_ID)
            setSuggestions([])

            window.setTimeout(() => {
                recognize()
            }, 350)
        } catch {
            // ignore vendor canvas errors
        }
    }

    function handleSearch() {
        handleClose()
    }

    function handleSelect(text: string) {
        onSelect(text)
        resetWritingArea()
    }

    useEffect(() => {
        if (!scriptsReady || !window.KanjiCanvas || initializedRef.current) {
            return
        }

        try {
            window.KanjiCanvas.init(CANVAS_ID)
            window.KanjiCanvas.erase(CANVAS_ID)
            initializedRef.current = true
        } catch {
            // ignore vendor canvas errors
        }
    }, [scriptsReady])

    const modal = (
        <div
            className={
                open
                    ? styles.overlay
                    : `${styles.overlay} ${styles.overlayHidden}`
            }
            aria-hidden={!open}
        >
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Nhận dạng nét vẽ</h2>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={handleClose}
                        aria-label="Đóng"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.drawArea}>
                        <div className={styles.canvasWrap}>
                            <canvas
                                id={CANVAS_ID}
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
                            <button
                                type="button"
                                onClick={handleClear}
                                disabled={!hasDrawing}
                            >
                                <span>🗑</span>
                                <span>Xóa tất cả</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleUndo}
                                disabled={!hasDrawing}
                            >
                                <span>↩</span>
                                <span>Hoàn tác</span>
                            </button>

                            <button
                                type="button"
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
                            </button>
                        </div>
                    </div>

                    <div className={styles.resultArea}>
                        <h3>Kết quả gợi ý</h3>

                        {suggestions.length > 0 ? (
                            <div className={styles.suggestions}>
                                {suggestions.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() =>
                                            handleSelect(item)
                                        }
                                    >
                                        {item}
                                    </button>
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
                src="/vendor/kanji-canvas/kanji-canvas.min.js?v=10"
                strategy="afterInteractive"
                onLoad={() => {
                    kanjiCanvasLoadedRef.current = true
                    updateScriptsReady()
                }}
            />

            <Script
                src="/vendor/kanji-canvas/ref-patterns.js?v=10"
                strategy="afterInteractive"
                onLoad={() => {
                    refPatternsLoadedRef.current = true
                    updateScriptsReady()
                }}
            />

            {mounted ? createPortal(modal, document.body) : null}
        </>
    )
}