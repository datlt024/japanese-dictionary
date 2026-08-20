import styles from "./KanjiReadingSection.module.css"
import { Button } from "antd"

import type { Kanji } from "@/domain/kanji"

import {
    DEFAULT_KUNYOMI,
    DEFAULT_ONYOMI,
} from "@/features/dictionary/kanji/constants/kanji-detail.constants"

import {
    speakJapanese,
    splitKanjiReadings,
} from "@/features/dictionary/kanji/utils"

type Props = {
    kanji: Kanji
}

export default function KanjiReadingSection({ kanji }: Props) {
    const onyomi = splitKanjiReadings(kanji.onyomi)
    const kunyomi = splitKanjiReadings(kanji.kunyomi)

    const displayOnyomi =
        onyomi.length > 0 ? onyomi : DEFAULT_ONYOMI

    const displayKunyomi =
        kunyomi.length > 0 ? kunyomi : DEFAULT_KUNYOMI

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>2. Cách đọc</h2>

            <div className={styles.readingGrid}>
                <div className={styles.readingBox}>
                    <h3 className={styles.readingTitle}>
                        Âm On <span>音読み</span>
                    </h3>

                    <div className={styles.readingPillList}>
                        {displayOnyomi.map((reading) => (
                            <Button
                                key={reading}
                                type="default"
                                className={styles.readingPill}
                                onClick={() => speakJapanese(reading)}
                                style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 38, padding: "8px 12px", borderRadius: 999, background: "var(--color-primary-soft)", borderColor: "var(--color-primary-soft)", color: "var(--color-primary)", fontWeight: 800, fontSize: 15, height: "auto" }}
                            >
                                {reading}
                                <span>🔊</span>
                            </Button>
                        ))}
                    </div>
                </div>

                <div className={styles.readingBox}>
                    <h3 className={styles.readingTitle}>
                        Âm Kun <span>訓読み</span>
                    </h3>

                    <div className={styles.readingPillList}>
                        {displayKunyomi.map((reading) => (
                            <Button
                                key={reading}
                                type="default"
                                className={styles.readingPill}
                                onClick={() => speakJapanese(reading)}
                                style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 38, padding: "8px 12px", borderRadius: 999, background: "var(--color-primary-soft)", borderColor: "var(--color-primary-soft)", color: "var(--color-primary)", fontWeight: 800, fontSize: 15, height: "auto" }}
                            >
                                {reading}
                                <span>🔊</span>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}