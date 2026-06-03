"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import "@/styles/pages/vocabulary-detail.css"

import AppLayout from "@/shared/components/layout/AppLayout"
import { conjugateVerb } from "@/shared/utils/verbConjugation"
import {
    getVocabularyMeaning,
    getVocabularyPartOfSpeech,
    getVerbGroupLabel,
} from "@/features/vocabulary/utils"

import {
    getVocabularyById,
    getRelatedVocabularies,
} from "@/features/vocabulary/services"

import type {
    Vocabulary,
    RelatedVocabulary,
} from "@/features/vocabulary/types"

export default function VocabularyDetailPage() {
    const params = useParams<{ id: string }>()

    const [vocabulary, setVocabulary] =
        useState<Vocabulary | null>(null)

    const [relatedVocabularies, setRelatedVocabularies] =
        useState<RelatedVocabulary[]>([])

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchVocabulary() {
            setLoading(true)
            setRelatedVocabularies([])

            const data = await getVocabularyById(
                Number(params.id)
            )

            setVocabulary(data)

            if (data) {
                const related =
                    await getRelatedVocabularies(data.word)

                setRelatedVocabularies(related)
            }

            setLoading(false)
        }

        fetchVocabulary()
    }, [params.id])

    const displayMeaning = vocabulary
        ? getVocabularyMeaning(vocabulary)
        : ""

    const conjugations = vocabulary
        ? conjugateVerb(vocabulary.word, vocabulary.verb_group)
        : []

    const verbGroupLabel = vocabulary
        ? getVerbGroupLabel(vocabulary.verb_group)
        : null

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
                                    <span>
                                        {vocabulary.jlpt ||
                                            "Đang cập nhật"}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h2>Từ này có nghĩa là</h2>

                                {vocabulary.senses.length > 0 ? (
                                    <div className="sense-list">
                                        {vocabulary.senses.map(
                                            (sense, index) => (
                                                <div
                                                    key={sense.id}
                                                    className="sense-item"
                                                >
                                                    <p className="blue-title">
                                                        <strong>
                                                            {index + 1}.{" "}
                                                            {sense.meaning_vi ||
                                                                sense.meaning_en ||
                                                                "Đang cập nhật"}
                                                        </strong>
                                                    </p>

                                                    {sense.meaning_en && (
                                                        <p className="sense-en">
                                                            {
                                                                sense.meaning_en
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <p>Đang cập nhật</p>
                                )}
                            </div>

                            <div className="detail-section">
                                <h2>Từ loại</h2>

                                <p>
                                    {getVocabularyPartOfSpeech(
                                        vocabulary
                                    ) || "Đang cập nhật"}
                                </p>
                            </div>

                            {vocabulary.writings.length > 1 && (
                                <div className="detail-section">
                                    <h2>Cách viết khác</h2>

                                    <div className="tag-list">
                                        {vocabulary.writings
                                            .filter(
                                                (item) =>
                                                    item.writing !==
                                                    vocabulary.word
                                            )
                                            .map((item) => (
                                                <span
                                                    key={item.id}
                                                    className="detail-tag"
                                                >
                                                    {item.writing}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {vocabulary.readings.length > 1 && (
                                <div className="detail-section">
                                    <h2>Cách đọc khác</h2>

                                    <div className="tag-list">
                                        {vocabulary.readings
                                            .filter(
                                                (item) =>
                                                    item.reading !==
                                                    vocabulary.kana
                                            )
                                            .map((item) => (
                                                <span
                                                    key={item.id}
                                                    className="detail-tag"
                                                >
                                                    {item.reading}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {verbGroupLabel && (
                                <div className="detail-section">
                                    <h2>Nhóm động từ</h2>

                                    <p>{verbGroupLabel}</p>
                                </div>
                            )}

                            {conjugations.length > 0 && (
                                <div className="detail-section">
                                    <h2>Chia động từ</h2>

                                    <div className="conjugation-table">
                                        {conjugations.map((item) => (
                                            <div
                                                key={item.label}
                                                className="conjugation-row"
                                            >
                                                <span>
                                                    {item.label}
                                                </span>
                                                <strong>
                                                    {item.form}
                                                </strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                                    Kết quả tra cứu{" "}
                                    {vocabulary.word}
                                </h3>

                                <div className="lookup-result-list">
                                    {relatedVocabularies.length >
                                        0 ? (
                                        relatedVocabularies.map(
                                            (item) => (
                                                <Link
                                                    key={item.id}
                                                    href={`/vocabulary/${item.id}`}
                                                    className={
                                                        item.id ===
                                                            vocabulary.id
                                                            ? "lookup-result-item active"
                                                            : "lookup-result-item"
                                                    }
                                                >
                                                    <strong>
                                                        {item.word}
                                                    </strong>

                                                    <span>
                                                        {item.kana ||
                                                            "-"}
                                                    </span>

                                                    <small>
                                                        {item.meaning ||
                                                            "Đang cập nhật"}
                                                    </small>
                                                </Link>
                                            )
                                        )
                                    ) : (
                                        <p>
                                            Không có kết quả liên
                                            quan.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="detail-side-card">
                                <h3>
                                    Các chữ kanji của{" "}
                                    {vocabulary.word}
                                </h3>

                                <div className="kanji-list">
                                    {Array.from(vocabulary.word)
                                        .filter((char) =>
                                            /[\u4e00-\u9faf]/.test(
                                                char
                                            )
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
                                    Hán tự, âm đọc và nét viết sẽ
                                    cập nhật sau.
                                </p>
                            </div>

                            <div className="detail-side-card">
                                <h3>Các từ liên quan</h3>

                                <p>
                                    Đồng nghĩa, trái nghĩa và từ dễ
                                    nhầm sẽ được cập nhật sau.
                                </p>
                            </div>
                        </aside>
                    </div>
                )}
            </main>
        </AppLayout>
    )
}