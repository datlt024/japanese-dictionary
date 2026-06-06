import Link from "next/link"

import styles from "./SuggestionList.module.css"

type SuggestionItem = {
    id: number
    word: string
    kana: string
    meaning: string
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
                        <div>
                            <p className={styles.suggestionWord}>
                                {item.word}
                            </p>

                            <p className={styles.suggestionKana}>
                                {item.kana}
                            </p>
                        </div>

                        <p className={styles.suggestionMeaning}>
                            {item.meaning}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    )
}