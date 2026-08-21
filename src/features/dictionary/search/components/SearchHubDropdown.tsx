"use client"

import { useMemo, forwardRef } from "react"
import Link from "next/link"

import styles from "./SearchHubDropdown.module.css"

import type { DictionaryLanguage } from "@/shared/types/dictionaryLanguage"

import type {
    SearchGrammar,
    SearchHubResult,
    SearchTab,
    SearchVocabulary,
} from "@/features/dictionary/search/hooks/useSearchHub"

type Props = {
    result: SearchHubResult
    keyword: string
    loading: boolean
    error?: unknown
    activeTab: SearchTab
    language: DictionaryLanguage
    disabled?: boolean
}

const MAX_DROPDOWN_ITEMS = 10

function getSafeText(value: string | null | undefined) {
    return value || ""
}

function getVocabularyMeaning(
    item: SearchVocabulary,
    language: DictionaryLanguage
) {
    if (language === "en") {
        return item.meaning_en || item.meaning_vi || item.meaning || ""
    }

    return item.meaning_vi || item.meaning_en || item.meaning || ""
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

function uniqueByKey<T>(
    items: T[],
    getKey: (item: T) => string | number
) {
    const map = new Map<string | number, T>()

    for (const item of items) {
        const key = getKey(item)

        if (!map.has(key)) {
            map.set(key, item)
        }
    }

    return Array.from(map.values())
}

function sortVocabularies(
    items: SearchVocabulary[],
    keyword: string,
    language: DictionaryLanguage
) {
    const searchText = keyword.trim().toLowerCase()

    const getScore = (item: SearchVocabulary) => {
        const word = getSafeText(item.word).toLowerCase()

        const kana = Array.isArray(item.kana)
            ? item.kana.join(" ").toLowerCase()
            : getSafeText(item.kana).toLowerCase()

        const meaning = getVocabularyMeaning(
            item,
            language
        ).toLowerCase()

        if (word === searchText && word.length === 1) {
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
        const pattern = getSafeText(item.pattern).toLowerCase()
        const reading = getSafeText(item.reading).toLowerCase()
        const meaning = getGrammarMeaning(
            item,
            language
        ).toLowerCase()

        if (pattern === searchText) return 0
        if (reading === searchText) return 1
        if (pattern.includes(searchText)) return 2
        if (reading.includes(searchText)) return 3
        if (meaning.includes(searchText)) return 4

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

const SearchHubDropdown = forwardRef<HTMLDivElement, Props>(function SearchHubDropdown({
    result,
    keyword,
    loading,
    error,
    activeTab,
    language,
    disabled = false,
}, ref) {
    const cleanKeyword = keyword.trim()

    const shouldShowDropdown =
        Boolean(cleanKeyword) &&
        (activeTab === "vocabulary" ||
            activeTab === "kanji" ||
            activeTab === "grammar")

    const sortedVocabularies = useMemo(() => {
        if (
            disabled ||
            !shouldShowDropdown ||
            activeTab !== "vocabulary"
        ) {
            return []
        }

        return uniqueByKey(
            sortVocabularies(
                result.vocabularies,
                cleanKeyword,
                language
            ),
            (item) => item.id
        ).slice(0, MAX_DROPDOWN_ITEMS)
    }, [
        disabled,
        shouldShowDropdown,
        activeTab,
        result.vocabularies,
        cleanKeyword,
        language,
    ])

    const sortedGrammars = useMemo(() => {
        if (
            disabled ||
            !shouldShowDropdown ||
            activeTab !== "grammar"
        ) {
            return []
        }

        return uniqueByKey(
            sortGrammars(
                result.grammars,
                cleanKeyword,
                language
            ),
            (item) => item.id
        ).slice(0, MAX_DROPDOWN_ITEMS)
    }, [
        disabled,
        shouldShowDropdown,
        activeTab,
        result.grammars,
        cleanKeyword,
        language,
    ])

    const kanjiOptions = useMemo(() => {
        if (
            disabled ||
            !shouldShowDropdown ||
            activeTab !== "kanji"
        ) {
            return []
        }

        return Array.from(new Set(extractKanjis(cleanKeyword)))
    }, [
        disabled,
        shouldShowDropdown,
        activeTab,
        cleanKeyword,
    ])

    const kanjiResults = useMemo(() => {
        if (
            disabled ||
            !shouldShowDropdown ||
            activeTab !== "kanji"
        ) {
            return []
        }

        return uniqueByKey(
            result.kanjis,
            (item) => item.kanji
        ).slice(0, MAX_DROPDOWN_ITEMS)
    }, [
        disabled,
        shouldShowDropdown,
        activeTab,
        result.kanjis,
    ])

    if (disabled || !shouldShowDropdown) {
        return null
    }

    return (
        <div ref={ref} className={styles.searchHubDropdown} role="menu" aria-label="Gợi ý tìm kiếm">
            <div className={styles.searchHubContent} aria-live="polite" aria-atomic="false">
                {error && !loading && (
                    <p className={styles.searchHubError} role="alert">
                        Không thể tìm kiếm. Vui lòng thử lại.
                    </p>
                )}
                {activeTab === "vocabulary" && (
                    <>
                        {loading && sortedVocabularies.length === 0 ? (
                            <p className={styles.searchHubEmpty}>
                                Đang tìm kiếm...
                            </p>
                        ) : sortedVocabularies.length === 0 ? (
                            <p className={styles.searchHubEmpty}>
                                Không tìm thấy từ vựng.
                            </p>
                        ) : (
                            sortedVocabularies.map((item) => (
                                <Link
                                    key={`vocabulary-${item.id}`}
                                    href={`/vocabulary/${item.id}?lang=${encodeURIComponent(
                                        language
                                    )}`}
                                    role="menuitem"
                                    className={styles.searchHubItem}
                                >
                                    <div>
                                        <strong>{item.word}</strong>

                                        <span>
                                            {getVocabularyKana(item)}
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
                            loading && !kanjiResults.some((r) => kanjiOptions.includes(r.kanji)) ? (
                                <p className={styles.searchHubEmpty}>
                                    Đang tìm kiếm...
                                </p>
                            ) : (
                                kanjiOptions.map((char) => {
                                    const matched = kanjiResults.find(
                                        (r) => r.kanji === char
                                    )
                                    return (
                                        <Link
                                            key={`kanji-option-${char}`}
                                            href={`/kanji/${encodeURIComponent(
                                                char
                                            )}?q=${encodeURIComponent(
                                                cleanKeyword
                                            )}&lang=${encodeURIComponent(
                                                language
                                            )}`}
                                            className={styles.searchHubKanji}
                                        >
                                            <strong>{char}</strong>

                                            {matched?.han_viet && (
                                                <div>
                                                    <p>{matched.han_viet}</p>
                                                </div>
                                            )}
                                        </Link>
                                    )
                                })
                            )
                        ) : loading && kanjiResults.length === 0 ? (
                            <p className={styles.searchHubEmpty}>
                                Đang tìm kiếm...
                            </p>
                        ) : kanjiResults.length === 0 ? (
                            <p className={styles.searchHubEmpty}>
                                Không tìm thấy Hán tự.
                            </p>
                        ) : (
                            kanjiResults.map((item) => (
                                <Link
                                    key={`kanji-${item.kanji}`}
                                    href={`/kanji/${encodeURIComponent(
                                        item.kanji
                                    )}?q=${encodeURIComponent(
                                        cleanKeyword
                                    )}&lang=${encodeURIComponent(
                                        language
                                    )}`}
                                    className={styles.searchHubKanji}
                                >
                                    <strong>{item.kanji}</strong>

                                    {item.han_viet && (
                                        <div>
                                            <p>{item.han_viet}</p>
                                        </div>
                                    )}
                                </Link>
                            ))
                        )}
                    </>
                )}

                {activeTab === "grammar" && (
                    <>
                        {loading && sortedGrammars.length === 0 ? (
                            <p className={styles.searchHubEmpty}>
                                Đang tìm kiếm...
                            </p>
                        ) : sortedGrammars.length === 0 ? (
                            <p className={styles.searchHubEmpty}>
                                Không tìm thấy ngữ pháp.
                            </p>
                        ) : (
                            sortedGrammars.map((item) => (
                                <Link
                                    key={`grammar-${item.id}`}
                                    href={`/grammar/${item.id}?q=${encodeURIComponent(
                                        cleanKeyword
                                    )}&lang=${encodeURIComponent(
                                        language
                                    )}`}
                                    role="menuitem"
                                    className={styles.searchHubItem}
                                >
                                    <div>
                                        <strong>{item.display_pattern ?? item.pattern}</strong>

                                        <span>
                                            {item.jlpt_level || "-"}
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
})

export default SearchHubDropdown