import styles from "./KanjiMeaningSection.module.css"

import type { Kanji } from "@/domain/kanji"

import {
    DEFAULT_MEANINGS_EN,
    DEFAULT_MEANINGS_VI,
    type KanjiDetailLanguage,
} from "@/features/dictionary/kanji/constants/kanji-detail.constants"

import { splitMeaningText } from "@/features/dictionary/kanji/utils"

type Props = {
    kanji: Kanji
    language: KanjiDetailLanguage
}

export default function KanjiMeaningSection({
    kanji,
    language,
}: Props) {
    const meanings =
        language === "en"
            ? splitMeaningText(kanji.meaning_en)
            : splitMeaningText(kanji.meaning_vi)

    const fallbackMeanings =
        language === "en" ? DEFAULT_MEANINGS_EN : DEFAULT_MEANINGS_VI

    const displayMeanings =
        meanings.length > 0 ? meanings : fallbackMeanings

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>1. Ý nghĩa</h2>

            <ol className={styles.meaningList}>
                {displayMeanings.map((meaning) => (
                    <li key={meaning}>{meaning}</li>
                ))}
            </ol>
        </section>
    )
}