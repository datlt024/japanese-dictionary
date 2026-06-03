import {
    GrammarSearchItem,
    KanjiSearchItem,
    VocabularyResult,
} from "@/shared/types/database"

import {
    searchGrammarsByKeyword,
    searchKanjiByKeyword,
    searchVocabulariesByKeyword,
} from "../repositories/search.repository"

export type SearchTab =
    | "vocabulary"
    | "kanji"
    | "grammar"
    | "example"
    | "jpjp"
    | "all"

export type SearchResult = {
    vocabularies: VocabularyResult[]
    kanjis: KanjiSearchItem[]
    grammars: GrammarSearchItem[]
    examples: unknown[]
}

const emptySearchResult: SearchResult = {
    vocabularies: [],
    kanjis: [],
    grammars: [],
    examples: [],
}

function uniqueById<T extends { id: number }>(items: T[]) {
    return items.filter(
        (item, index, self) =>
            index === self.findIndex((v) => v.id === item.id)
    )
}

export async function searchDictionary(
    keyword: string,
    tab: SearchTab
): Promise<SearchResult> {
    if (!keyword) {
        return emptySearchResult
    }

    let vocabularies: VocabularyResult[] = []
    let kanjis: KanjiSearchItem[] = []
    let grammars: GrammarSearchItem[] = []

    if (tab === "vocabulary" || tab === "all") {
        const { data, error } =
            await searchVocabulariesByKeyword(keyword)

        if (error) {
            console.error("Vocabulary search error:", error)
        }

        vocabularies = (data || []) as VocabularyResult[]
    }

    if (tab === "kanji" || tab === "all") {
        const { data, error } =
            await searchKanjiByKeyword(keyword)

        if (error) {
            console.error("Kanji search error:", error)
        }

        kanjis = data ? ([data] as KanjiSearchItem[]) : []
    }

    if (tab === "grammar" || tab === "all") {
        const {
            grammarPatternResult,
            grammarReadingResult,
            grammarMeaningResult,
        } = await searchGrammarsByKeyword(keyword)

        grammars = uniqueById([
            ...((grammarPatternResult.data || []) as GrammarSearchItem[]),
            ...((grammarReadingResult.data || []) as GrammarSearchItem[]),
            ...((grammarMeaningResult.data || []) as GrammarSearchItem[]),
        ])
    }

    return {
        vocabularies,
        kanjis,
        grammars,
        examples: [],
    }
}