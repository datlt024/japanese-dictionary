import styles from "./VocabularyMeaningCards.module.css"

import {
    formatGlossMeaning,
    formatMeaningVi,
    getSenseGlosses,
    getSenseMeaning,
} from "@/features/dictionary/vocabulary/utils"

import type { Vocabulary } from "@/domain/vocabulary/vocabulary.type"

type VocabularySense = Vocabulary["senses"][number]

type Props = {
    vocabulary: Vocabulary
    language: "vi" | "en"
    nounSenses: VocabularySense[]
    suruVerbSenses: VocabularySense[]
    hasSuruVerb: boolean
}

type MeaningListProps = {
    senses: VocabularySense[]
    language: "vi" | "en"
}

function MeaningList({ senses, language }: MeaningListProps) {
    if (senses.length === 0) {
        return <p className={styles.emptyText}>Đang cập nhật</p>
    }

    return (
        <ul className={styles.meaningBulletList}>
            {senses.map((sense) => {
                const glosses = getSenseGlosses(
                    sense.meaning_vi_glosses
                )

                const meaning = getSenseMeaning(sense, language)

                return (
                    <li key={sense.id}>
                        <span className={styles.meaningDot}>•</span>

                        <div>
                            <p className={styles.meaningText}>
                                {language === "vi"
                                    ? formatMeaningVi(meaning)
                                    : meaning}
                            </p>

                            {language === "vi" &&
                                glosses.length > 0 && (
                                    <div
                                        className={
                                            styles.senseGlossList
                                        }
                                    >
                                        {glosses.map((gloss) => (
                                            <p
                                                key={gloss.index}
                                                className={
                                                    styles.senseGlossItem
                                                }
                                            >
                                                {formatGlossMeaning(
                                                    gloss.meaning
                                                )}
                                            </p>
                                        ))}
                                    </div>
                                )}
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}

function InlineExampleList({
    variant,
}: {
    variant: "noun" | "verb"
}) {
    const examples =
        variant === "noun"
            ? [
                {
                    ruby: "べんきょう　たいへん",
                    jp: "勉強は大変です。でも、頑張ります。",
                    vi: "Việc học rất vất vả. Nhưng tôi sẽ cố gắng.",
                },
                {
                    ruby: "かのじょ　べんきょう　いそが",
                    jp: "彼女は勉強で忙しいです。",
                    vi: "Cô ấy bận rộn với việc học.",
                },
            ]
            : [
                {
                    ruby: "わたし　まいにち　べんきょう",
                    jp: "私は毎日勉強します。",
                    vi: "Tôi học mỗi ngày.",
                },
                {
                    ruby: "しけん　まえ　べんきょう",
                    jp: "試験の前に勉強します。",
                    vi: "Tôi học trước khi thi.",
                },
            ]

    return (
        <div className={styles.inlineExampleBox}>
            {examples.map((example) => (
                <div
                    key={example.jp}
                    className={styles.inlineExampleItem}
                >
                    <p className={styles.inlineExampleRuby}>
                        {example.ruby}
                    </p>

                    <p className={styles.inlineExampleJp}>
                        {example.jp}
                    </p>

                    <p className={styles.inlineExampleVi}>
                        {example.vi}
                    </p>
                </div>
            ))}
        </div>
    )
}

export default function VocabularyMeaningCards({
    vocabulary,
    language,
    nounSenses,
    suruVerbSenses,
    hasSuruVerb,
}: Props) {
    return (
        <div className={styles.meaningGrid}>
            <div
                className={[
                    styles.meaningCard,
                    styles.meaningCardBlue,
                    hasSuruVerb ? "" : styles.meaningCardFull,
                ].join(" ")}
            >
                <div className={styles.meaningCardHeader}>
                    <div className={styles.meaningTitleRow}>
                        <span className={styles.meaningOrder}>1.</span>
                        <h2>DANH TỪ</h2>
                        <span className={styles.posBadge}>n</span>
                    </div>

                    <button
                        type="button"
                        className={styles.meaningSoundButton}
                        aria-label="Phát âm nghĩa danh từ"
                    >
                        🔊
                    </button>
                </div>

                <MeaningList
                    senses={nounSenses}
                    language={language}
                />

                <InlineExampleList variant="noun" />

                <button
                    type="button"
                    className={styles.moreInlineExample}
                >
                    Xem thêm ví dụ (15)⌄
                </button>
            </div>

            {hasSuruVerb && (
                <div
                    className={`${styles.meaningCard} ${styles.meaningCardGreen}`}
                >
                    <div className={styles.meaningCardHeader}>
                        <div className={styles.meaningTitleRow}>
                            <span className={styles.meaningOrder}>
                                2.
                            </span>
                            <h2>ĐỘNG TỪ</h2>
                            <span className={styles.posBadgeGreen}>
                                vs
                            </span>
                            <span className={styles.posBadgeGreen}>
                                vt
                            </span>
                        </div>

                        <button
                            type="button"
                            className={
                                styles.meaningSoundButtonGreen
                            }
                            aria-label="Phát âm nghĩa động từ"
                        >
                            🔊
                        </button>
                    </div>

                    <p className={styles.suruWordLabel}>
                        （{vocabulary.word}する）
                    </p>

                    <MeaningList
                        senses={suruVerbSenses}
                        language={language}
                    />

                    <InlineExampleList variant="verb" />

                    <button
                        type="button"
                        className={styles.moreInlineExample}
                    >
                        Xem thêm ví dụ (8)⌄
                    </button>
                </div>
            )}
        </div>
    )
}