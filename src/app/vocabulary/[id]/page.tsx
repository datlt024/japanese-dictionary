import "@/styles/detail.css"

import { vocabularies } from "@/data/vocabulary"
import Link from "next/link"

type VocabularyDetailPageProps = {
    params: Promise<{
        id: string
    }>
}

export default async function VocabularyDetailPage({
    params,
}: VocabularyDetailPageProps) {

    const { id } = await params

    const vocabulary = vocabularies.find(
        (item) => item.id === Number(id)
    )

    if (!vocabulary) {
        return (
            <main className="detail-page">
                <div className="detail-card">
                    <h1>Không tìm thấy từ vựng</h1>

                    <Link
                        href="/"
                        className="back-button"
                    >
                        ← Quay lại
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="detail-page">
            <Link
                href="/"
                className="back-button"
            >
                ← Quay lại
            </Link>

            <div className="detail-card">
                <h1 className="detail-word">
                    {vocabulary.word}
                </h1>

                <p className="detail-kana">
                    {vocabulary.kana}
                </p>

                <p className="detail-meaning">
                    {vocabulary.meaning}
                </p>

                <div className="detail-section">
                    <h2>Ví dụ</h2>

                    <p>
                        猫が好きです。
                    </p>

                    <p>
                        Tôi thích mèo.
                    </p>
                </div>
            </div>
        </main>
    )
}