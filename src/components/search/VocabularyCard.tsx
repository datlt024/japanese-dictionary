import "./VocabularyCard.css"
import useBookmark from "@/features/bookmark/useBookmark"

import Link from "next/link"

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
            className="vocabulary-link"
        >
            <div className="vocabulary-card">
                <div className="vocabulary-top">
                    <div>
                        <h2 className="vocabulary-word">
                            {word}
                        </h2>

                        <p className="vocabulary-kana">
                            {kana}
                        </p>
                    </div>

                    <button
                        className="jlpt-badge"
                        onClick={(e) => {
                            e.preventDefault()

                            toggleBookmark(id)
                        }}
                    >
                        {isBookmarked ? "⭐" : "☆"}
                    </button>
                </div>

                <p className="vocabulary-meaning">
                    {meaning}
                </p>
            </div>
        </Link>
    )
}