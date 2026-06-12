"use client"

import styles from "./VocabularyWordHeader.module.css"

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

function SpeakerIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M4 9.5V14.5H8L13 19V5L8 9.5H4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />

            <path
                d="M16 9C17 10 17.5 11 17.5 12C17.5 13 17 14 16 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />

            <path
                d="M18.5 6.5C20 8 21 10 21 12C21 14 20 16 18.5 17.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    )
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

    function handleSpeak() {
        speakJapanese(vocabulary.kana || vocabulary.word)
    }

    return (
        <div className={styles.detailHeader}>
            <div className={styles.headerContent}>
                <div className={styles.wordBlock}>
                    <div className={styles.wordRow}>
                        <WordWithFurigana
                            ruby={ruby}
                            fallback={vocabulary.word}
                        />

                        <button
                            type="button"
                            className={styles.soundButton}
                            aria-label="Phát âm"
                            onClick={handleSpeak}
                        >
                            <SpeakerIcon />
                        </button>
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
                    <div className={styles.detailActions}>
                        <button type="button" aria-label="Lưu">
                            ☆
                        </button>

                        <button type="button" aria-label="Thêm">
                            ＋
                        </button>

                        <button type="button" aria-label="Menu">
                            ☷
                        </button>
                    </div>

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
    )
}