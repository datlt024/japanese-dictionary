"use client"

import Link from "next/link"

import styles from "./SearchHubDropdown.module.css"

import type { DictionaryLanguage } from "@/shared/types/dictionaryLanguage"

import {
    SearchHubResult,
    SearchVocabulary,
    SearchKanji,
    SearchGrammar,
    SearchTab,
} from "@/features/search/hooks/useSearchHub"

type Props = {
    result: SearchHubResult
    keyword: string
    loading: boolean
    activeTab: SearchTab
    language: DictionaryLanguage
}

function getVocabularyMeaning(
    item: SearchVocabulary,
    language: DictionaryLanguage
) {
    if (language === "en") {
        return item.meaning_en || item.meaning_vi || ""
    }

    return item.meaning_vi || item.meaning_en || ""
}

function getVocabularyKana(item: SearchVocabulary) {
    if (Array.isArray(item.kana)) {
        return item.kana.length > 0
            ? item.kana.join(" ")
            : "-"
    }

    return item.kana || "-"
}

function getGrammarMeaning(
    item: SearchGrammar,
    language: DictionaryLanguage
) {
    if (language === "en") {
        return item.meaning_en || item.meaning_vi || ""
    }

    return item.meaning_vi || item.meaning_en || ""
}

function getKanjiMeaning(
    item: SearchKanji,
    language: DictionaryLanguage
) {
    if (language === "en") {
        return item.meaning_en || item.meaning_vi || "-"
    }

    return item.meaning_vi || item.meaning_en || "-"
}

function sortVocabularies(
    items: SearchVocabulary[],
    keyword: string,
    language: DictionaryLanguage
) {
    const searchText = keyword.trim().toLowerCase()

    const getScore = (item: SearchVocabulary) => {
        const word = item.word.toLowerCase()

        const kana = Array.isArray(item.kana)
            ? item.kana.join(" ").toLowerCase()
            : (item.kana || "").toLowerCase()

        const meaning = getVocabularyMeaning(
            item,
            language
        ).toLowerCase()

        if (word === searchText && item.word.length === 1) {
            return 0
        }

        if (word === searchText) return 1
        if (kana === searchText) return 2

        if (item.is_common && word.startsWith(searchText)) {
            return 3
        }

        if (item.is_common && kana.startsWith(searchText)) {
            return 4
        }

        if (word.startsWith(searchText)) return 5
        if (kana.startsWith(searchText)) return 6

        if (item.is_common && word.includes(searchText)) {
            return 7
        }

        if (item.is_common && kana.includes(searchText)) {
            return 8
        }

        if (word.includes(searchText)) return 9
        if (kana.includes(searchText)) return 10
        if (meaning.includes(searchText)) return 11

        return 99
    }

    return [...items].sort(
        (a, b) => getScore(a) - getScore(b)
    )
}

function sortGrammars(
    items: SearchGrammar[],
    keyword: string,
    language: DictionaryLanguage
) {
    const searchText = keyword.trim().toLowerCase()

    const getScore = (item: SearchGrammar) => {
        const pattern = item.pattern.toLowerCase()
        const meaning = getGrammarMeaning(
            item,
            language
        ).toLowerCase()
        const structure = (
            item.structure || ""
        ).toLowerCase()

        if (pattern === searchText) return 0
        if (pattern.includes(searchText)) return 1
        if (structure.includes(searchText)) return 2
        if (meaning.includes(searchText)) return 3

        return 99
    }

    return [...items].sort(
        (a, b) => getScore(a) - getScore(b)
    )
}

function extractKanjis(text: string) {
    return Array.from(
        text.matchAll(/[\u4e00-\u9faf]/g)
    ).map((match) => match[0])
}

function uniqueArray(items: string[]) {
    return Array.from(new Set(items))
}

