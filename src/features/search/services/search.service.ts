import type {
    GrammarSearchItem,
    KanjiSearchItem,
    SearchResult,
    SearchTab,
    VocabularyResult,
} from "../types"

import {
    searchGrammarsByKeyword,
    searchKanjiByKeyword,
    searchVocabulariesByKeyword,
} from "../repositories/search.repository"

function createEmptySearchResult(): SearchResult {
    return {
        vocabularies: [],
        kanjis: [],
        grammars: [],
        examples: [],
    }
}

function uniqueById<T extends { id: number }>(items: T[]) {
    return Array.from(
        new Map(items.map((item) => [item.id, item])).values()
    )
}

function normalizeKeyword(keyword: string) {
    return keyword.trim()
}

export async function searchDictionary(
    keyword: string,
    tab: SearchTab
): Promise<SearchResult> {
    const normalizedKeyword = normalizeKeyword(keyword)

    if (!normalizedKeyword) {
        return createEmptySearchResult()
    }

    const result = createEmptySearchResult()

    if (tab === "vocabulary" || tab === "all") {
        const { data, error } =
            await searchVocabulariesByKeyword(normalizedKeyword)

        if (error) {
            console.error("Vocabulary search error:", error)
        } else {
            result.vocabularies =
                (data || []) as VocabularyResult[]
        }
    }

    if (tab === "kanji" || tab === "all") {
        const { data, error } =
            await searchKanjiByKeyword(normalizedKeyword)

        if (error) {
            console.error("Kanji search error:", error)
        } else {
            result.kanjis = data
                ? ([data] as KanjiSearchItem[])
                : []
        }
    }

    if (tab === "grammar" || tab === "all") {
        const {
            grammarPatternResult,
            grammarReadingResult,
            grammarMeaningResult,
        } = await searchGrammarsByKeyword(normalizedKeyword)

        result.grammars = uniqueById([
            ...((grammarPatternResult.data || []) as GrammarSearchItem[]),
            ...((grammarReadingResult.data || []) as GrammarSearchItem[]),
            ...((grammarMeaningResult.data || []) as GrammarSearchItem[]),
        ])
    }

    return result
}