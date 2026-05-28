import "@/styles/kanji.css"

export default function KanjiDetailPage() {
    return (
        <main className="kanji-page">
            <div className="kanji-card">
                <h1 className="kanji-character">
                    猫
                </h1>

                <p className="kanji-meaning">
                    Con mèo
                </p>

                <div className="kanji-info">
                    <div>
                        <h3>Onyomi</h3>
                        <p>ビョウ</p>
                    </div>

                    <div>
                        <h3>Kunyomi</h3>
                        <p>ねこ</p>
                    </div>

                    <div>
                        <h3>Số nét</h3>
                        <p>11</p>
                    </div>
                </div>
            </div>
        </main>
    )
}