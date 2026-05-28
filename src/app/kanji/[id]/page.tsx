import "@/styles/kanji-list.css"

import { kanjis } from "@/data/kanji"

import KanjiCard from "@/components/kanji/KanjiCard"

export default function KanjiPage() {
    return (
        <main className="kanji-list-page">
            <h1 className="kanji-list-title">
                Kanji
            </h1>

            <div className="kanji-grid">
                {kanjis.map((item) => (
                    <KanjiCard
                        key={item.id}
                        id={item.id}
                        character={item.character}
                        meaning={item.meaning}
                    />
                ))}
            </div>
        </main>
    )
}