import styles from "./KanjiHeroCard.module.css"

import type { Kanji } from "@/domain/kanji"

import KanjiStrokeOrder from "@/features/dictionary/kanji/components/KanjiStrokeOrder/KanjiStrokeOrder"
import KanjiActionButtons from "@/features/dictionary/kanji/components/KanjiActionButtons/KanjiActionButtons"

import {
    DEFAULT_KUNYOMI,
    DEFAULT_ONYOMI,
} from "@/features/dictionary/kanji/constants/kanji-detail.constants"

import {
    formatKanjiJlpt,
    splitKanjiReadings,
} from "@/features/dictionary/kanji/utils"

type Props = {
    kanji: Kanji
}

function formatHanViet(value?: string | null) {
    if (!value) {
        return "Đang cập nhật"
    }

    return value
        .split(/[;；・,、]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .join("・")
}

export default function KanjiHeroCard({ kanji }: Props) {
    const onyomi = splitKanjiReadings(kanji.onyomi)
    const kunyomi = splitKanjiReadings(kanji.kunyomi)

    const displayOnyomi =
        onyomi.length > 0 ? onyomi : DEFAULT_ONYOMI

    const displayKunyomi =
        kunyomi.length > 0 ? kunyomi : DEFAULT_KUNYOMI

    const displayHanViet = formatHanViet(kanji.han_viet)

    return (
        <div className={styles.detailHeader}>
            <div className={styles.headerContent}>
                <div className={styles.wordBlock}>
                    <div className={styles.wordRow}>
                        <h1 className={styles.detailWord}>
                            {kanji.kanji}
                        </h1>
                    </div>

                    <div className={styles.hanVietBlock}>
                        <span>Âm Hán Việt</span>

                        <strong>「{displayHanViet}」</strong>
                    </div>

                    <div className={styles.readingBox}>
                        <p className={styles.readingTitle}>
                            Phát âm
                        </p>

                        <div className={styles.readingItem}>
                            <span>Kunyomi</span>
                            <strong>
                                {displayKunyomi.join("；")}
                            </strong>
                        </div>

                        <div className={styles.readingItem}>
                            <span>Onyomi</span>
                            <strong>
                                {displayOnyomi.join("；")}
                            </strong>
                        </div>
                    </div>

                    <div className={styles.badgeRow}>
                        <span className={styles.neutralBadge}>
                            {kanji.stroke_count || 10} nét
                        </span>

                        <span className={styles.levelBadge} data-level={formatKanjiJlpt(kanji.jlpt)}>
                            {formatKanjiJlpt(kanji.jlpt)}
                        </span>
                    </div>
                </div>

                <div className={styles.headerAside}>
                    <KanjiActionButtons kanjiChar={kanji.kanji} />

                    <div className={styles.strokeBox}>
                        <KanjiStrokeOrder kanji={kanji.kanji} />
                    </div>
                </div>
            </div>
        </div>
    )
}