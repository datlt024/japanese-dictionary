"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import styles from "./TranslatorClient.module.css"

const MAX_CHARS = 1000

type Direction = "ja-vi" | "vi-ja"
type TranslateState =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "done"; translation: string; engine: string }
    | { status: "error" }

const LANG_LABELS: Record<string, string> = {
    ja: "Tiếng Nhật",
    vi: "Tiếng Việt",
}

function directionParts(dir: Direction): { sl: string; tl: string } {
    const [sl, tl] = dir.split("-")
    return { sl, tl }
}

type Props = {
    initialText?: string
    initialDirection?: Direction
}

export default function TranslatorClient({
    initialText = "",
    initialDirection = "ja-vi",
}: Props) {
    const [input, setInput] = useState(initialText)
    const [direction, setDirection] = useState<Direction>(initialDirection)
    const [state, setState] = useState<TranslateState>(
        () => initialText.trim() ? { status: "loading" } : { status: "idle" }
    )
    const [copied, setCopied] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const abortRef = useRef<AbortController | null>(null)

    const { sl, tl } = directionParts(direction)

    const fetchTranslation = useCallback(async (
        text: string,
        sl: string,
        tl: string,
        signal: AbortSignal
    ) => {
        const res = await fetch("/api/translate/gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, sl, tl }),
            signal,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        return { translation: data.translation as string, engine: data.engine as string }
    }, [])

    const triggerTranslate = useCallback((text: string, sl: string, tl: string) => {
        const trimmed = text.trim()
        if (!trimmed) { setState({ status: "idle" }); return }

        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        setState({ status: "loading" })
        fetchTranslation(trimmed, sl, tl, controller.signal)
            .then(({ translation, engine }) => setState({ status: "done", translation, engine }))
            .catch((err) => {
                if ((err as Error).name !== "AbortError") setState({ status: "error" })
            })
    }, [fetchTranslation])

    // Auto-translate on initial load
    useEffect(() => {
        if (!initialText.trim()) return
        const { sl, tl } = directionParts(initialDirection)
        const controller = new AbortController()
        abortRef.current = controller
        fetchTranslation(initialText.trim(), sl, tl, controller.signal)
            .then(({ translation, engine }) => setState({ status: "done", translation, engine }))
            .catch((err) => {
                if ((err as Error).name !== "AbortError") setState({ status: "error" })
            })
        return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        triggerTranslate(input, sl, tl)
    }

    function handleClear() {
        setInput("")
        setState({ status: "idle" })
        textareaRef.current?.focus()
    }

    function handleSwap() {
        const newDir: Direction = direction === "ja-vi" ? "vi-ja" : "ja-vi"
        const { sl: newSl, tl: newTl } = directionParts(newDir)
        const currentTranslation = state.status === "done" ? state.translation : ""

        setDirection(newDir)

        if (currentTranslation) {
            setInput(currentTranslation)
            setState({ status: "idle" })
            // Auto-translate the swapped text
            abortRef.current?.abort()
            const controller = new AbortController()
            abortRef.current = controller
            setState({ status: "loading" })
            fetchTranslation(currentTranslation.trim(), newSl, newTl, controller.signal)
                .then(({ translation, engine }) => setState({ status: "done", translation, engine }))
                .catch((err) => {
                    if ((err as Error).name !== "AbortError") setState({ status: "error" })
                })
        } else {
            setState({ status: "idle" })
        }
    }

    async function handleCopy() {
        if (state.status !== "done") return
        await navigator.clipboard.writeText(state.translation)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    function handleSpeakInput() {
        if (sl !== "ja") return
        import("@/shared/lib/tts/speakJapanese").then(({ speakJapanese }) =>
            speakJapanese(input)
        )
    }

    function handleSpeakOutput() {
        if (tl !== "ja" || state.status !== "done") return
        import("@/shared/lib/tts/speakJapanese").then(({ speakJapanese }) =>
            speakJapanese(state.translation)
        )
    }

    const translation = state.status === "done" ? state.translation : ""
    const engine = state.status === "done" ? state.engine : ""
    const engineLabel = engine === "gemini" ? "Gemini AI" : engine === "google" ? "Google Dịch" : ""
    const googleTranslateUrl = `https://translate.google.com/?sl=${sl}&tl=${tl}&text=${encodeURIComponent(input)}&op=translate`

    return (
        <form className={styles.translator} onSubmit={handleSubmit}>
            {/* ── Language bar ── */}
            <div className={styles.langBar}>
                <span className={styles.langName}>{LANG_LABELS[sl]}</span>
                <button
                    type="button"
                    className={styles.swapBtn}
                    onClick={handleSwap}
                    title="Đổi chiều dịch"
                    aria-label="Đổi chiều dịch"
                >
                    <SwapIcon />
                </button>
                <span className={styles.langName}>{LANG_LABELS[tl]}</span>
            </div>

            <div className={styles.panels}>
                {/* ── Input panel ── */}
                <div className={styles.panel}>
                    <textarea
                        ref={textareaRef}
                        className={styles.textarea}
                        value={input}
                        onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                        placeholder={`Nhập ${LANG_LABELS[sl].toLowerCase()}…`}
                        rows={6}
                        autoFocus={!initialText}
                    />

                    <div className={styles.panelFooter}>
                        <span className={styles.charCount}>{input.length}/{MAX_CHARS}</span>
                        <div className={styles.footerActions}>
                            {input && sl === "ja" && (
                                <button
                                    type="button"
                                    className={styles.iconBtn}
                                    onClick={handleSpeakInput}
                                    title="Nghe phát âm"
                                >
                                    <SpeakerIcon />
                                </button>
                            )}
                            {input && (
                                <button
                                    type="button"
                                    className={styles.iconBtn}
                                    onClick={handleClear}
                                    title="Xóa"
                                >
                                    <ClearIcon />
                                </button>
                            )}
                            <button
                                type="submit"
                                className={styles.translateBtn}
                                disabled={!input.trim() || state.status === "loading"}
                            >
                                {state.status === "loading" ? "Đang dịch…" : "Dịch"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.divider} />

                {/* ── Output panel ── */}
                <div className={styles.panel}>
                    <div className={styles.output}>
                        {state.status === "idle" && (
                            <span className={styles.placeholder}>Bản dịch sẽ hiện ở đây…</span>
                        )}
                        {state.status === "loading" && (
                            <span className={styles.loadingDots}>
                                <span /><span /><span />
                            </span>
                        )}
                        {state.status === "done" && (
                            <span className={styles.translationText}>{translation}</span>
                        )}
                        {state.status === "error" && (
                            <span className={styles.errorText}>
                                Không thể dịch. Thử lại hoặc{" "}
                                <a href={googleTranslateUrl} target="_blank" rel="noopener noreferrer">
                                    mở Google Dịch
                                </a>.
                            </span>
                        )}
                    </div>

                    <div className={styles.panelFooter}>
                        {state.status === "done" ? (
                            <>
                                <span className={styles.sourceLabel}>{engineLabel}</span>
                                <div className={styles.footerActions}>
                                    {tl === "ja" && (
                                        <button
                                            type="button"
                                            className={styles.iconBtn}
                                            onClick={handleSpeakOutput}
                                            title="Nghe phát âm"
                                        >
                                            <SpeakerIcon />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className={styles.copyBtn}
                                        onClick={handleCopy}
                                    >
                                        {copied ? "Đã sao chép" : "Sao chép"}
                                    </button>
                                    <a
                                        href={googleTranslateUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.gtLink}
                                    >
                                        Google Dịch ↗
                                    </a>
                                </div>
                            </>
                        ) : (
                            <span />
                        )}
                    </div>
                </div>
            </div>
        </form>
    )
}

function SpeakerIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
    )
}

function SwapIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 16V4m0 0L3 8m4-4l4 4" />
            <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
        </svg>
    )
}

function ClearIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    )
}
