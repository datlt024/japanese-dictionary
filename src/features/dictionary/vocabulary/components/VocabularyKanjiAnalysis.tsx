import Link from "next/link"

import styles from "./VocabularyKanjiAnalysis.module.css"

import KanjiStrokeOrder from "@/features/dictionary/kanji/components/KanjiStrokeOrder"

import {
    createKanjiHref,
    getKanjiDisplayMeaning,
    getKanjiStrokeCount,
} from "@/features/dictionary/vocabulary/utils"

import type {
    VocabularyKanjiDetail,
} from "@/server/services/vocabulary/vocabulary.service"

type Props = {
    vocabularyWord: string
    kanjiDetails: VocabularyKanjiDetail[]
    language: "vi" | "en"
    embedded: boolean
}

export default function VocabularyKanjiAnalysis({
    vocabularyWord,
    kanjiDetails,
    language,
    embedded,
}: Props) {
    const selectedKanji = kanjiDetails[0]

    return (
        <div
            className={`${styles.detailSideCard} ${styles.kanjiAnalysisCard}`}
        >
            <h3>PHÂN TÍCH KANJI</h3>

            <div className={styles.kanjiTileList}>
                {kanjiDetails.map((item, index) => (
                    <Link
                        key={item.kanji}
                        href={createKanjiHref(
                            item.kanji,
                            vocabularyWord,
                            language,
                            embedded
                        )}
                        className={
                            index === 0
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
                    </Link>
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
                            key={selectedKanji.kanji}
                            kanji={selectedKanji.kanji}
                            className={styles.vocabularyKanjiStroke}
                        />

                        <div className={styles.strokeStepGrid}>
                            {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                                <div
                                    key={step}
                                    className={styles.strokeStep}
                                >
                                    <small>{step}</small>
                                    <span>{selectedKanji.kanji}</span>
                                </div>
                            ))}
                        </div>
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
