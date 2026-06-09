import Link from "next/link"

import styles from "./SuggestionList.module.css"

type SuggestionItem = {
    id: number
    word: string
    kana: string
    meaning: string
    jlpt?: string | null
    is_common?: boolean | null
}

type SuggestionListProps = {
    items: SuggestionItem[]
}

export default function SuggestionList({
    items,
}: SuggestionListProps) {
    if (items.length === 0) {
        return null
    }

    return (
        <div className={styles.suggestionList}>
            {items.map((item) => (
                <Link
                    key={item.id}
                    href={`/vocabulary/${item.id}`}
                    className={styles.suggestionLink}
                >
                    <div className={styles.suggestionItem}>
                        <div className={styles.suggestionLeft}>
                            <p className={styles.suggestionWord}>
                                {item.word}
                            </p>

                            <p className={styles.suggestionKana}>
                                {item.kana}
                            </p>

                            <p className={styles.suggestionMeaning}>
                                {item.meaning}
                            </p>
                        </div>

                        <div className={styles.suggestionRight}>
                            {item.is_common && (
                                <span
                                    className={`${styles.suggestionBadge} ${styles.suggestionCommonBadge}`}
                                >
                                    Common
                                </span>
                            )}

                            {item.jlpt && (
                                <span className={styles.suggestionBadge}>
                                    {item.jlpt}
                                </span>
                            )}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}