import type {
    GrammarSearchItem,
    KanjiSearchItem,
    SearchResult,
    VocabularyResult,
} from "@/domain/search"

import type {
    SearchTabWithAll,
} from "@/shared/constants/search-tabs"

import type { DictionaryLanguage } from "@/shared/types/dictionaryLanguage"

import { searchKanjiByKeyword } from "@/server/repositories/kanji/search-kanji.repository"
import { searchGrammarsByKeyword } from "@/server/repositories/grammar/search-grammar.repository"
import { searchVocabulariesByKeyword } from "@/server/repositories/vocabulary/search-vocabulary.repository"

function createEmptySearchResult(): SearchResult {
    return {
        vocabularies: [],
        kanjis: [],
        grammars: [],
        examples: [],
    }
}

function normalizeSearchKeyword(keyword: string) {
    return keyword.trim()
}

async function searchVocabularyResult(
    keyword: string,
    language: DictionaryLanguage
): Promise<VocabularyResult[]> {
    const { data, error } = await searchVocabulariesByKeyword(
        keyword,
        language
    )

    if (error) {
        console.error("Vocabulary search error:", error)
        return []
    }

    return (data ?? []) as VocabularyResult[]
}

async function searchKanjiResult(
    keyword: string
): Promise<KanjiSearchItem[]> {
    const { data, error } = await searchKanjiByKeyword(keyword)

    if (error) {
        console.error("Kanji search error:", error)
        return []
    }

    if (!data) {
        return []
    }

    return Array.isArray(data)
        ? data as KanjiSearchItem[]
        : [data] as KanjiSearchItem[]
}

async function searchGrammarResult(
    keyword: string,
    _language: DictionaryLanguage
): Promise<GrammarSearchItem[]> {
    const { data, error } = await searchGrammarsByKeyword(keyword)

    if (error) {
        console.error("Grammar search error:", error)
        return []
    }

    return (data ?? []) as GrammarSearchItem[]
}

export async function searchDictionary(
    keyword: string,
    tab: SearchTabWithAll,
    language: DictionaryLanguage = "vi"
): Promise<SearchResult> {
    const normalizedKeyword = normalizeSearchKeyword(keyword)

    if (!normalizedKeyword) {
        return createEmptySearchResult()
    }

    if (tab === "vocabulary") {
        const vocabularies = await searchVocabularyResult(
            normalizedKeyword,
            language
        )

        return {
            ...createEmptySearchResult(),
            vocabularies,
        }
    }

    if (tab === "kanji") {
        const kanjis = await searchKanjiResult(normalizedKeyword)

        return {
            ...createEmptySearchResult(),
            kanjis,
        }
    }

    if (tab === "grammar") {
        const grammars = await searchGrammarResult(
            normalizedKeyword,
            language
        )

        return {
            ...createEmptySearchResult(),
            grammars,
        }
    }

    if (tab === "all") {
        const [vocabularies, kanjis, grammars] =
            await Promise.all([
                searchVocabularyResult(
                    normalizedKeyword,
                    language
                ),
                searchKanjiResult(normalizedKeyword),
                searchGrammarResult(
                    normalizedKeyword,
                    language
                ),
            ])

        return {
            vocabularies,
            kanjis,
            grammars,
            examples: [],
        }
    }

    return createEmptySearchResult()
}