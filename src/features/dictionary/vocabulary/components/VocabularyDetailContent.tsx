import Link from "next/link"

import styles from "@/features/dictionary/vocabulary/styles/VocabularyDetail.module.css"

import KanjiStrokeOrder from "@/features/dictionary/kanji/components/KanjiStrokeOrder"
import { conjugateVerb } from "@/features/dictionary/vocabulary/utils/verbConjugation"

import {
    capitalizeFirstLetter,
    formatMeaningEn,
    getVocabularyMeaning,
    getVocabularyPartOfSpeech,
    getVerbGroupLabel,
} from "@/features/dictionary/vocabulary/utils"

import type {
    Vocabulary,
} from "@/domain/vocabulary/vocabulary.type"

import type {
    VocabularyRelation,
    VocabularyRelationType,
} from "@/domain/vocabulary/vocabulary-relation.type"

import type {
    VocabularyKanjiDetail,
} from "@/server/services/vocabulary/vocabulary.service"

type RelatedVocabulary = {
    id: number
    word: string
    kana: string | null
    meaning: string | null
}

type VocabularyDetailContentProps = {
    vocabulary: Vocabulary
    language: "vi" | "en"
    relatedVocabularies: RelatedVocabulary[]
    kanjiDetails: VocabularyKanjiDetail[]
    embedded?: boolean
}

