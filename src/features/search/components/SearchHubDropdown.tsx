"use client"

import Link from "next/link"

import "./SearchHubDropdown.css"

import { SearchTab } from "@/features/search/hooks/useSearchHub"

import {
    SearchHubResult,
    SearchVocabulary,
    SearchKanji,
    SearchGrammar,
} from "@/features/search/hooks/useSearchHub"

type Props = {
    result: SearchHubResult
    keyword: string
    loading: boolean
    activeTab: SearchTab
}

function getVocabularyMeaning(item: SearchVocabulary) {
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

function getGrammarMeaning(item: SearchGrammar) {
    return item.meaning_vi || item.meaning_en || ""
}

function sortVocabularies(
    items: SearchVocabulary[],
    keyword: string
) {
    const searchText = keyword.trim().toLowerCase()

    const getScore = (item: SearchVocabulary) => {
        const word = item.word.toLowerCase()

        const kana = Array.isArray(item.kana)
            ? item.kana.join(" ").toLowerCase()
            : (item.kana || "").toLowerCase()

        const meaning = getVocabularyMeaning(item).toLowerCase()

        if (word === searchText && item.word.length === 1)
            return 0

        if (word === searchText) return 1
        if (kana === searchText) return 2

        if (
            item.is_common &&
            word.startsWith(searchText)
        )
            return 3

        if (
            item.is_common &&
            kana.startsWith(searchText)
        )
            return 4

        if (word.startsWith(searchText)) return 5
        if (kana.startsWith(searchText)) return 6

        if (
            item.is_common &&
            word.includes(searchText)
        )
            return 7

        if (
            item.is_common &&
            kana.includes(searchText)
        )
            return 8

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
    keyword: string
) {
    const searchText = keyword.trim().toLowerCase()

    const getScore = (item: SearchGrammar) => {
        const pattern = item.pattern.toLowerCase()

        const meaning = getGrammarMeaning(
            item
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
        <div className="search-hub-dropdown">


            <div className="search-hub-content">
                {activeTab === "vocabulary" && (
                    <>
                        {result.vocabularies.length === 0 &&
                            !loading ? (
                            <p className="search-hub-empty">
                                Không tìm thấy từ vựng.
                            </p>
                        ) : (
                            sortVocabularies(
                                result.vocabularies,
                                cleanKeyword
                            )
                                .slice(0, 10)
                                .map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/vocabulary/${item.id}`}
                                        className="search-hub-item"
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
                                                item
                                            )}
                                        </p>
                                    </Link>
                                ))
                        )}
                    </>
                )}

                {activeTab === "kanji" && (
                    <>
                        {kanjiOptions.length > 0 ? (
                            kanjiOptions.map((item) => (
                                <Link
                                    key={item}
                                    href={`/kanji/${encodeURIComponent(
                                        item
                                    )}?q=${encodeURIComponent(
                                        cleanKeyword
                                    )}`}
                                    className="search-hub-kanji"
                                >
                                    <strong>{item}</strong>
                                </Link>
                            ))
                        ) : result.kanjis.length === 0 &&
                            !loading ? (
                            <p className="search-hub-empty">
                                Không tìm thấy Hán tự.
                            </p>
                        ) : (
                            result.kanjis.map(
                                (item: SearchKanji) => (
                                    <Link
                                        key={item.id}
                                        href={`/kanji/${encodeURIComponent(
                                            item.kanji
                                        )}?q=${encodeURIComponent(
                                            cleanKeyword
                                        )}`}
                                        className="search-hub-kanji"
                                    >
                                        <strong>
                                            {item.kanji}
                                        </strong>

                                        <div>
                                            <p>
                                                {item.meaning ||
                                                    "-"}
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
                            <p className="search-hub-empty">
                                Không tìm thấy ngữ pháp.
                            </p>
                        ) : (
                            sortGrammars(
                                result.grammars,
                                cleanKeyword
                            )
                                .slice(0, 10)
                                .map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/grammar/${item.id}?q=${encodeURIComponent(
                                            cleanKeyword
                                        )}`}
                                        className="search-hub-item"
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
                                                item
                                            )}
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