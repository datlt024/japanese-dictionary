import Link from "next/link"

import styles from "./KanjiAnalysisCard.module.css"

import type { Kanji } from "@/domain/kanji"

import { DEFAULT_KANJI_ANALYSIS } from "@/features/dictionary/kanji/constants/kanji-detail.constants"

type Props = {
    kanji: Kanji
    currentKanji: string
    kanjiOptions: string[]
    searchKeyword: string
    embedded?: boolean
}

function createKanjiHref(
    kanji: string,
    searchKeyword: string,
    embedded?: boolean
) {
    const params = new URLSearchParams({
        q: searchKeyword,
    })

    if (embedded) {
        params.set("embedded", "1")
    }

    return `/kanji/${encodeURIComponent(kanji)}?${params.toString()}`
}

export default function KanjiAnalysisCard({
    kanji,
    currentKanji,
    kanjiOptions,
    searchKeyword,
    embedded = false,
}: Props) {
    return (
        <section className={styles.card}>
            <p className={styles.label}>
                PHÂN TÍCH KANJI
            </p>

            {kanjiOptions.length > 1 ? (
                <div className={styles.switchList}>
                    {kanjiOptions.map((item) => (
                        <Link
                            key={item}
                            href={createKanjiHref(
                                item,
                                searchKeyword,
                                embedded
                            )}
                            className={
                                item === currentKanji
                                    ? `${styles.switchItem} ${styles.active}`
                                    : styles.switchItem
                            }
                        >
                            <span>{item}</span>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className={styles.preview}>
                    {kanji.kanji}
                </div>
            )}

            <div className={styles.list}>
                <div>
                    <span>Số nét</span>
                    <strong>{kanji.stroke_count || 10}</strong>
                </div>

                <div>
                    <span>Bộ thủ</span>
                    <strong>{DEFAULT_KANJI_ANALYSIS.radical}</strong>
                </div>

                <div>
                    <span>Cấu tạo</span>
                    <strong>{DEFAULT_KANJI_ANALYSIS.structure}</strong>
                </div>

                <div>
                    <span>Ý nghĩa gốc</span>
                    <strong>
                        {DEFAULT_KANJI_ANALYSIS.originalMeaning}
                    </strong>
                </div>
            </div>
        </section>
    )
}