import Link from "next/link"

import styles from "@/features/dictionary/vocabulary/styles/VocabularyDetail.module.css"

import AppLayout from "@/shared/components/layout/AppLayout"
import KanjiStrokeOrder from "@/features/dictionary/kanji/components/KanjiStrokeOrder"
import { conjugateVerb } from "@/features/dictionary/vocabulary/utils/verbConjugation"

import {
    capitalizeFirstLetter,
    formatMeaningEn,
    getVocabularyMeaning,
    getVocabularyPartOfSpeech,
    getVerbGroupLabel,
} from "@/features/dictionary/vocabulary/utils"

import {
    getVocabularyById,
    getVocabularyKanjis,
    type VocabularyKanjiDetail,
} from "@/server/services/vocabulary/vocabulary.service"

import { getRelatedVocabulariesFromDatabase } from "@/server/services/vocabulary/related-vocabulary.service"

type Props = {
    params: Promise<{
        id: string
    }>
    searchParams?: Promise<{
        lang?: string
    }>
}

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

export default async function VocabularyDetailPage({
    params,
    searchParams,
}: Props) {
    const resolvedParams = await params
    const resolvedSearchParams = searchParams
        ? await searchParams
        : {}

    const language: "vi" | "en" =
        resolvedSearchParams.lang === "en" ? "en" : "vi"

    const vocabularyId = Number(resolvedParams.id)
    const vocabulary = await getVocabularyById(vocabularyId)

    const relatedResult = vocabulary
        ? await getRelatedVocabulariesFromDatabase(vocabulary.word)
        : {
            results: [],
            error: null,
        }

    const kanjiDetails = vocabulary
        ? await getVocabularyKanjis(vocabulary.word)
        : []

    const relatedVocabularies = relatedResult.results

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
            <main className={styles.vocabularyDetail}>
                {!vocabulary ? (
                    <div className={styles.detailMain}>
                        <h1>Không tìm thấy từ vựng</h1>

                        <Link href="/" className={styles.backButton}>
                            ← Quay lại
                        </Link>
                    </div>
                ) : (
                    <div className={styles.detailLayout}>
                        <section className={styles.detailMain}>
                            <div className={styles.detailHeader}>
                                <h1 className={styles.detailWord}>
                                    {vocabulary.word}
                                </h1>

                                <p className={styles.detailKana}>
                                    「{vocabulary.kana || "-"}」
                                </p>

                                <p className={styles.detailMeaning}>
                                    {language === "en"
                                        ? capitalizeFirstLetter(
                                            formatMeaningEn(
                                                vocabulary.senses?.[0]
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

                                <div className={styles.detailActions}>
                                    <button>＋</button>
                                    <button>📋</button>
                                    <button>🔊</button>
                                </div>

                                <div className={styles.detailTools}>
                                    <button>🔗 Kết hợp từ</button>
                                    <button>🖼 Ảnh minh hoạ</button>
                                    <button>🎙 Luyện phát âm</button>
                                </div>

                                <div className={styles.jlptRow}>
                                    <span>JLPT</span>
                                    <span>
                                        {vocabulary.jlpt ||
                                            "Đang cập nhật"}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.detailSection}>
                                <h2>
                                    {language === "en"
                                        ? "Meaning"
                                        : "Từ này có nghĩa là"}
                                </h2>

                                {vocabulary.senses.length > 0 ? (
                                    <div className={styles.senseList}>
                                        {vocabulary.senses.map(
                                            (sense, index) => {
                                                const meaning =
                                                    language === "en"
                                                        ? formatMeaningEn(
                                                            sense.meaning_en
                                                        ) || "Updating..."
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
                                                        className={
                                                            styles.senseItem
                                                        }
                                                    >
                                                        <p
                                                            className={
                                                                styles.blueTitle
                                                            }
                                                        >
                                                            <strong>
                                                                {index + 1}.{" "}
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

                                                        {language === "vi" &&
                                                            glosses.length >
                                                            0 && (
                                                                <ul
                                                                    className={
                                                                        styles.senseGlossList
                                                                    }
                                                                >
                                                                    {glosses.map(
                                                                        (
                                                                            gloss
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    gloss.index
                                                                                }
                                                                                className={
                                                                                    styles.senseGlossItem
                                                                                }
                                                                            >
                                                                                <span
                                                                                    className={
                                                                                        styles.senseGlossBullet
                                                                                    }
                                                                                >
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

                            <div className={styles.detailSection}>
                                <h2>Từ loại</h2>

                                <p>
                                    {getVocabularyPartOfSpeech(
                                        vocabulary
                                    ) || "Đang cập nhật"}
                                </p>
                            </div>

                            {vocabulary.writings.length > 1 && (
                                <div className={styles.detailSection}>
                                    <h2>Cách viết khác</h2>

                                    <div className={styles.tagList}>
                                        {vocabulary.writings
                                            .filter(
                                                (item) =>
                                                    item.writing !==
                                                    vocabulary.word
                                            )
                                            .map((item) => (
                                                <span
                                                    key={item.id}
                                                    className={
                                                        styles.detailTag
                                                    }
                                                >
                                                    {item.writing}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {vocabulary.readings.length > 1 && (
                                <div className={styles.detailSection}>
                                    <h2>Cách đọc khác</h2>

                                    <div className={styles.tagList}>
                                        {vocabulary.readings
                                            .filter(
                                                (item) =>
                                                    item.reading !==
                                                    vocabulary.kana
                                            )
                                            .map((item) => (
                                                <span
                                                    key={item.id}
                                                    className={
                                                        styles.detailTag
                                                    }
                                                >
                                                    {item.reading}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {verbGroupLabel && (
                                <div className={styles.detailSection}>
                                    <h2>Nhóm động từ</h2>
                                    <p>{verbGroupLabel}</p>
                                </div>
                            )}

                            {conjugations.length > 0 && (
                                <div className={styles.detailSection}>
                                    <h2>Chia động từ</h2>

                                    <div
                                        className={
                                            styles.conjugationTable
                                        }
                                    >
                                        {conjugations.map((item) => (
                                            <div
                                                key={item.label}
                                                className={
                                                    styles.conjugationRow
                                                }
                                            >
                                                <span>{item.label}</span>
                                                <strong>{item.form}</strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={styles.detailSection}>
                                <h2>Ví dụ</h2>

                                <p className={styles.exampleJp}>
                                    Ví dụ sẽ được cập nhật sau.
                                </p>
                            </div>
                        </section>

                        <aside className={styles.detailSidebar}>
                            <div className={styles.detailSideCard}>
                                <h3>
                                    Kết quả tra cứu {vocabulary.word}
                                </h3>

                                <div
                                    className={
                                        styles.lookupResultList
                                    }
                                >
                                    {relatedVocabularies.length > 0 ? (
                                        relatedVocabularies.map(
                                            (item) => (
                                                <Link
                                                    key={item.id}
                                                    href={`/vocabulary/${item.id}?lang=${language}`}
                                                    className={
                                                        item.id ===
                                                            vocabulary.id
                                                            ? `${styles.lookupResultItem} ${styles.active}`
                                                            : styles.lookupResultItem
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
                                            Không có kết quả liên quan.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {kanjiDetails.length > 0 && (
                                <div
                                    className={`${styles.detailSideCard} ${styles.vocabularyKanjiCard}`}
                                >
                                    <h3>
                                        Các chữ kanji của{" "}
                                        {vocabulary.word}
                                    </h3>

                                    {kanjiDetails.map((item) => (
                                        <div
                                            key={item.kanji}
                                            className={
                                                styles.vocabularyKanjiItem
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.vocabularyKanjiHead
                                                }
                                            >
                                                <Link
                                                    href={`/kanji/${item.kanji}?q=${encodeURIComponent(
                                                        vocabulary.word
                                                    )}&lang=${language}`}
                                                    className={
                                                        styles.vocabularyKanjiChar
                                                    }
                                                >
                                                    {item.kanji}
                                                </Link>

                                                <span
                                                    className={
                                                        styles.vocabularyKanjiReading
                                                    }
                                                >
                                                    「
                                                    {getKanjiReadingText(
                                                        item
                                                    ) || "-"}
                                                    」
                                                </span>
                                            </div>

                                            <p
                                                className={
                                                    styles.vocabularyKanjiMeaning
                                                }
                                            >
                                                {getKanjiDisplayMeaning(
                                                    item,
                                                    language
                                                )}
                                            </p>

                                            <KanjiStrokeOrder
                                                kanji={item.kanji}
                                                className={
                                                    styles.vocabularyKanjiStroke
                                                }
                                            />

                                            <div
                                                className={
                                                    styles.vocabularyKanjiInfo
                                                }
                                            >
                                                <p>
                                                    Hán tự: {item.kanji} -{" "}
                                                    {getKanjiDisplayMeaning(
                                                        item,
                                                        language
                                                    )}
                                                </p>

                                                <p>
                                                    訓:{" "}
                                                    {item.kunyomi || "-"}
                                                </p>

                                                <p>
                                                    音:{" "}
                                                    {item.onyomi || "-"}
                                                </p>
                                            </div>

                                            <Link
                                                href={`/kanji/${item.kanji}?q=${encodeURIComponent(
                                                    vocabulary.word
                                                )}&lang=${language}`}
                                                className={
                                                    styles.vocabularyKanjiMore
                                                }
                                            >
                                                Xem chi tiết hơn
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div
                                className={`${styles.detailSideCard} ${styles.vocabularyRelatedCard}`}
                            >
                                <h3>
                                    Các từ liên quan tới{" "}
                                    {vocabulary.word}
                                </h3>

                                {relatedVocabularies.length > 0 ? (
                                    <div
                                        className={
                                            styles.vocabularyRelatedList
                                        }
                                    >
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
                                                    className={
                                                        styles.vocabularyRelatedItem
                                                    }
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