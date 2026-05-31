"use client"

import Link from "next/link"

import "./SearchHubDropdown.css"

import { SearchTab } from "@/components/layout/TopSearchBar"

import {
    SearchHubResult,
    SearchVocabulary,
    SearchKanji,
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
function sortVocabularies(
    items: SearchVocabulary[],
    keyword: string
) {
    const searchText = keyword.trim().toLowerCase()

    const getScore = (item: SearchVocabulary) => {
        const word = item.word.toLowerCase()
        const kana = (item.kana || "").toLowerCase()
        const meaning = getVocabularyMeaning(item).toLowerCase()

        if (word === searchText && item.word.length === 1) {
            return 0
        }
        if (word === searchText) return 1
        if (kana === searchText) return 2

        if (item.is_common && word.startsWith(searchText)) return 3
        if (item.is_common && kana.startsWith(searchText)) return 4

        if (word.startsWith(searchText)) return 5
        if (kana.startsWith(searchText)) return 6

        if (item.is_common && word.includes(searchText)) return 7
        if (item.is_common && kana.includes(searchText)) return 8

        if (word.includes(searchText)) return 9
        if (kana.includes(searchText)) return 10
        if (meaning.includes(searchText)) return 11

        return 99
    }

    return [...items].sort((a, b) => getScore(a) - getScore(b))
}

export default function SearchHubDropdown({
    result,
    keyword,
    loading,
    activeTab,
}: Props) {
    const hasKeyword = keyword.trim().length > 0

    if (!hasKeyword) {
        return null
    }

    const shouldShowDropdown =
        activeTab === "vocabulary" ||
        activeTab === "kanji" ||
        activeTab === "grammar"

    if (!shouldShowDropdown) {
        return null
    }

    return (
        <div className="search-hub-dropdown">
            {loading && (
                <div className="search-hub-loading">
                    Đang tìm kiếm...
                </div>
            )}

            <div className="search-hub-content">
                {activeTab === "vocabulary" && (
                    <>
                        {result.vocabularies.length === 0 && !loading ? (
                            <p className="search-hub-empty">
                                Không tìm thấy từ vựng.
                            </p>
                        ) : (
                            sortVocabularies(result.vocabularies, keyword)
                                .slice(0, 10)
                                .map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/vocabulary/${item.id}`}
                                        className="search-hub-item"
                                    >
                                        <div>
                                            <strong>{item.word}</strong>
                                            <span>{item.kana || "-"}</span>
                                        </div>

                                        <p>{getVocabularyMeaning(item)}</p>
                                    </Link>
                                ))
                        )}
                    </>
                )}

                {activeTab === "kanji" && (
                    <>
                        {result.kanjis.length === 0 && !loading ? (
                            <p className="search-hub-empty">
                                Không tìm thấy Hán tự.
                            </p>
                        ) : (
                            result.kanjis.map((item: SearchKanji) => (
                                <Link
                                    key={item.id}
                                    href={`/kanji/${item.kanji}`}
                                    className="search-hub-kanji"
                                >
                                    <strong>{item.kanji}</strong>

                                    <div>
                                        <p>{item.meaning || "-"}</p>

                                        <span>
                                            On: {item.onyomi || "-"} / Kun:{" "}
                                            {item.kunyomi || "-"}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </>
                )}

                {activeTab === "grammar" && (
                    <p className="search-hub-empty">
                        Gợi ý ngữ pháp sẽ cập nhật sau.
                    </p>
                )}
            </div>
        </div>
    )
}