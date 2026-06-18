import styles from "./KanjiMemoryTipCard.module.css"

import type { Kanji } from "@/domain/kanji"

import { DEFAULT_MEMORY_TIP_LINES } from "@/features/dictionary/kanji/constants/kanji-detail.constants"

type Props = {
    kanji: Kanji
}

export default function KanjiMemoryTipCard({ kanji }: Props) {
    return (
        <section className={`${styles.card} ${styles.memoryCard}`}>
            <h2>💡 MẸO GHI NHỚ CHỮ HÁN</h2>

            {DEFAULT_MEMORY_TIP_LINES.map((line) => (
                <p key={line}>{line}</p>
            ))}

            <strong>⇒ {kanji.kanji}</strong>
        </section>
    )
}