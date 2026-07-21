"use client"

import { useState } from "react"
import Link from "next/link"
import { Volume2 } from "lucide-react"

import styles from "./VocabularyMeaningCards.module.css"

import {
    createVocabularyHref,
    formatMeaningVi,
    getSenseMeaning,
} from "@/features/dictionary/vocabulary/utils"
import ActionButtons from "@/shared/components/ActionButtons/ActionButtons"
import { speakJapanese } from "@/shared/lib/tts/speakJapanese"

import type { Vocabulary } from "@/domain/vocabulary"
import type { RelatedVocabularySummary } from "@/domain/vocabulary/vocabulary-relation.type"

type VocabularySense = Vocabulary["senses"][number]

type Props = {
    vocabulary: Vocabulary
    language: "vi" | "en"
    nounSenses: VocabularySense[]
    suruVerbSenses: VocabularySense[]
    hasSuruVerb: boolean
    synonyms: RelatedVocabularySummary[]
}

const DEFAULT_SENSE_LIMIT = 1

type MeaningListProps = {
    senses: VocabularySense[]
    language: "vi" | "en"
    green?: boolean
}

function MeaningList({ senses, language, green }: MeaningListProps) {
    const [expanded, setExpanded] = useState(false)

    if (senses.length === 0) {
        return <p className={styles.emptyText}>Đang cập nhật</p>
    }

    const visible = expanded ? senses : senses.slice(0, DEFAULT_SENSE_LIMIT)
    const hidden = senses.length - DEFAULT_SENSE_LIMIT

    return (
        <>
            <ul className={styles.meaningBulletList}>
                {visible.map((sense) => {
                    const meaning = getSenseMeaning(sense, language)

                    return (
                        <li key={sense.id}>
                            <span className={styles.meaningDot}>•</span>

                            <p className={styles.meaningText}>
                                {language === "vi" ? formatMeaningVi(meaning) : meaning}
                            </p>
                        </li>
                    )
                })}
            </ul>

            {senses.length > DEFAULT_SENSE_LIMIT && (
                <button
                    type="button"
                    className={`${styles.expandSenses}${green ? ` ${styles.expandSensesGreen}` : ""}`}
                    onClick={() => setExpanded((v) => !v)}
                >
                    {expanded ? "Thu gọn ↑" : `Xem thêm ${hidden} nghĩa khác ↓`}
                </button>
            )}
        </>
    )
}

function SynonymRow({
    synonyms,
    language,
    green,
}: {
    synonyms: RelatedVocabularySummary[]
    language: "vi" | "en"
    green?: boolean
}) {
    if (synonyms.length === 0) return null

    return (
        <div className={`${styles.synonymRow}${green ? ` ${styles.synonymRowGreen}` : ""}`}>
            <span className={styles.synonymLabel}>Đồng nghĩa:</span>

            {synonyms.map((s, i) => (
                <span key={s.id} className={styles.synonymItem}>
                    {i > 0 && <span className={styles.synonymDot}> · </span>}
                    <Link
                        href={createVocabularyHref(s.id, language, false)}
                        className={`${styles.synonymLink}${green ? ` ${styles.synonymLinkGreen}` : ""}`}
                    >
                        {s.primary_word || s.primary_kana}
                        {s.primary_kana && s.primary_word && (
                            <span className={styles.synonymKana}>（{s.primary_kana}）</span>
                        )}
                    </Link>
                </span>
            ))}
        </div>
    )
}

function getPrimaryCardLabel(senses: VocabularySense[]): string {
    if (senses.some((s) => s.part_of_speech?.includes("adj-i"))) return "TÍNH TỪ ĐUÔI い"
    if (senses.some((s) => s.part_of_speech?.includes("adj-na"))) return "TÍNH TỪ ĐUÔI な"
    return "DANH TỪ"
}

export default function VocabularyMeaningCards({
    vocabulary,
    language,
    nounSenses,
    suruVerbSenses,
    hasSuruVerb,
    synonyms,
}: Props) {
    const effectiveNounSenses = nounSenses.length > 0 ? nounSenses : suruVerbSenses
    const showNumbers = hasSuruVerb
    const primaryCardLabel = getPrimaryCardLabel(effectiveNounSenses)

    return (
        <div className={styles.meaningGrid}>
            <div
                className={[
                    styles.meaningCard,
                    styles.meaningCardBlue,
                    !hasSuruVerb ? styles.meaningCardFull : "",
                ].join(" ")}
            >
                <div className={styles.meaningCardHeader}>
                    <div className={styles.meaningTitleRow}>
                        {showNumbers && <span className={styles.meaningOrder}>1.</span>}
                        <h2>{primaryCardLabel}</h2>
                    </div>

                    <ActionButtons
                        items={[{
                            key: "speak",
                            label: "Phát âm từ",
                            icon: <Volume2 />,
                            onClick: () => speakJapanese(vocabulary.word),
                        }]}
                    />
                </div>

                <MeaningList senses={effectiveNounSenses} language={language} />

                <SynonymRow synonyms={synonyms} language={language} />
            </div>

            {hasSuruVerb && (
                <div className={`${styles.meaningCard} ${styles.meaningCardGreen}`}>
                    <div className={styles.meaningCardHeader}>
                        <div className={styles.meaningTitleRow}>
                            <span className={styles.meaningOrder}>2.</span>
                            <h2>ĐỘNG TỪ</h2>
                        </div>

                        <ActionButtons
                            items={[{
                                key: "speak",
                                label: "Phát âm từ",
                                icon: <Volume2 />,
                                onClick: () => speakJapanese(`${vocabulary.word}する`),
                            }]}
                        />
                    </div>

                    <p className={styles.suruWordLabel}>（{vocabulary.word}する）</p>

                    <MeaningList senses={suruVerbSenses} language={language} green />

                    <SynonymRow synonyms={synonyms} language={language} green />
                </div>
            )}
        </div>
    )
}