export default function SearchHubDropdown({
    result,
    keyword,
    loading,
    activeTab,
    language,
}: Props) {
    const cleanKeyword = keyword.trim()

    if (!cleanKeyword) {
        return null
    }

    const shouldShowDropdown =
        activeTab === "vocabulary" ||
        activeTab === "kanji" ||
        activeTab === "grammar"

    if (!shouldShowDropdown) {
        return null
    }

    const kanjiOptions = uniqueArray(
        extractKanjis(cleanKeyword)
    )

    return (
        <div className={styles.searchHubDropdown}>
            <div className={styles.searchHubContent}>
                {activeTab === "vocabulary" && (
                    <>
                        {result.vocabularies.length === 0 &&
                            !loading ? (
                            <p className={styles.searchHubEmpty}>
                                Không tìm thấy từ vựng.
                            </p>
                        ) : (
                            sortVocabularies(
                                result.vocabularies,
                                cleanKeyword,
                                language
                            )
                                .slice(0, 10)
                                .map((item, index) => (
                                    <Link
                                        key={`vocabulary-${item.id}-${index}`}
                                        href={`/vocabulary/${item.id}?lang=${language}`}
                                        className={
                                            styles.searchHubItem
                                        }
                                    >
                                        <div>
                                            <strong>
                                                {item.word}
                                            </strong>

                                            <span>
                                                {getVocabularyKana(
                                                    item
                                                )}
                                            </span>
                                        </div>

                                        <p>
                                            {getVocabularyMeaning(
                                                item,
                                                language
                                            ) || "Đang cập nhật"}
                                        </p>
                                    </Link>
                                ))
                        )}
                    </>
                )}

                {activeTab === "kanji" && (
                    <>
                        {kanjiOptions.length > 0 ? (
                            kanjiOptions.map((item, index) => (
                                <Link
                                    key={`kanji-option-${item}-${index}`}
                                    href={`/kanji/${encodeURIComponent(
                                        item
                                    )}?q=${encodeURIComponent(
                                        cleanKeyword
                                    )}&lang=${language}`}
                                    className={
                                        styles.searchHubKanji
                                    }
                                >
                                    <strong>{item}</strong>
                                </Link>
                            ))
                        ) : result.kanjis.length === 0 &&
                            !loading ? (
                            <p className={styles.searchHubEmpty}>
                                Không tìm thấy Hán tự.
                            </p>
                        ) : (
                            result.kanjis.map(
                                (
                                    item: SearchKanji,
                                    index
                                ) => (
                                    <Link
                                        key={`kanji-${item.id}-${index}`}
                                        href={`/kanji/${encodeURIComponent(
                                            item.kanji
                                        )}?q=${encodeURIComponent(
                                            cleanKeyword
                                        )}&lang=${language}`}
                                        className={
                                            styles.searchHubKanji
                                        }
                                    >
                                        <strong>
                                            {item.kanji}
                                        </strong>

                                        <div>
                                            <p>
                                                {getKanjiMeaning(
                                                    item,
                                                    language
                                                )}
                                            </p>

                                            <span>
                                                On:{" "}
                                                {item.onyomi ||
                                                    "-"}{" "}
                                                / Kun:{" "}
                                                {item.kunyomi ||
                                                    "-"}
                                            </span>
                                        </div>
                                    </Link>
                                )
                            )
                        )}
                    </>
                )}

                {activeTab === "grammar" && (
                    <>
                        {result.grammars.length === 0 &&
                            !loading ? (
                            <p className={styles.searchHubEmpty}>
                                Không tìm thấy ngữ pháp.
                            </p>
                        ) : (
                            sortGrammars(
                                result.grammars,
                                cleanKeyword,
                                language
                            )
                                .slice(0, 10)
                                .map((item, index) => (
                                    <Link
                                        key={`grammar-${item.id}-${index}`}
                                        href={`/grammar/${item.id}?q=${encodeURIComponent(
                                            cleanKeyword
                                        )}&lang=${language}`}
                                        className={
                                            styles.searchHubItem
                                        }
                                    >
                                        <div>
                                            <strong>
                                                {item.pattern}
                                            </strong>

                                            <span>
                                                {item.jlpt_level ||
                                                    "-"}
                                            </span>
                                        </div>

                                        <p>
                                            {getGrammarMeaning(
                                                item,
                                                language
                                            ) || "Đang cập nhật"}
                                        </p>
                                    </Link>
                                ))
                        )}
                    </>
                )}
            </div>
        </div>
    )
}