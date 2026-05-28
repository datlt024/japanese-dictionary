import "./VocabularyCard.css"

type VocabularyCardProps = {
    word: string
    kana: string
    meaning: string
}

export default function VocabularyCard({
    word,
    kana,
    meaning,
}: VocabularyCardProps) {
    return (
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
    )
}