"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"

import "@/styles/pages/vocabulary-detail.css"

import AppLayout from "@/shared/components/layout/AppLayout"
import KanjiStrokeOrder from "@/features/kanji/components/KanjiStrokeOrder"
import { conjugateVerb } from "@/shared/utils/verbConjugation"

import {
    capitalizeFirstLetter,
    formatMeaningEn,
    getVocabularyMeaning,
    getVocabularyPartOfSpeech,
    getVerbGroupLabel,
} from "@/features/vocabulary/utils"

import {
    getRelatedVocabularies,
    getVocabularyById,
    getVocabularyKanjis,
} from "@/features/vocabulary/services"

import type {
    RelatedVocabulary,
    Vocabulary,
} from "@/features/vocabulary/types"

import type { VocabularyKanjiDetail } from "@/features/vocabulary/services/vocabulary.service"

function formatMeaningVi(text: string) {
    const normalized = text.trim()

    const dictionaryPairs: Record<string, string> = {
        "sặc sỡ lòe loẹt": "sặc sỡ; lòe loẹt",
        "công khai trắng trợn": "công khai; trắng trợn",
    }

    const replaced = dictionaryPairs[normalized] || normalized

    return capitalizeFirstLetter(replaced)
}

function formatGlossMeaning(text: string) {
    return capitalizeFirstLetter(text.trim())
}

function getKanjiReadingText(kanji: VocabularyKanjiDetail) {
    return [kanji.onyomi, kanji.kunyomi]
        .filter(Boolean)
        .join(" ")
}

function getKanjiDisplayMeaning(
    kanji: VocabularyKanjiDetail,
    language: "vi" | "en"
) {
    if (language === "en") {
        return kanji.meaning_en || kanji.meaning_vi || "-"
    }

    return kanji.meaning_vi || kanji.meaning_en || "-"
}

