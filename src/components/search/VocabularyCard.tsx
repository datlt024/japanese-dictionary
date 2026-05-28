import "./VocabularyCard.css"

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

                    <button className="jlpt-badge">
                        JLPT
                    </button>
                </div>

                <p className="vocabulary-meaning">
                    {meaning}
                </p>
            </div>
        </Link>
    )
}