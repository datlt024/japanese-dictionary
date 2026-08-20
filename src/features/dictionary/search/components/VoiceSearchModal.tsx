"use client"

import {
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react"
import { createPortal } from "react-dom"
import { Mic, Pause, Search } from "lucide-react"
import { Button } from "antd"

import styles from "./VoiceSearchModal.module.css"

import { useFocusTrap } from "@/shared/hooks/useFocusTrap"

import useSearchHub, {
    SearchGrammar,
    SearchKanji,
    SearchVocabulary,
} from "../hooks/useSearchHub"
import useVoiceSearch, {
    VoiceSearchLanguage,
} from "../hooks/useVoiceSearch"

import type { DictionaryLanguage } from "@/shared/types/dictionaryLanguage"
import type { SearchTab } from "@/shared/constants/search-tabs"

type VoiceSearchModalProps = {
    open: boolean
    activeTab: SearchTab
    dictionaryLanguage: DictionaryLanguage
    onClose: () => void
    onResult: (text: string) => void
}

type Suggestion = {
    text: string
    subText?: string
}

const LANGUAGE_LABELS: Record<VoiceSearchLanguage, string> = {
    "ja-JP": "Tiếng Nhật",
    "vi-VN": "Tiếng Việt",
}

function getKanaText(kana: SearchVocabulary["kana"]) {
    if (Array.isArray(kana)) {
        return kana[0] || null
    }

    return kana || null
}

function isKanji(item: unknown): item is SearchKanji {
    return (
        typeof item === "object" &&
        item !== null &&
        "kanji" in item &&
        typeof item.kanji === "string"
    )
}

function isGrammar(item: unknown): item is SearchGrammar {
    return (
        typeof item === "object" &&
        item !== null &&
        "pattern" in item &&
        typeof item.pattern === "string"
    )
}

function createVocabularySuggestion(
    vocabulary: SearchVocabulary
): Suggestion {
    const kana = getKanaText(vocabulary.kana)

    return {
        text: vocabulary.word,
        subText:
            kana && kana !== vocabulary.word
                ? kana
                : undefined,
    }
}

function createFallbackSuggestion(
    item: SearchKanji | SearchGrammar
): Suggestion {
    if (isKanji(item)) {
        return {
            text: item.kanji,
        }
    }

    return {
        text: item.pattern,
        subText: item.reading || undefined,
    }
}

function dedupeSuggestions(items: Suggestion[]) {
    return items.filter(
        (item, index, self) =>
            self.findIndex(
                (current) => current.text === item.text
            ) === index
    )
}

export default function VoiceSearchModal({
    open,
    activeTab,
    dictionaryLanguage,
    onClose,
    onResult,
}: VoiceSearchModalProps) {
    const [voiceLanguage, setVoiceLanguage] =
        useState<VoiceSearchLanguage>("ja-JP")

    const modalRef = useRef<HTMLDivElement>(null)
    useFocusTrap(modalRef, open, onClose)

    const handleFinalResult = useCallback(() => {
        // Không tự động tra.
        // Chỉ giữ transcript để lấy gợi ý gần đúng / đồng âm.
    }, [])

    const {
        supported,
        listening,
        transcript,
        error,
        start,
        stop,
    } = useVoiceSearch(voiceLanguage, handleFinalResult)

    const normalizedTranscript = transcript.trim()

    const { result: transcriptResult } = useSearchHub(
        normalizedTranscript,
        activeTab,
        dictionaryLanguage
    )

    const inferredKana = useMemo(() => {
        const firstVocabulary =
            transcriptResult.vocabularies[0]

        if (!firstVocabulary) {
            return ""
        }

        return getKanaText(firstVocabulary.kana) || ""
    }, [transcriptResult.vocabularies])

    const shouldSearchHomophones =
        Boolean(inferredKana) &&
        inferredKana !== normalizedTranscript

    const { result: homophoneResult } = useSearchHub(
        shouldSearchHomophones ? inferredKana : "",
        "vocabulary",
        dictionaryLanguage
    )

    const suggestions = useMemo(() => {
        const homophoneSuggestions =
            homophoneResult.vocabularies.map(
                createVocabularySuggestion
            )

        const transcriptVocabularySuggestions =
            transcriptResult.vocabularies.map(
                createVocabularySuggestion
            )

        const fallbackSuggestions = [
            ...transcriptResult.kanjis,
            ...transcriptResult.grammars,
        ]
            .filter(
                (item): item is SearchKanji | SearchGrammar =>
                    isKanji(item) || isGrammar(item)
            )
            .map(createFallbackSuggestion)

        return dedupeSuggestions([
            ...homophoneSuggestions,
            ...transcriptVocabularySuggestions,
            ...fallbackSuggestions,
        ]).slice(0, 6)
    }, [homophoneResult, transcriptResult])

    if (!open || typeof document === "undefined") {
        return null
    }

    function toggleLanguage() {
        setVoiceLanguage((current) =>
            current === "ja-JP" ? "vi-VN" : "ja-JP"
        )
    }

    function handleMicClick() {
        if (listening) {
            stop()
            return
        }

        start()
    }

    function handleSuggestionClick(text: string) {
        onResult(text)
        onClose()
    }

    const shouldShowSuggestions =
        normalizedTranscript && suggestions.length > 0

    const shouldShowTranscriptOnly =
        normalizedTranscript && suggestions.length === 0

    const modal = (
        <div
            className={styles.overlay}
            onClick={onClose}
            role="presentation"
        >
            <div
                className={styles.modal}
                ref={modalRef}
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Tra cứu bằng giọng nói"
            >
                <div className={styles.header}>
                    <h2>Tra cứu bằng giọng nói</h2>

                    <Button
                        type="text"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Đóng"
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, padding: 0, borderRadius: 999, border: "1px solid var(--color-border)", background: "var(--color-surface-muted)" }}
                    >
                        ×
                    </Button>
                </div>

                <div className={styles.body}>
                    {shouldShowSuggestions ? (
                        <div className={styles.suggestions}>
                            {suggestions.map((suggestion) => (
                                <Button
                                    key={suggestion.text}
                                    type="text"
                                    className={styles.suggestionItem}
                                    onClick={() =>
                                        handleSuggestionClick(
                                            suggestion.text
                                        )
                                    }
                                    style={{ display: "flex", alignItems: "center", height: "auto", width: "100%", padding: "10px 12px", textAlign: "left", gap: 12, borderRadius: 12 }}
                                >
                                    <Search size={20} />

                                    <span>
                                        <span>
                                            {suggestion.text}
                                        </span>

                                        {suggestion.subText && (
                                            <span
                                                className={
                                                    styles.suggestionKana
                                                }
                                            >
                                                {suggestion.subText}
                                            </span>
                                        )}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    ) : shouldShowTranscriptOnly ? (
                        <div className={styles.transcriptBox}>
                            <p className={styles.transcriptLabel}>
                                Đã nhận diện
                            </p>

                            <Button
                                type="primary"
                                className={styles.transcriptButton}
                                onClick={() =>
                                    handleSuggestionClick(
                                        normalizedTranscript
                                    )
                                }
                                style={{ height: "auto", padding: "10px 16px", borderRadius: 12, fontSize: 16, fontWeight: 800, border: "1px solid var(--color-primary-soft)", background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
                            >
                                {`Tra "${normalizedTranscript}"`}
                            </Button>
                        </div>
                    ) : (
                        <div className={styles.message}>
                            {listening
                                ? "Đang nghe..."
                                : "Nhấn ghi âm giọng nói để tìm kiếm"}
                        </div>
                    )}

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    {!supported && (
                        <div className={styles.error}>
                            Trình duyệt này chưa hỗ trợ nhận diện giọng nói.
                        </div>
                    )}
                </div>

                <div className={styles.visualizer}>
                    {Array.from({ length: 56 }).map((_, index) => (
                        <span
                            key={index}
                            className={
                                listening
                                    ? styles.waveBar
                                    : styles.idleDot
                            }
                            style={{
                                animationDelay: `${index * 0.035}s`,
                            }}
                        />
                    ))}
                </div>

                <div className={styles.languageRow}>
                    <span
                        className={
                            voiceLanguage === "ja-JP"
                                ? styles.activeLanguage
                                : styles.language
                        }
                    >
                        Tiếng Nhật
                    </span>

                    <Button
                        type="text"
                        className={styles.switchButton}
                        onClick={toggleLanguage}
                    >
                        ↔
                    </Button>

                    <span
                        className={
                            voiceLanguage === "vi-VN"
                                ? styles.activeLanguage
                                : styles.language
                        }
                    >
                        Tiếng Việt
                    </span>
                </div>

                <Button
                    type="primary"
                    shape="circle"
                    className={
                        listening
                            ? `${styles.micButton} ${styles.listening}`
                            : styles.micButton
                    }
                    onClick={handleMicClick}
                    disabled={!supported}
                    aria-label={`Ghi âm bằng ${LANGUAGE_LABELS[voiceLanguage]}`}
                    icon={listening ? (
                        <Pause size={24} fill="currentColor" />
                    ) : (
                        <Mic size={22} />
                    )}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, margin: "0 auto 24px", borderRadius: 999, background: "var(--color-primary-soft)", borderColor: "var(--color-primary-soft)", color: "var(--color-primary)" }}
                />
            </div>
        </div>
    )

    const portalRoot =
        document.getElementById("portal-root") || document.body

    return createPortal(modal, portalRoot)
}