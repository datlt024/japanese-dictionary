"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import "@/styles/kanji-detail.css"

import AppLayout from "@/components/layout/AppLayout"
import TopSearchBar from "@/components/layout/TopSearchBar"

import { Kanji } from "@/features/kanji/types/kanji.types"
import {
    getKanjiByCharacter,
    getRelatedWordMeaning,
    KanjiReadingGroup,
    getWordsByReadingGroups,
} from "@/features/kanji/services/kanji.service"

export default function KanjiDetailPage() {
    const params = useParams<{ id: string }>()

    const [kanji, setKanji] =
        useState<Kanji | null>(null)

    const [kunyomiGroups, setKunyomiGroups] =
        useState<KanjiReadingGroup[]>([])

    const [onyomiGroups, setOnyomiGroups] =
        useState<KanjiReadingGroup[]>([])

    const [loading, setLoading] =
        useState(true)

    useEffect(() => {
        async function fetchKanji() {
            setLoading(true)

            const character = decodeURIComponent(
                params.id
            ).replace(/\0/g, "")

            const kanjiData =
                await getKanjiByCharacter(character)

            if (!kanjiData) {
                setKanji(null)
                setKunyomiGroups([])
                setOnyomiGroups([])
                setLoading(false)
                return
            }

            const [kunyomiData, onyomiData] =
                await Promise.all([
                    getWordsByReadingGroups(
                        character,
                        kanjiData.kunyomi
                    ),
                    getWordsByReadingGroups(
                        character,
                        kanjiData.onyomi
                    ),
                ])

            setKanji(kanjiData)
            setKunyomiGroups(kunyomiData)
            setOnyomiGroups(onyomiData)
            setLoading(false)
        }

        fetchKanji()
    }, [params.id])

    return (
        <AppLayout title="Hán tự">
            <main className="kanji-detail-page">
                <TopSearchBar />

                {loading ? (
                    <section className="kanji-main-card">
                        <h1>Đang tải Hán tự...</h1>
                    </section>
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
                                        {kanji.meaning}
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
                                        <strong>
                                            {kanji.kunyomi || "-"}
                                        </strong>
                                    </div>

                                    <div className="reading-item">
                                        <span>Onyomi</span>
                                        <strong>
                                            {kanji.onyomi || "-"}
                                        </strong>
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
                                    <strong>
                                        {kanji.stroke_count || "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>JLPT</span>
                                    <strong>
                                        {kanji.jlpt ? `N${kanji.jlpt}` : "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Tần suất</span>
                                    <strong>
                                        {kanji.frequency || "-"}
                                    </strong>
                                </div>
                            </div>

                            <section className="kanji-section">
                                <h2>Nghĩa</h2>

                                <ul>
                                    <li>{kanji.meaning || "-"}</li>
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
                            {/* Quảng cáo đặt ở đây sau */}
                        </aside>
                    </div>
                )}
            </main>
        </AppLayout>
    )
}