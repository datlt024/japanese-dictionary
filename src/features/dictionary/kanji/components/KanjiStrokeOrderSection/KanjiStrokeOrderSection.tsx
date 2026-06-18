import styles from "./KanjiStrokeOrderSection.module.css"

import KanjiStrokeOrder from "@/features/dictionary/kanji/components/KanjiStrokeOrder/KanjiStrokeOrder"

import type { Kanji } from "@/domain/kanji"

type Props = {
    kanji: Kanji
}

export default function KanjiStrokeOrderSection({ kanji }: Props) {
    const strokeCount = kanji.stroke_count || 10

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>3. Thứ tự nét</h2>

            <div className={styles.strokeLayout}>
                <KanjiStrokeOrder
                    kanji={kanji.kanji}
                    className={styles.strokeBox}
                />

                <div className={styles.strokeNumberGrid}>
                    {Array.from({ length: strokeCount }).map((_, index) => (
                        <span key={index}>
                            {String(index + 1).padStart(2, "0")}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    )
}