import styles from "./KanjiMeaningSection.module.css"

import type { Kanji } from "@/domain/kanji"
import type {
    KanjiDetailLanguage,
} from "@/features/dictionary/kanji/constants/kanji-detail.constants"

type Props = {
    kanji: Kanji
    language: KanjiDetailLanguage
}

function splitMeanings(text: string | null) {
    if (!text) {
        return []
    }

    return text
        .split(/;|；|,|、/)
        .map((item) => item.trim())
        .filter(Boolean)
}

export default function KanjiMeaningSection({
    kanji,
    language,
}: Props) {
    const meanings =
        language === "en"
            ? splitMeanings(kanji.meaning_en)
            : splitMeanings(kanji.meaning_vi || kanji.meaning_en)

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>
                Ý nghĩa
            </h2>

            {meanings.length > 0 ? (
                <ol className={styles.meaningList}>
                    {meanings.map((meaning, index) => (
                        <li key={`${meaning}-${index}`}>
                            {meaning}
                        </li>
                    ))}
                </ol>
            ) : (
                <p className={styles.mutedText}>
                    Đang cập nhật ý nghĩa.
                </p>
            )}
        </section>
    )
}