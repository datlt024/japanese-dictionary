import "./SuggestionList.css"
import Link from "next/link"

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
        <div className="suggestion-list">
            {items.map((item) => (
                <Link
                    key={item.id}
                    href={`/vocabulary/${item.id}`}
                    className="suggestion-link"
                >
                    <div className="suggestion-item">
                        <div>
                            <p className="suggestion-word">
                                {item.word}
                            </p>

                            <p className="suggestion-kana">
                                {item.kana}
                            </p>
                        </div>

                        <p className="suggestion-meaning">
                            {item.meaning}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    )
}