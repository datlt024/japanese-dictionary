import Link from "next/link"

import styles from "./VocabularyCard.module.css"

import useBookmark from "@/features/user/bookmarks/hooks/useBookmark"

type VocabularyCardProps = {
    id: number
    word: string
    kana: string
    meaning: string
}

export default function VocabularyCard({
    id,
    word,
    kana,
    meaning,
}: VocabularyCardProps) {
    const {
        bookmarks,
        toggleBookmark,
    } = useBookmark()

    const isBookmarked =
        bookmarks.includes(id)

    return (
        <Link
            href={`/vocabulary/${id}`}
            className={styles.vocabularyLink}
        >
            <div className={styles.vocabularyCard}>
                <div className={styles.vocabularyTop}>
                    <div>
                        <h2 className={styles.vocabularyWord}>
                            {word}
                        </h2>

                        <p className={styles.vocabularyKana}>
                            {kana}
                        </p>
                    </div>

                    <button
                        className={styles.bookmarkButton}
                        onClick={(event) => {
                            event.preventDefault()

                            toggleBookmark(id)
                        }}
                    >
                        {isBookmarked ? "⭐" : "☆"}
                    </button>
                </div>

                <p className={styles.vocabularyMeaning}>
                    {meaning}
                </p>
            </div>
        </Link>
    )
}