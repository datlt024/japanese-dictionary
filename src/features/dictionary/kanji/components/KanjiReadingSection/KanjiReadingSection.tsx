import styles from "./KanjiReadingSection.module.css"

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
                            <button
                                key={reading}
                                type="button"
                                className={styles.readingPill}
                                onClick={() => speakJapanese(reading)}
                            >
                                {reading}
                                <span>🔊</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.readingBox}>
                    <h3 className={styles.readingTitle}>
                        Âm Kun <span>訓読み</span>
                    </h3>

                    <div className={styles.readingPillList}>
                        {displayKunyomi.map((reading) => (
                            <button
                                key={reading}
                                type="button"
                                className={styles.readingPill}
                                onClick={() => speakJapanese(reading)}
                            >
                                {reading}
                                <span>🔊</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}