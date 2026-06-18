import styles from "./KanjiHeroCard.module.css"

import type { Kanji } from "@/domain/kanji"

import { DEFAULT_HAN_VIET } from "@/features/dictionary/kanji/constants/kanji-detail.constants"

import {
    formatKanjiJlpt,
    speakJapanese,
} from "@/features/dictionary/kanji/utils"

type Props = {
    kanji: Kanji
}

export default function KanjiHeroCard({ kanji }: Props) {
    return (
        <section className={styles.heroCard}>
            <div className={styles.heroTop}>
                <div className={styles.heroKanjiWrap}>
                    <h1 className={styles.heroKanji}>
                        {kanji.kanji}
                    </h1>

                    <button
                        type="button"
                        className={styles.soundButton}
                        onClick={() => speakJapanese(kanji.kanji)}
                        aria-label="Phát âm chữ Hán"
                        title="Phát âm"
                    >
                        🔊
                    </button>
                </div>

                <div className={styles.tagList}>
                    <span>{formatKanjiJlpt(kanji.jlpt)}</span>
                    <span>{kanji.stroke_count || 10} nét</span>
                    <span>Thường dùng</span>
                </div>
            </div>

            <div className={styles.hanVietBlock}>
                <span>Âm Hán Việt</span>
                <strong>{DEFAULT_HAN_VIET.join("・")}</strong>
            </div>
        </section>
    )
}