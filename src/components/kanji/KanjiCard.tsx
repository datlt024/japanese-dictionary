import "./KanjiCard.css"

import Link from "next/link"

type KanjiCardProps = {
    id: number
    character: string
    meaning: string
}

export default function KanjiCard({
    id,
    character,
    meaning,
}: KanjiCardProps) {
    return (
        <Link
            href={`/kanji/${id}`}
            className="kanji-link"
        >
            <div className="kanji-card">
                <h2 className="kanji-character">
                    {character}
                </h2>

                <p className="kanji-meaning">
                    {meaning}
                </p>
            </div>
        </Link>
    )
}