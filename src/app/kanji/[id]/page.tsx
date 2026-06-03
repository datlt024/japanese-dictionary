"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"

import "@/styles/kanji-detail.css"

import AppLayout from "@/shared/components/layout/AppLayout"

import { uniqueArray } from "@/shared/utils/uniqueArray"

import type {
    Kanji,
    KanjiReadingGroup,
} from "@/features/kanji/types"

import {
    getKanjiByCharacter,
    getWordsByReadingGroups,
} from "@/features/kanji/services/kanji.service"

import {
    extractKanjis,
    getKanjiMeaning,
    getRelatedWordMeaning,
} from "@/features/kanji/utils"

export default function KanjiDetailPage() {
    const params = useParams<{ id: string }>()
    const searchParams = useSearchParams()

    const [kanji, setKanji] = useState<Kanji | null>(null)

    const [kunyomiGroups, setKunyomiGroups] =
        useState<KanjiReadingGroup[]>([])

    const [onyomiGroups, setOnyomiGroups] =
        useState<KanjiReadingGroup[]>([])

    const [loading, setLoading] = useState(true)
    const [examplesLoading, setExamplesLoading] = useState(false)

    const currentKanji = useMemo(() => {
        return decodeURIComponent(params.id).replace(/\0/g, "")
    }, [params.id])

    const searchKeyword = searchParams.get("q") || currentKanji

    const kanjiOptions = useMemo(() => {
        const kanjis = extractKanjis(searchKeyword)

        if (kanjis.length === 0) {
            return currentKanji ? [currentKanji] : []
        }

        return uniqueArray(kanjis)
    }, [searchKeyword, currentKanji])

    useEffect(() => {
        let cancelled = false

        async function fetchKanji() {
            setLoading(true)
            setExamplesLoading(false)
            setKanji(null)
            setKunyomiGroups([])
            setOnyomiGroups([])

            const kanjiData =
                await getKanjiByCharacter(currentKanji)

            if (cancelled) {
                return
            }

            if (!kanjiData) {
                setKanji(null)
                setLoading(false)
                return
            }

            setKanji(kanjiData)
            setLoading(false)
            setExamplesLoading(true)

            const [kunyomiData, onyomiData] =
                await Promise.all([
                    getWordsByReadingGroups(
                        currentKanji,
                        kanjiData.kunyomi
                    ),
                    getWordsByReadingGroups(
                        currentKanji,
                        kanjiData.onyomi
                    ),
                ])

            if (cancelled) {
                return
            }

            setKunyomiGroups(kunyomiData)
            setOnyomiGroups(onyomiData)
            setExamplesLoading(false)
        }

        fetchKanji()

        return () => {
            cancelled = true
        }
    }, [currentKanji])

    return (
        <AppLayout
            title="Hán tự"
            searchKeyword={searchKeyword}
            activeSearchTab="kanji"
        >
            <main className="kanji-detail-page">
                {loading ? (
                    <div className="kanji-page-layout">
                        <section className="kanji-main-card kanji-skeleton-card">
                            <div className="kanji-skeleton-title" />
                            <div className="kanji-skeleton-line" />
                            <div className="kanji-skeleton-box" />
                        </section>

                        <aside className="kanji-ad-column">
                            <div className="kanji-result-box kanji-skeleton-side" />
                        </aside>
                    </div>
                ) : !kanji ? (
                    <section className="kanji-main-card">
                        <h1>Không tìm thấy Hán tự</h1>
                    </section>
                ) : (
                    <div className="kanji-page-layout">
                        <section className="kanji-main-card">
                            <div className="kanji-summary">
                                <div className="kanji-summary-left">
                                    <h1 className="kanji-character">
                                        {kanji.kanji}
                                    </h1>

                                    <p className="kanji-main-meaning">
                                        {getKanjiMeaning(kanji)}
                                    </p>
                                </div>

                                <div className="kanji-action-group">
                                    <button>🔗</button>
                                    <button>📋</button>
                                    <button>＋</button>
                                </div>
                            </div>

                            <div className="kanji-reading-section">
                                <div className="kanji-reading-block">
                                    <h3>Phát âm</h3>

                                    <div className="reading-item">
                                        <span>Kunyomi</span>
                                        <strong>{kanji.kunyomi || "-"}</strong>
                                    </div>

                                    <div className="reading-item">
                                        <span>Onyomi</span>
                                        <strong>{kanji.onyomi || "-"}</strong>
                                    </div>
                                </div>

                                <div className="kanji-stroke-preview">
                                    <div className="stroke-box">
                                        {kanji.kanji}
                                    </div>
                                </div>
                            </div>

                            <div className="kanji-meta-row">
                                <div>
                                    <span>Số nét</span>
                                    <strong>{kanji.stroke_count || "-"}</strong>
                                </div>

                                <div>
                                    <span>JLPT</span>
                                    <strong>
                                        {kanji.jlpt ? `N${kanji.jlpt}` : "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Tần suất</span>
                                    <strong>{kanji.frequency || "-"}</strong>
                                </div>
                            </div>

                            <section className="kanji-section">
                                <h2>Nghĩa</h2>

                                <ul>
                                    {kanji.meaning_vi && (
                                        <li>{kanji.meaning_vi}</li>
                                    )}

                                    {kanji.meaning_en && (
                                        <li>{kanji.meaning_en}</li>
                                    )}

                                    {!kanji.meaning_vi &&
                                        !kanji.meaning_en && (
                                            <li>-</li>
                                        )}
                                </ul>
                            </section>

                            <section className="kanji-section">
                                <h2>Mẹo</h2>
                                <p>
                                    Phần mẹo ghi nhớ Hán tự sẽ được bổ sung sau.
                                </p>
                            </section>

                            <section className="kanji-section">
                                <h2>Ví dụ phân loại theo cách đọc</h2>

                                {examplesLoading ? (
                                    <p>Đang tải ví dụ...</p>
                                ) : (
                                    <>
                                        <div className="reading-group-block">
                                            <h3>Kunyomi</h3>

                                            {kunyomiGroups.length === 0 ? (
                                                <p>Chưa có ví dụ Kunyomi.</p>
                                            ) : (
                                                kunyomiGroups.map((group) => (
                                                    <div
                                                        key={group.reading}
                                                        className="reading-group"
                                                    >
                                                        <h4>{group.reading}</h4>

                                                        <table className="reading-word-table">
                                                            <tbody>
                                                                {group.words.map((word) => (
                                                                    <tr key={word.id}>
                                                                        <td>{word.word}</td>
                                                                        <td>{word.kana || "-"}</td>
                                                                        <td>
                                                                            {getRelatedWordMeaning(word)}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <div className="reading-group-block">
                                            <h3>Onyomi</h3>

                                            {onyomiGroups.length === 0 ? (
                                                <p>Chưa có ví dụ Onyomi.</p>
                                            ) : (
                                                onyomiGroups.map((group) => (
                                                    <div
                                                        key={group.reading}
                                                        className="reading-group"
                                                    >
                                                        <h4>{group.reading}</h4>

                                                        <table className="reading-word-table">
                                                            <tbody>
                                                                {group.words.map((word) => (
                                                                    <tr key={word.id}>
                                                                        <td>{word.word}</td>
                                                                        <td>{word.kana || "-"}</td>
                                                                        <td>
                                                                            {getRelatedWordMeaning(word)}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </section>

                            <section className="kanji-section">
                                <h2>Ví dụ</h2>

                                <div className="kanji-example-list">
                                    <div className="kanji-example-item">
                                        <p className="example-jp">
                                            {kanji.kanji}を勉強しています。
                                        </p>

                                        <p className="example-vi">
                                            Tôi đang học chữ {kanji.kanji}.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </section>

                        <aside className="kanji-ad-column">
                            {kanjiOptions.length > 1 && (
                                <div className="kanji-result-box">
                                    <h3>Kết quả tra cứu kanji</h3>

                                    <div className="kanji-result-list">
                                        {kanjiOptions.map((item) => (
                                            <Link
                                                key={item}
                                                href={`/kanji/${encodeURIComponent(
                                                    item
                                                )}?q=${encodeURIComponent(searchKeyword)}`}
                                                className={
                                                    item === currentKanji
                                                        ? "kanji-result-item active"
                                                        : "kanji-result-item"
                                                }
                                            >
                                                <span className="kanji-result-char">
                                                    {item}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                )}
            </main>
        </AppLayout>
    )
}