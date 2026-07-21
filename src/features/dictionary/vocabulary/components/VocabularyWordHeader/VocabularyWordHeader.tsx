"use client"

import { useState } from "react"

import styles from "./VocabularyWordHeader.module.css"

import ActionButtons from "@/shared/components/ActionButtons/ActionButtons"
import AuthModal from "@/features/auth/components/AuthModal/AuthModal"
import AddToNotebookModal from "@/features/notebook/components/AddToNotebookModal/AddToNotebookModal"
import VocabularyNoteModal from "@/features/dictionary/vocabulary/components/VocabularyNoteModal/VocabularyNoteModal"
import { useAuth } from "@/features/auth/hooks/useAuth"

import {
    Star,
    FilePenLine,
    Volume2,
} from "lucide-react"

import { speakJapanese } from "@/shared/lib/tts/speakJapanese"

import {
    getKanaMorae,
    getPitchAccentLabel,
    getPitchAccentType,
    getPitchPattern,
} from "@/features/dictionary/vocabulary/utils/pitch-accent"

import type {
    Vocabulary,
    VocabularyRubyItem,
} from "@/domain/vocabulary/vocabulary.type"

type Props = {
    vocabulary: Vocabulary
    meaning: string
    verbGroupLabel: string | null
    pitch?: number | null
}

// SVG pitch graph — renders H/L dots and connecting lines for each mora
function PitchGraph({ kana, pitch }: { kana: string; pitch: number }) {
    const morae = getKanaMorae(kana)
    const pattern = getPitchPattern(pitch, morae.length)
    const type = getPitchAccentType(pitch, morae.length)
    const label = getPitchAccentLabel(type)

    // Layout constants
    const DOT_R = 4
    const STEP = 26
    const PAD_X = 12          // left padding for first dot center
    const HIGH_Y = 8           // center Y for high pitch dots
    const LOW_Y = 28           // center Y for low pitch dots
    const TEXT_Y = 46          // SVG text baseline (10px font, below dots)
    const svgWidth = morae.length * STEP + PAD_X + 4
    const svgHeight = 52       // space for dots (0-36) + gap + text (42-52)

    const cx = (i: number) => i * STEP + PAD_X

    return (
        <div className={styles.pitchBox}>
            <div className={styles.pitchTopRow}>
                <span className={styles.pitchLabel}>{label}</span>
                <span className={styles.pitchNumber}>{pitch}</span>
            </div>

            <svg
                width={svgWidth}
                height={svgHeight}
                className={styles.pitchSvg}
                aria-hidden="true"
            >
                {/* Connecting lines */}
                {pattern.map((isHigh, i) => {
                    if (i === 0) return null
                    const x1 = cx(i - 1)
                    const y1 = pattern[i - 1] ? HIGH_Y : LOW_Y
                    const x2 = cx(i)
                    const y2 = isHigh ? HIGH_Y : LOW_Y
                    return (
                        <line
                            key={`l${i}`}
                            x1={x1} y1={y1}
                            x2={x2} y2={y2}
                            stroke="var(--color-primary)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    )
                })}

                {/* Mora dots + kana labels */}
                {morae.map((mora, i) => {
                    const x = cx(i)
                    const y = pattern[i] ? HIGH_Y : LOW_Y
                    return (
                        <g key={`d${i}`}>
                            <circle cx={x} cy={y} r={DOT_R} fill="var(--color-primary)" />
                            <text
                                x={x}
                                y={TEXT_Y}
                                textAnchor="middle"
                                fontSize="10"
                                fill="var(--color-text-secondary)"
                                fontFamily="inherit"
                            >
                                {mora}
                            </text>
                        </g>
                    )
                })}
            </svg>
        </div>
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
                    <span
                        key={`${item.text}-${index}`}
                        className={styles.rubyChar}
                        data-ruby={item.reading}
                    >
                        {item.text}
                    </span>
                )
            })}
        </h1>
    )
}

export default function VocabularyWordHeader({
    vocabulary,
    meaning,
    verbGroupLabel,
    pitch = null,
}: Props) {
    const ruby = vocabulary.ruby ?? []

    const { user } = useAuth()

    const [notebookOpen, setNotebookOpen] = useState(false)
    const [noteOpen, setNoteOpen] = useState(false)
    const [authOpen, setAuthOpen] = useState(false)

    function handleSpeak() {
        speakJapanese(vocabulary.kana || vocabulary.word)
    }

    function handleNoteClick() {
        if (!user) {
            setAuthOpen(true)
        } else {
            setNoteOpen(true)
        }
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
                            <span className={styles.levelBadge} data-level={vocabulary.jlpt}>
                                {vocabulary.jlpt}
                            </span>
                        )}

                        {vocabulary.is_common && (
                            <span className={styles.commonBadge}>
                                Từ thông dụng
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
                                onClick: handleNoteClick,
                            },
                            {
                                key: "bookmark",
                                label: "Thêm vào sổ tay",
                                icon: <Star />,
                                onClick: () => setNotebookOpen(true),
                            },
                        ]}
                    />

                    {pitch !== null && vocabulary.kana && (
                        <PitchGraph
                            kana={vocabulary.kana}
                            pitch={pitch}
                        />
                    )}
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

        <VocabularyNoteModal
            open={noteOpen}
            onClose={() => setNoteOpen(false)}
            vocabularyId={vocabulary.id}
        />

        <AuthModal
            open={authOpen}
            onClose={() => setAuthOpen(false)}
        />
        </>
    )
}