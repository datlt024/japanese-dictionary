"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import "@/styles/detail.css"

import AppLayout from "@/components/layout/AppLayout"
import TopSearchBar from "@/components/layout/TopSearchBar"
import { getVocabularies } from "@/services/vocabulary.service"

type Vocabulary = {
    id: number
    word: string
    kana: string
    meaning: string
}

export default function VocabularyDetailPage() {
    const params = useParams()
    const [vocabulary, setVocabulary] =
        useState<Vocabulary | null>(null)

    useEffect(() => {
        async function fetchVocabulary() {
            const data = await getVocabularies()

            const foundVocabulary = data.find(
                (item) => item.id === Number(params.id)
            )

            setVocabulary(foundVocabulary || null)
        }

        fetchVocabulary()
    }, [params.id])

    return (
        <AppLayout title="Chi tiết từ vựng">
            <main className="detail-page">
                <TopSearchBar />

                {!vocabulary ? (
                    <div className="detail-main">
                        <h1>Không tìm thấy từ vựng</h1>

                        <Link href="/" className="back-button">
                            ← Quay lại
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="detail-layout">
                            <section className="detail-main">
                                <div className="detail-header">
                                    <h1 className="detail-word">
                                        {vocabulary.word}
                                    </h1>

                                    <p className="detail-kana">
                                        「{vocabulary.kana}」
                                    </p>

                                    <p className="detail-meaning">
                                        {vocabulary.meaning}
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
                                        <span>N5</span>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h2>Từ này có nghĩa là</h2>

                                    <p className="blue-title">
                                        <strong>{vocabulary.meaning}</strong>
                                    </p>
                                    <h2>📌 Tính từ đuôi な</h2>
                                </div>

                                <div className="detail-section">
                                    <h2>Ví dụ</h2>

                                    <p className="example-jp">
                                        {vocabulary.word}を勉強しています。
                                    </p>

                                    <p className="example-vi">
                                        Tôi đang học từ “{vocabulary.word}”.
                                    </p>
                                </div>

                                <div className="detail-section">
                                    <h2>Ý kiến đóng góp</h2>

                                    <div className="comment-item">
                                        Nghĩa này cần được kiểm tra thêm.
                                    </div>

                                    <div className="comment-item">
                                        Có thể bổ sung thêm ví dụ thực tế.
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h2>Từ đồng nghĩa</h2>

                                    <p>Đang cập nhật...</p>
                                </div>

                                <div className="detail-section">
                                    <h2>Từ trái nghĩa</h2>

                                    <p>Đang cập nhật...</p>
                                </div>
                            </section>

                            <aside className="detail-sidebar">
                                <div className="detail-side-card">
                                    <h3>Kết quả tra cứu {vocabulary.word}</h3>

                                    <div className="related-item">
                                        <strong>{vocabulary.word}</strong>
                                        <br />
                                        {vocabulary.kana} - {vocabulary.meaning}
                                    </div>
                                </div>

                                <div className="detail-side-card">
                                    <h3>Các chữ kanji của {vocabulary.word}</h3>

                                    <div className="kanji-box">
                                        {vocabulary.word[0]}
                                    </div>

                                    <p>Hán tự, âm đọc và nét viết sẽ cập nhật sau.</p>
                                </div>

                                <div className="detail-side-card">
                                    <h3>Các từ liên quan</h3>

                                    <div className="related-item">
                                        <strong>{vocabulary.word}に</strong>
                                        <br />
                                        liên quan đến {vocabulary.meaning}
                                    </div>

                                    <div className="related-item">
                                        <strong>{vocabulary.word}な</strong>
                                        <br />
                                        dạng bổ nghĩa
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </>
                )}
            </main>
        </AppLayout>
    )
}