import styles from "./KanjiMemoryTipCard.module.css"

import type { Kanji } from "@/domain/kanji"

type Props = {
    kanji: Kanji
    memoryTip?: string | null
}

export default function KanjiMemoryTipCard({ memoryTip }: Props) {
    if (!memoryTip) return null

    return (
        <section className={styles.card}>
            <h2>💡 MẸO GHI NHỚ CHỮ HÁN</h2>
            <p>{memoryTip}</p>
        </section>
    )
}
