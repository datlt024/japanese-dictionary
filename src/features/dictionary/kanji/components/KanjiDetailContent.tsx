import Link from "next/link"

import styles from "@/features/dictionary/kanji/styles/KanjiDetail.module.css"

import KanjiStrokeOrder from "@/features/dictionary/kanji/components/KanjiStrokeOrder"

import type {
    Kanji,
    KanjiReadingGroup,
} from "@/domain/kanji"

import {
    getKanjiMeaning,
    getRelatedWordMeaning,
} from "@/features/dictionary/kanji/utils"

type KanjiDetailContentProps = {
    kanji: Kanji | null
    loading: boolean
    examplesLoading: boolean
    kunyomiGroups: KanjiReadingGroup[]
    onyomiGroups: KanjiReadingGroup[]
    currentKanji: string
    kanjiOptions: string[]
    searchKeyword: string
    embedded?: boolean
}

function createKanjiHref(
    kanji: string,
    searchKeyword: string,
    embedded: boolean
) {
    const params = new URLSearchParams({
        q: searchKeyword,
    })

    if (embedded) {
        params.set("embedded", "1")
    }

    return `/kanji/${encodeURIComponent(kanji)}?${params.toString()}`
}

export default function KanjiDetailContent({
    kanji,
    loading,
    examplesLoading,
    kunyomiGroups,
    onyomiGroups,
    currentKanji,
    kanjiOptions,
    searchKeyword,
    embedded = false,
}: KanjiDetailContentProps) {
    if (loading) {
        return (
            <div
                className={
                    embedded
                        ? `${styles.kanjiPageLayout} ${styles.embeddedKanjiDetail}`
                        : styles.kanjiPageLayout
                }
            >
                <section
                    className={`${styles.kanjiMainCard} ${styles.kanjiSkeletonCard}`}
                >
                    <div className={styles.kanjiSkeletonTitle} />
                    <div className={styles.kanjiSkeletonLine} />
                    <div className={styles.kanjiSkeletonBox} />
                </section>

                {!embedded && (
                    <aside className={styles.kanjiAdColumn}>
                        <div
                            className={`${styles.kanjiResultBox} ${styles.kanjiSkeletonSide}`}
                        />
                    </aside>
                )}
            </div>
        )
    }

    if (!kanji) {
        return (
            <section className={styles.kanjiMainCard}>
                <h1>Không tìm thấy Hán tự</h1>
            </section>
        )
    }

    return (
        <div
            className={
                embedded
                    ? `${styles.kanjiPageLayout} ${styles.embeddedKanjiDetail}`
                    : styles.kanjiPageLayout
            }
        >
            <section className={styles.kanjiMainCard}>
                <div className={styles.kanjiSummary}>
                    <div className={styles.kanjiSummaryLeft}>
                        <h1 className={styles.kanjiCharacter}>
                            {kanji.kanji}
                        </h1>

                        <p className={styles.kanjiMainMeaning}>
                            {getKanjiMeaning(kanji)}
                        </p>
                    </div>

                    <div className={styles.kanjiActionGroup}>
                        <button type="button">🔗</button>
                        <button type="button">📋</button>
                        <button type="button">＋</button>
                    </div>
                </div>

                <div className={styles.kanjiReadingSection}>
                    <div className={styles.kanjiReadingBlock}>
                        <h3>Phát âm</h3>

                        <div className={styles.readingItem}>
                            <span>Kunyomi</span>
                            <strong>{kanji.kunyomi || "-"}</strong>
                        </div>

                        <div className={styles.readingItem}>
                            <span>Onyomi</span>
                            <strong>{kanji.onyomi || "-"}</strong>
                        </div>
                    </div>

                    <div className={styles.kanjiStrokeWrapper}>
                        <KanjiStrokeOrder kanji={kanji.kanji} />
                    </div>
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
                            {kanji.jlpt ? `N${kanji.jlpt}` : "-"}
                        </strong>
                    </div>

                    <div>
                        <span>Tần suất</span>
                        <strong>{kanji.frequency || "-"}</strong>
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

                        {!kanji.meaning_vi && !kanji.meaning_en && (
                            <li>-</li>
                        )}
                    </ul>
                </section>

                {!embedded && (
                    <section className={styles.kanjiSection}>
                        <h2>Mẹo</h2>
                        <p>
                            Phần mẹo ghi nhớ Hán tự sẽ được bổ sung sau.
                        </p>
                    </section>
                )}

                <section className={styles.kanjiSection}>
                    <h2>Ví dụ phân loại theo cách đọc</h2>

                    {examplesLoading ? (
                        <p>Đang tải ví dụ...</p>
                    ) : (
                        <>
                            <div className={styles.readingGroupBlock}>
                                <h3>Kunyomi</h3>

                                {kunyomiGroups.length === 0 ? (
                                    <p>Chưa có ví dụ Kunyomi.</p>
                                ) : (
                                    kunyomiGroups.map((group) => (
                                        <div
                                            key={group.reading}
                                            className={
                                                styles.readingGroup
                                            }
                                        >
                                            <h4>{group.reading}</h4>

                                            <table
                                                className={
                                                    styles.readingWordTable
                                                }
                                            >
                                                <tbody>
                                                    {group.words.map(
                                                        (word) => (
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
                                    ))
                                )}
                            </div>

                            <div className={styles.readingGroupBlock}>
                                <h3>Onyomi</h3>

                                {onyomiGroups.length === 0 ? (
                                    <p>Chưa có ví dụ Onyomi.</p>
                                ) : (
                                    onyomiGroups.map((group) => (
                                        <div
                                            key={group.reading}
                                            className={
                                                styles.readingGroup
                                            }
                                        >
                                            <h4>{group.reading}</h4>

                                            <table
                                                className={
                                                    styles.readingWordTable
                                                }
                                            >
                                                <tbody>
                                                    {group.words.map(
                                                        (word) => (
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
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </section>

                {!embedded && (
                    <section className={styles.kanjiSection}>
                        <h2>Ví dụ</h2>

                        <div className={styles.kanjiExampleList}>
                            <div className={styles.kanjiExampleItem}>
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
                )}
            </section>

            {!embedded && (
                <aside className={styles.kanjiAdColumn}>
                    {kanjiOptions.length > 1 && (
                        <div className={styles.kanjiResultBox}>
                            <h3>Kết quả tra cứu kanji</h3>

                            <div className={styles.kanjiResultList}>
                                {kanjiOptions.map((item) => (
                                    <Link
                                        key={item}
                                        href={createKanjiHref(
                                            item,
                                            searchKeyword,
                                            embedded
                                        )}
                                        className={
                                            item === currentKanji
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
            )}
        </div>
    )
}