"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"

import styles from "@/features/kanji/styles/KanjiDetail.module.css"

import AppLayout from "@/shared/components/layout/AppLayout"
import KanjiStrokeOrder from "@/features/kanji/components/KanjiStrokeOrder"

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
            <main className={styles.kanjiDetailPage}>
                {loading ? (
                    <div className={styles.kanjiPageLayout}>
                        <section
                            className={`${styles.kanjiMainCard} ${styles.kanjiSkeletonCard}`}
                        >
                            <div
                                className={
                                    styles.kanjiSkeletonTitle
                                }
                            />
                            <div
                                className={
                                    styles.kanjiSkeletonLine
                                }
                            />
                            <div
                                className={styles.kanjiSkeletonBox}
                            />
                        </section>

                        <aside className={styles.kanjiAdColumn}>
                            <div
                                className={`${styles.kanjiResultBox} ${styles.kanjiSkeletonSide}`}
                            />
                        </aside>
                    </div>
                ) : !kanji ? (
                    <section className={styles.kanjiMainCard}>
                        <h1>Không tìm thấy Hán tự</h1>
                    </section>
                ) : (
                    <div className={styles.kanjiPageLayout}>
                        <section className={styles.kanjiMainCard}>
                            <div className={styles.kanjiSummary}>
                                <div
                                    className={
                                        styles.kanjiSummaryLeft
                                    }
                                >
                                    <h1
                                        className={
                                            styles.kanjiCharacter
                                        }
                                    >
                                        {kanji.kanji}
                                    </h1>

                                    <p
                                        className={
                                            styles.kanjiMainMeaning
                                        }
                                    >
                                        {getKanjiMeaning(kanji)}
                                    </p>
                                </div>

                                <div
                                    className={
                                        styles.kanjiActionGroup
                                    }
                                >
                                    <button>🔗</button>
                                    <button>📋</button>
                                    <button>＋</button>
                                </div>
                            </div>

                            <div
                                className={
                                    styles.kanjiReadingSection
                                }
                            >
                                <div
                                    className={
                                        styles.kanjiReadingBlock
                                    }
                                >
                                    <h3>Phát âm</h3>

                                    <div
                                        className={
                                            styles.readingItem
                                        }
                                    >
                                        <span>Kunyomi</span>
                                        <strong>
                                            {kanji.kunyomi || "-"}
                                        </strong>
                                    </div>

                                    <div
                                        className={
                                            styles.readingItem
                                        }
                                    >
                                        <span>Onyomi</span>
                                        <strong>
                                            {kanji.onyomi || "-"}
                                        </strong>
                                    </div>
                                </div>

                                <KanjiStrokeOrder kanji={kanji.kanji} />
                            </div>

                            <div className={styles.kanjiMetaRow}>
                                <div>
                                    <span>Số nét</span>
                                    <strong>
                                        {kanji.stroke_count || "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>JLPT</span>
                                    <strong>
                                        {kanji.jlpt
                                            ? `N${kanji.jlpt}`
                                            : "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Tần suất</span>
                                    <strong>
                                        {kanji.frequency || "-"}
                                    </strong>
                                </div>
                            </div>

                            <section className={styles.kanjiSection}>
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

                            <section className={styles.kanjiSection}>
                                <h2>Mẹo</h2>
                                <p>
                                    Phần mẹo ghi nhớ Hán tự sẽ được bổ sung sau.
                                </p>
                            </section>

                            <section className={styles.kanjiSection}>
                                <h2>Ví dụ phân loại theo cách đọc</h2>

                                {examplesLoading ? (
                                    <p>Đang tải ví dụ...</p>
                                ) : (
                                    <>
                                        <div
                                            className={
                                                styles.readingGroupBlock
                                            }
                                        >
                                            <h3>Kunyomi</h3>

                                            {kunyomiGroups.length ===
                                                0 ? (
                                                <p>
                                                    Chưa có ví dụ
                                                    Kunyomi.
                                                </p>
                                            ) : (
                                                kunyomiGroups.map(
                                                    (group) => (
                                                        <div
                                                            key={
                                                                group.reading
                                                            }
                                                            className={
                                                                styles.readingGroup
                                                            }
                                                        >
                                                            <h4>
                                                                {
                                                                    group.reading
                                                                }
                                                            </h4>

                                                            <table
                                                                className={
                                                                    styles.readingWordTable
                                                                }
                                                            >
                                                                <tbody>
                                                                    {group.words.map(
                                                                        (
                                                                            word
                                                                        ) => (
                                                                            <tr
                                                                                key={
                                                                                    word.id
                                                                                }
                                                                            >
                                                                                <td>
                                                                                    {
                                                                                        word.word
                                                                                    }
                                                                                </td>
                                                                                <td>
                                                                                    {word.kana ||
                                                                                        "-"}
                                                                                </td>
                                                                                <td>
                                                                                    {getRelatedWordMeaning(
                                                                                        word
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )
                                                )
                                            )}
                                        </div>

                                        <div
                                            className={
                                                styles.readingGroupBlock
                                            }
                                        >
                                            <h3>Onyomi</h3>

                                            {onyomiGroups.length ===
                                                0 ? (
                                                <p>
                                                    Chưa có ví dụ
                                                    Onyomi.
                                                </p>
                                            ) : (
                                                onyomiGroups.map(
                                                    (group) => (
                                                        <div
                                                            key={
                                                                group.reading
                                                            }
                                                            className={
                                                                styles.readingGroup
                                                            }
                                                        >
                                                            <h4>
                                                                {
                                                                    group.reading
                                                                }
                                                            </h4>

                                                            <table
                                                                className={
                                                                    styles.readingWordTable
                                                                }
                                                            >
                                                                <tbody>
                                                                    {group.words.map(
                                                                        (
                                                                            word
                                                                        ) => (
                                                                            <tr
                                                                                key={
                                                                                    word.id
                                                                                }
                                                                            >
                                                                                <td>
                                                                                    {
                                                                                        word.word
                                                                                    }
                                                                                </td>
                                                                                <td>
                                                                                    {word.kana ||
                                                                                        "-"}
                                                                                </td>
                                                                                <td>
                                                                                    {getRelatedWordMeaning(
                                                                                        word
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )
                                                )
                                            )}
                                        </div>
                                    </>
                                )}
                            </section>

                            <section className={styles.kanjiSection}>
                                <h2>Ví dụ</h2>

                                <div className={styles.kanjiExampleList}>
                                    <div
                                        className={
                                            styles.kanjiExampleItem
                                        }
                                    >
                                        <p className={styles.exampleJp}>
                                            {kanji.kanji}
                                            を勉強しています。
                                        </p>

                                        <p className={styles.exampleVi}>
                                            Tôi đang học chữ {kanji.kanji}.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </section>

                        <aside className={styles.kanjiAdColumn}>
                            {kanjiOptions.length > 1 && (
                                <div className={styles.kanjiResultBox}>
                                    <h3>Kết quả tra cứu kanji</h3>

                                    <div
                                        className={
                                            styles.kanjiResultList
                                        }
                                    >
                                        {kanjiOptions.map((item) => (
                                            <Link
                                                key={item}
                                                href={`/kanji/${encodeURIComponent(
                                                    item
                                                )}?q=${encodeURIComponent(
                                                    searchKeyword
                                                )}`}
                                                className={
                                                    item ===
                                                        currentKanji
                                                        ? `${styles.kanjiResultItem} ${styles.active}`
                                                        : styles.kanjiResultItem
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles.kanjiResultChar
                                                    }
                                                >
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