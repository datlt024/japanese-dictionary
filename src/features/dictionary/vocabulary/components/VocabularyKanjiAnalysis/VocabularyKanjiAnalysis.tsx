"use client"

import { useState } from "react"
import Link from "next/link"

import styles from "./VocabularyKanjiAnalysis.module.css"

import KanjiStrokeOrder from "@/features/dictionary/kanji/components/KanjiStrokeOrder/KanjiStrokeOrder"
import KanjiStrokeSteps from "@/features/dictionary/kanji/components/KanjiStrokeSteps/KanjiStrokeSteps"

import {
    createKanjiHref,
    getKanjiDisplayMeaning,
    getKanjiStrokeCount,
} from "@/features/dictionary/vocabulary/utils"

import type { VocabularyKanjiDetail } from "@/domain/vocabulary"

type Props = {
    vocabularyWord: string
    kanjiDetails: VocabularyKanjiDetail[]
    language: "vi" | "en"
    embedded: boolean
}

function getKanjiTileListClassName(
    count: number
) {
    return [
        styles.kanjiTileList,
        count <= 1 ? styles.kanjiTileListOne : "",
        count === 2 ? styles.kanjiTileListTwo : "",
        count === 3 ? styles.kanjiTileListThree : "",
        count >= 4 ? styles.kanjiTileListFour : "",
    ]
        .filter(Boolean)
        .join(" ")
}

export default function VocabularyKanjiAnalysis({
    vocabularyWord,
    kanjiDetails,
    language,
    embedded,
}: Props) {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectedKanji = kanjiDetails[selectedIndex]

    return (
        <div
            className={`${styles.detailSideCard} ${styles.kanjiAnalysisCard}`}
        >
            <h3>PHÂN TÍCH KANJI</h3>

            <div
                className={getKanjiTileListClassName(
                    kanjiDetails.length
                )}
            >
                {kanjiDetails.map((item, index) => (
                    <button
                        key={item.kanji}
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        className={
                            index === selectedIndex
                                ? `${styles.kanjiTile} ${styles.kanjiTileActive}`
                                : styles.kanjiTile
                        }
                    >
                        <span className={styles.kanjiTileChar}>
                            {item.kanji}
                        </span>

                        <small>
                            {getKanjiStrokeCount(item)
                                ? `${getKanjiStrokeCount(item)} nét`
                                : "— nét"}
                        </small>
                    </button>
                ))}
            </div>

            {selectedKanji && (
                <div className={styles.selectedKanjiPanel}>
                    <div className={styles.selectedKanjiHeader}>
                        <strong>
                            {selectedKanji.kanji}
                            <span>
                                （{getKanjiStrokeCount(selectedKanji) || "—"} nét）
                            </span>
                        </strong>

                        <span>⌃</span>
                    </div>

                    <div className={styles.strokePreviewGrid}>
                        <KanjiStrokeOrder
                            key={`order-${selectedKanji.kanji}`}
                            kanji={selectedKanji.kanji}
                            className={styles.vocabularyKanjiStroke}
                        />

                        <KanjiStrokeSteps key={`steps-${selectedKanji.kanji}`} kanji={selectedKanji.kanji} />
                    </div>

                    <div className={styles.kanjiInfoGrid}>
                        <div>
                            <h4>CÁCH ĐỌC</h4>

                            <p>
                                Onyomi (Âm Hán):{" "}
                                <strong>
                                    {selectedKanji.onyomi || "-"}
                                </strong>
                            </p>

                            <p>
                                Kunyomi (Âm Nhật):{" "}
                                <strong>
                                    {selectedKanji.kunyomi || "-"}
                                </strong>
                            </p>
                        </div>

                        <div>
                            <h4>Ý NGHĨA GỐC</h4>

                            <p>
                                {getKanjiDisplayMeaning(
                                    selectedKanji,
                                    language
                                )}
                            </p>
                        </div>
                    </div>

                    <Link
                        href={createKanjiHref(
                            selectedKanji.kanji,
                            vocabularyWord,
                            language,
                            embedded
                        )}
                        className={styles.kanjiDetailLink}
                    >
                        Xem chi tiết chữ {selectedKanji.kanji} →
                    </Link>
                </div>
            )}
        </div>
    )
}