"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import "@/styles/detail.css"

import AppLayout from "@/components/layout/AppLayout"

import {
    getVocabularyById,
    getVocabularyMeaning,
    Vocabulary,
} from "@/services/vocabulary.service"

export default function VocabularyDetailPage() {
    const params = useParams<{ id: string }>()

    const [vocabulary, setVocabulary] =
        useState<Vocabulary | null>(null)

    const [loading, setLoading] =
        useState(true)

    useEffect(() => {
        async function fetchVocabulary() {
            setLoading(true)

            const data = await getVocabularyById(
                Number(params.id)
            )

            setVocabulary(data)
            setLoading(false)
        }

        fetchVocabulary()
    }, [params.id])

    const displayMeaning = vocabulary
        ? getVocabularyMeaning(vocabulary)
        : ""

    return (
        <AppLayout
            title="Chi tiết từ vựng"
            searchKeyword={vocabulary?.word || ""}
            activeSearchTab="vocabulary"
        >
            <main className="detail-page">
                {loading ? (
                    <div className="detail-main">
                        <h1>Đang tải từ vựng...</h1>
                    </div>
                ) : !vocabulary ? (
                    <div className="detail-main">
                        <h1>Không tìm thấy từ vựng</h1>

                        <Link href="/" className="back-button">
                            ← Quay lại
                        </Link>
                    </div>
                ) : (
                    <div className="detail-layout">
                        <section className="detail-main">
                            <div className="detail-header">
                                <h1 className="detail-word">
                                    {vocabulary.word}
                                </h1>

                                <p className="detail-kana">
                                    「{vocabulary.kana || "-"}」
                                </p>

                                <p className="detail-meaning">
                                    {displayMeaning}
                                </p>

                                <div className="detail-actions">
                                    <button>＋</button>
                                    <button>📋</button>
                                    <button>🔊</button>
                                </div>

                                <div className="detail-tools">
                                    <button>🔗 Kết hợp từ</button>
                                    <button>🖼 Ảnh minh hoạ</button>
                                    <button>🎙 Luyện phát âm</button>
                                </div>

                                <div className="jlpt-row">
                                    <span>JLPT</span>
                                    <span>Đang cập nhật</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h2>Từ này có nghĩa là</h2>

                                <p className="blue-title">
                                    <strong>{displayMeaning}</strong>
                                </p>
                            </div>

                            <div className="detail-section">
                                <h2>Từ loại</h2>

                                <p>
                                    {vocabulary.part_of_speech ||
                                        "Đang cập nhật"}
                                </p>
                            </div>

                            <div className="detail-section">
                                <h2>Ví dụ</h2>

                                <p className="example-jp">
                                    Ví dụ sẽ được cập nhật sau.
                                </p>
                            </div>
                        </section>

                        <aside className="detail-sidebar">
                            <div className="detail-side-card">
                                <h3>
                                    Kết quả tra cứu {vocabulary.word}
                                </h3>

                                <div className="related-item">
                                    <strong>{vocabulary.word}</strong>
                                    <br />
                                    {vocabulary.kana || "-"} - {displayMeaning}
                                </div>
                            </div>

                            <div className="detail-side-card">
                                <h3>
                                    Các chữ kanji của {vocabulary.word}
                                </h3>

                                <div className="kanji-list">
                                    {Array.from(vocabulary.word)
                                        .filter((char) =>
                                            /[\u4e00-\u9faf]/.test(char)
                                        )
                                        .map((char) => (
                                            <Link
                                                key={char}
                                                href={`/kanji/${char}`}
                                                className="kanji-box"
                                            >
                                                {char}
                                            </Link>
                                        ))}
                                </div>

                                <p>
                                    Hán tự, âm đọc và nét viết sẽ cập nhật sau.
                                </p>
                            </div>

                            <div className="detail-side-card">
                                <h3>Các từ liên quan</h3>

                                <div className="related-item">
                                    <strong>{vocabulary.word}に</strong>
                                    <br />
                                    liên quan đến {displayMeaning}
                                </div>

                                <div className="related-item">
                                    <strong>{vocabulary.word}な</strong>
                                    <br />
                                    dạng bổ nghĩa
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </main>
        </AppLayout>
    )
}