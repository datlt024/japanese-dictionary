import styles from "./KanjiExampleSection.module.css"
import {
    DEFAULT_EXAMPLES,
    type KanjiDetailLanguage,
} from "@/features/dictionary/kanji/constants/kanji-detail.constants"

import { speakJapanese } from "@/features/dictionary/kanji/utils"

type Props = {
    language: KanjiDetailLanguage
}

export default function KanjiExampleSection({ language }: Props) {
    return (
        <section className={styles.section}>
            <h2 className={styles.title}>5. Ví dụ câu</h2>

            <div className={styles.exampleList}>
                {DEFAULT_EXAMPLES.map((example, index) => (
                    <article
                        key={example.jp}
                        className={styles.exampleItem}
                    >
                        <span className={styles.exampleIndex}>
                            {index + 1}
                        </span>

                        <div className={styles.exampleBody}>
                            <p className={styles.exampleJp}>
                                {example.jp}
                            </p>

                            <p className={styles.exampleMeaning}>
                                {language === "en"
                                    ? example.en
                                    : example.vi}
                            </p>
                        </div>

                        <div className={styles.exampleActions}>
                            <button
                                type="button"
                                onClick={() => speakJapanese(example.jp)}
                                aria-label="Phát âm ví dụ"
                            >
                                🔊
                            </button>

                            <button type="button" aria-label="Lưu ví dụ">
                                ♡
                            </button>

                            <button type="button" aria-label="Mở menu">
                                ⋯
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}