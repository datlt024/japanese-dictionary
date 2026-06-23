"use client"

import { useState } from "react"

import styles from "./VocabularyWordHeader.module.css"

import ActionButtons from "@/shared/components/ActionButtons/ActionButtons"
import AuthModal from "@/features/auth/components/AuthModal/AuthModal"
import AddToNotebookModal from "@/features/notebook/components/AddToNotebookModal/AddToNotebookModal"

import {
    Star,
    FilePenLine,
    Volume2,
} from "lucide-react"

import { speakJapanese } from "@/shared/lib/tts/speakJapanese"

import type {
    Vocabulary,
    VocabularyRubyItem,
} from "@/domain/vocabulary/vocabulary.type"

type Props = {
    vocabulary: Vocabulary
    meaning: string
    hasSuruVerb: boolean
    verbGroupLabel: string | null
}

function WordWithFurigana({
    ruby,
    fallback,
}: {
    ruby: VocabularyRubyItem[]
    fallback: string
}) {
    if (ruby.length === 0) {
        return (
            <h1 className={styles.detailWord}>
                {fallback}
            </h1>
        )
    }

    return (
        <h1 className={styles.detailWord}>
            {ruby.map((item, index) => {
                if (!item.reading) {
                    return (
                        <span key={`${item.text}-${index}`}>
                            {item.text}
                        </span>
                    )
                }

                return (
                    <ruby key={`${item.text}-${index}`}>
                        {item.text}
                        <rt>{item.reading}</rt>
                    </ruby>
                )
            })}
        </h1>
    )
}

export default function VocabularyWordHeader({
    vocabulary,
    meaning,
    hasSuruVerb,
    verbGroupLabel,
}: Props) {
    const ruby = vocabulary.ruby ?? []

    const [notebookOpen, setNotebookOpen] = useState(false)
    const [authOpen, setAuthOpen] = useState(false)

    function handleSpeak() {
        speakJapanese(vocabulary.kana || vocabulary.word)
    }

    function handleLoginRequired() {
        setNotebookOpen(false)
        setAuthOpen(true)
    }

    return (
        <>
        <div className={styles.detailHeader}>
            <div className={styles.headerContent}>
                <div className={styles.wordBlock}>
                    <div className={styles.wordRow}>
                        <WordWithFurigana
                            ruby={ruby}
                            fallback={vocabulary.word}
                        />
                    </div>

                    <div className={styles.badgeRow}>
                        {vocabulary.jlpt && (
                            <span className={styles.levelBadge}>
                                {vocabulary.jlpt}
                            </span>
                        )}

                        {vocabulary.is_common && (
                            <span className={styles.commonBadge}>
                                Từ thông dụng
                            </span>
                        )}

                        {hasSuruVerb && (
                            <span className={styles.verbBadge}>
                                vs
                            </span>
                        )}

                        {verbGroupLabel && (
                            <span className={styles.neutralBadge}>
                                {verbGroupLabel}
                            </span>
                        )}
                    </div>

                    <p className={styles.detailMeaning}>
                        {meaning}
                    </p>
                </div>

                <div className={styles.headerAside}>
                    <ActionButtons
                        items={[
                            {
                                key: "speak",
                                label: "Phát âm",
                                icon: <Volume2 />,
                                onClick: handleSpeak,
                            },
                            {
                                key: "note",
                                label: "Ghi chú",
                                icon: <FilePenLine />,
                            },
                            {
                                key: "bookmark",
                                label: "Thêm vào sổ tay",
                                icon: <Star />,
                                onClick: () => setNotebookOpen(true),
                            },
                        ]}
                    />

                    <div className={styles.pitchBox}>
                        <span className={styles.pitchLabel}>
                            Heiban（平板型）
                        </span>

                        <div className={styles.pitchGraph}>
                            <span />
                            <span />
                            <span />
                            <span />
                        </div>

                        <button
                            type="button"
                            className={styles.pitchPlayButton}
                            aria-label="Phát âm pitch accent"
                            onClick={handleSpeak}
                        >
                            ▶
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <AddToNotebookModal
            open={notebookOpen}
            onClose={() => setNotebookOpen(false)}
            itemType="vocabulary"
            itemId={String(vocabulary.id)}
            onLoginRequired={handleLoginRequired}
        />

        <AuthModal
            open={authOpen}
            onClose={() => setAuthOpen(false)}
        />
        </>
    )
}