export default function VocabularyDetailPage() {
    const params = useParams<{ id: string }>()
    const searchParams = useSearchParams()

    const language =
        searchParams.get("lang") === "en" ? "en" : "vi"

    const [vocabulary, setVocabulary] =
        useState<Vocabulary | null>(null)

    const [relatedVocabularies, setRelatedVocabularies] =
        useState<RelatedVocabulary[]>([])

    const [kanjiDetails, setKanjiDetails] = useState<
        VocabularyKanjiDetail[]
    >([])

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        async function fetchVocabulary() {
            setLoading(true)
            setRelatedVocabularies([])
            setKanjiDetails([])

            const data = await getVocabularyById(
                Number(params.id)
            )

            if (cancelled) {
                return
            }

            setVocabulary(data)

            if (data) {
                const [related, kanjis] = await Promise.all([
                    getRelatedVocabularies(data.word),
                    getVocabularyKanjis(data.word),
                ])

                if (!cancelled) {
                    setRelatedVocabularies(related)
                    setKanjiDetails(kanjis)
                }
            }

            if (!cancelled) {
                setLoading(false)
            }
        }

        fetchVocabulary()

        return () => {
            cancelled = true
        }
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
                                    {language === "en"
                                        ? capitalizeFirstLetter(
                                            formatMeaningEn(
                                                vocabulary
                                                    .senses?.[0]
                                                    ?.meaning_en
                                            ) || "Updating..."
                                        )
                                        : formatMeaningVi(
                                            vocabulary.senses?.[0]
                                                ?.meaning_vi ||
                                            displayMeaning ||
                                            "Đang cập nhật"
                                        )}
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
                                <h2>
                                    {language === "en"
                                        ? "Meaning"
                                        : "Từ này có nghĩa là"}
                                </h2>

                                {vocabulary.senses.length > 0 ? (
                                    <div className="sense-list">
                                        {vocabulary.senses.map(
                                            (sense, index) => {
                                                const meaning =
                                                    language === "en"
                                                        ? formatMeaningEn(
                                                            sense.meaning_en
                                                        ) ||
                                                        "Updating..."
                                                        : sense.meaning_vi ||
                                                        formatMeaningEn(
                                                            sense.meaning_en
                                                        ) ||
                                                        "Đang cập nhật"

                                                const glosses =
                                                    Array.isArray(
                                                        sense.meaning_vi_glosses
                                                    )
                                                        ? sense.meaning_vi_glosses
                                                        : []

                                                return (
                                                    <div
                                                        key={sense.id}
                                                        className="sense-item"
                                                    >
                                                        <p className="blue-title">
                                                            <strong>
                                                                {index +
                                                                    1}
                                                                .{" "}
                                                                {language ===
                                                                    "en"
                                                                    ? capitalizeFirstLetter(
                                                                        meaning
                                                                    )
                                                                    : formatMeaningVi(
                                                                        meaning
                                                                    )}
                                                            </strong>
                                                        </p>

                                                        {language ===
                                                            "vi" &&
                                                            glosses.length >
                                                            0 && (
                                                                <ul className="sense-gloss-list">
                                                                    {glosses.map(
                                                                        (
                                                                            gloss
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    gloss.index
                                                                                }
                                                                                className="sense-gloss-item"
                                                                            >
                                                                                <span className="sense-gloss-bullet">
                                                                                    •
                                                                                </span>

                                                                                <span>
                                                                                    {formatGlossMeaning(
                                                                                        gloss.meaning
                                                                                    )}
                                                                                </span>
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            )}
                                                    </div>
                                                )
                                            }
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
                                                    href={`/vocabulary/${item.id}?lang=${language}`}
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

                            {kanjiDetails.length > 0 && (
                                <div className="detail-side-card vocabulary-kanji-card">
                                    <h3>
                                        Các chữ kanji của{" "}
                                        {vocabulary.word}
                                    </h3>

                                    {kanjiDetails.map((item) => (
                                        <div
                                            key={item.kanji}
                                            className="vocabulary-kanji-item"
                                        >
                                            <div className="vocabulary-kanji-head">
                                                <Link
                                                    href={`/kanji/${item.kanji}?q=${encodeURIComponent(
                                                        vocabulary.word
                                                    )}&lang=${language}`}
                                                    className="vocabulary-kanji-char"
                                                >
                                                    {item.kanji}
                                                </Link>

                                                <span className="vocabulary-kanji-reading">
                                                    「
                                                    {getKanjiReadingText(
                                                        item
                                                    ) || "-"}
                                                    」
                                                </span>
                                            </div>

                                            <p className="vocabulary-kanji-meaning">
                                                {getKanjiDisplayMeaning(
                                                    item,
                                                    language
                                                )}
                                            </p>

                                            <KanjiStrokeOrder
                                                kanji={item.kanji}
                                                className="vocabulary-kanji-stroke"
                                            />

                                            <div className="vocabulary-kanji-info">
                                                <p>
                                                    Hán tự:{" "}
                                                    {item.kanji} -{" "}
                                                    {getKanjiDisplayMeaning(
                                                        item,
                                                        language
                                                    )}
                                                </p>

                                                <p>
                                                    訓:{" "}
                                                    {item.kunyomi ||
                                                        "-"}
                                                </p>

                                                <p>
                                                    音:{" "}
                                                    {item.onyomi ||
                                                        "-"}
                                                </p>
                                            </div>

                                            <Link
                                                href={`/kanji/${item.kanji}?q=${encodeURIComponent(
                                                    vocabulary.word
                                                )}&lang=${language}`}
                                                className="vocabulary-kanji-more"
                                            >
                                                Xem chi tiết hơn
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="detail-side-card vocabulary-related-card">
                                <h3>
                                    Các từ liên quan tới{" "}
                                    {vocabulary.word}
                                </h3>

                                {relatedVocabularies.length > 0 ? (
                                    <div className="vocabulary-related-list">
                                        {relatedVocabularies
                                            .filter(
                                                (item) =>
                                                    item.id !==
                                                    vocabulary.id
                                            )
                                            .slice(0, 8)
                                            .map((item) => (
                                                <Link
                                                    key={item.id}
                                                    href={`/vocabulary/${item.id}?lang=${language}`}
                                                    className="vocabulary-related-item"
                                                >
                                                    <strong>
                                                        {item.word}
                                                    </strong>

                                                    <span>
                                                        {item.kana ||
                                                            "-"}
                                                    </span>

                                                    <p>
                                                        {item.meaning ||
                                                            "Đang cập nhật"}
                                                    </p>
                                                </Link>
                                            ))}
                                    </div>
                                ) : (
                                    <p>Chưa có từ liên quan.</p>
                                )}
                            </div>
                        </aside>
                    </div>
                )}
            </main>
        </AppLayout>
    )
}