type SenseGloss = {
    index: number
    meaning: string
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

function getSenseGlosses(value: unknown): SenseGloss[] {
    if (!Array.isArray(value)) {
        return []
    }

    return value.filter((item): item is SenseGloss => {
        if (
            typeof item !== "object" ||
            item === null ||
            !("index" in item) ||
            !("meaning" in item)
        ) {
            return false
        }

        return (
            typeof item.index === "number" &&
            typeof item.meaning === "string"
        )
    })
}

function createVocabularyHref(
    id: number,
    language: "vi" | "en",
    embedded: boolean
) {
    const params = new URLSearchParams({
        lang: language,
    })

    if (embedded) {
        params.set("embedded", "1")
    }

    return `/vocabulary/${id}?${params.toString()}`
}

function createKanjiHref(
    kanji: string,
    keyword: string,
    language: "vi" | "en",
    embedded: boolean
) {
    const params = new URLSearchParams({
        q: keyword,
        lang: language,
    })

    if (embedded) {
        params.set("embedded", "1")
    }

    return `/kanji/${encodeURIComponent(kanji)}?${params.toString()}`
}

function getRelationsByType(
    relations: VocabularyRelation[],
    type: VocabularyRelationType
) {
    return relations.filter((item) => item.relation_type === type)
}

function renderRelationSection(
    title: string,
    relations: VocabularyRelation[],
    language: "vi" | "en",
    embedded: boolean
) {
    if (relations.length === 0) {
        return null
    }

    return (
        <div className={styles.detailSection}>
            <h2>{title}</h2>

            <div className={styles.tagList}>
                {relations.map((item) => {
                    const relatedVocabulary =
                        item.related_vocabulary

                    if (!relatedVocabulary) {
                        return null
                    }

                    return (
                        <Link
                            key={item.id}
                            href={createVocabularyHref(
                                relatedVocabulary.id,
                                language,
                                embedded
                            )}
                            className={styles.detailTag}
                        >
                            {relatedVocabulary.primary_word ||
                                relatedVocabulary.primary_kana ||
                                "Đang cập nhật"}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default function VocabularyDetailContent({
    vocabulary,
    language,
    relatedVocabularies,
    kanjiDetails,
    embedded = false,
}: VocabularyDetailContentProps) {
    const displayMeaning = getVocabularyMeaning(vocabulary)

    const conjugations = conjugateVerb(
        vocabulary.word,
        vocabulary.verb_group
    )

    const verbGroupLabel = getVerbGroupLabel(
        vocabulary.verb_group
    )

    const synonyms = getRelationsByType(
        vocabulary.relations,
        "synonym"
    )

    const antonyms = getRelationsByType(
        vocabulary.relations,
        "antonym"
    )

    const relatedWords = getRelationsByType(
        vocabulary.relations,
        "related"
    )

    return (
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
                        <button type="button">＋</button>
                        <button type="button">📋</button>
                        <button type="button">🔊</button>
                    </div>

                    <div className={styles.detailTools}>
                        <button type="button">🔗 Kết hợp từ</button>
                        <button type="button">🖼 Ảnh minh hoạ</button>
                        <button type="button">🎙 Luyện phát âm</button>
                    </div>

                    <div className={styles.jlptRow}>
                        <span>JLPT</span>
                        <span>
                            {vocabulary.jlpt || "Đang cập nhật"}
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
                            {vocabulary.senses.map((sense, index) => {
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

                                const glosses = getSenseGlosses(
                                    sense.meaning_vi_glosses
                                )

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
                                                {language === "en"
                                                    ? capitalizeFirstLetter(
                                                        meaning
                                                    )
                                                    : formatMeaningVi(
                                                        meaning
                                                    )}
                                            </strong>
                                        </p>

                                        {language === "vi" &&
                                            glosses.length > 0 && (
                                                <ul
                                                    className={
                                                        styles.senseGlossList
                                                    }
                                                >
                                                    {glosses.map(
                                                        (gloss) => (
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
                            })}
                        </div>
                    ) : (
                        <p>Đang cập nhật</p>
                    )}
                </div>

                <div className={styles.detailSection}>
                    <h2>Từ loại</h2>

                    <p>
                        {getVocabularyPartOfSpeech(vocabulary) ||
                            "Đang cập nhật"}
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

                        <div className={styles.conjugationTable}>
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

                {vocabulary.collocations.length > 0 && (
                    <div className={styles.detailSection}>
                        <h2>Cụm từ thường dùng</h2>

                        <div className={styles.senseList}>
                            {vocabulary.collocations.map((item) => (
                                <div
                                    key={item.id}
                                    className={styles.senseItem}
                                >
                                    <p className={styles.blueTitle}>
                                        <strong>
                                            {item.expression_jp}
                                        </strong>
                                    </p>

                                    <p>
                                        {language === "en"
                                            ? item.meaning_en ||
                                            item.meaning_vi ||
                                            "Updating..."
                                            : item.meaning_vi ||
                                            item.meaning_en ||
                                            "Đang cập nhật nghĩa tiếng Việt"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {renderRelationSection(
                    language === "en"
                        ? "Synonyms"
                        : "Từ đồng nghĩa",
                    synonyms,
                    language,
                    embedded
                )}

                {renderRelationSection(
                    language === "en"
                        ? "Antonyms"
                        : "Từ trái nghĩa",
                    antonyms,
                    language,
                    embedded
                )}

                {renderRelationSection(
                    language === "en"
                        ? "Related words"
                        : "Từ liên quan",
                    relatedWords,
                    language,
                    embedded
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
                    <h3>Kết quả tra cứu {vocabulary.word}</h3>

                    <div className={styles.lookupResultList}>
                        {relatedVocabularies.length > 0 ? (
                            relatedVocabularies.map((item) => (
                                <Link
                                    key={item.id}
                                    href={createVocabularyHref(
                                        item.id,
                                        language,
                                        embedded
                                    )}
                                    className={
                                        item.id === vocabulary.id
                                            ? `${styles.lookupResultItem} ${styles.active}`
                                            : styles.lookupResultItem
                                    }
                                >
                                    <strong>{item.word}</strong>

                                    <span>{item.kana || "-"}</span>

                                    <small>
                                        {item.meaning ||
                                            "Đang cập nhật"}
                                    </small>
                                </Link>
                            ))
                        ) : (
                            <p>Không có kết quả liên quan.</p>
                        )}
                    </div>
                </div>

                {kanjiDetails.length > 0 && (
                    <div
                        className={`${styles.detailSideCard} ${styles.vocabularyKanjiCard}`}
                    >
                        <h3>
                            Các chữ kanji của {vocabulary.word}
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
                                        href={createKanjiHref(
                                            item.kanji,
                                            vocabulary.word,
                                            language,
                                            embedded
                                        )}
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
                                        {getKanjiReadingText(item) ||
                                            "-"}
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
                                        訓: {item.kunyomi || "-"}</p>

                                    <p>
                                        音: {item.onyomi || "-"}</p>
                                </div>

                                <Link
                                    href={createKanjiHref(
                                        item.kanji,
                                        vocabulary.word,
                                        language,
                                        embedded
                                    )}
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
                        Các từ liên quan tới {vocabulary.word}
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
                                        item.id !== vocabulary.id
                                )
                                .slice(0, 8)
                                .map((item) => (
                                    <Link
                                        key={item.id}
                                        href={createVocabularyHref(
                                            item.id,
                                            language,
                                            embedded
                                        )}
                                        className={
                                            styles.vocabularyRelatedItem
                                        }
                                    >
                                        <strong>{item.word}</strong>

                                        <span>{item.kana || "-"}</span>

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
    )
}