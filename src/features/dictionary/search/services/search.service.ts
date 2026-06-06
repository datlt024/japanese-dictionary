import type {
    GrammarSearchItem,
    KanjiSearchItem,
    SearchResult,
    VocabularyResult,
} from "@/domain/search"

import type {
    SearchTabWithAll,
} from "@/shared/constants/search-tabs"

import { searchKanjiByKeyword } from "@/server/repositories/search/kanji-search.repository"
import { searchGrammarsByKeyword } from "@/server/repositories/search/grammar-search.repository"
import { searchVocabulariesByKeyword } from "@/server/repositories/search/vocabulary-search.repository"

import type { DictionaryLanguage } from "@/shared/types/dictionaryLanguage"
import { uniqueById } from "@/shared/utils/array"
import { normalizeKeyword } from "@/shared/utils/string"

function createEmptySearchResult(): SearchResult {
    return {
        vocabularies: [],
        kanjis: [],
        grammars: [],
        examples: [],
    }
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

    return (data || []) as VocabularyResult[]
}

async function searchKanjiResult(
    keyword: string
): Promise<KanjiSearchItem[]> {
    const { data, error } = await searchKanjiByKeyword(keyword)

    if (error) {
        console.error("Kanji search error:", error)
        return []
    }

    return data ? ([data] as KanjiSearchItem[]) : []
}

async function searchGrammarResult(
    keyword: string,
    language: DictionaryLanguage
): Promise<GrammarSearchItem[]> {
    const {
        grammarPatternResult,
        grammarReadingResult,
        grammarMeaningResult,
    } = await searchGrammarsByKeyword(keyword, language)

    if (grammarPatternResult.error) {
        console.error(
            "Grammar pattern search error:",
            grammarPatternResult.error
        )
    }

    if (grammarReadingResult.error) {
        console.error(
            "Grammar reading search error:",
            grammarReadingResult.error
        )
    }

    if (grammarMeaningResult.error) {
        console.error(
            "Grammar meaning search error:",
            grammarMeaningResult.error
        )
    }

    return uniqueById([
        ...((grammarPatternResult.data || []) as GrammarSearchItem[]),
        ...((grammarReadingResult.data || []) as GrammarSearchItem[]),
        ...((grammarMeaningResult.data || []) as GrammarSearchItem[]),
    ])
}

export async function searchDictionary(
    keyword: string,
    tab: SearchTabWithAll,
    language: DictionaryLanguage = "vi"
): Promise<SearchResult> {
    const normalizedKeyword = normalizeKeyword(keyword)

    if (!normalizedKeyword) {
        return createEmptySearchResult()
    }

    if (tab === "vocabulary") {
        return {
            ...createEmptySearchResult(),
            vocabularies: await searchVocabularyResult(
                normalizedKeyword,
                language
            ),
        }
    }

    if (tab === "kanji") {
        return {
            ...createEmptySearchResult(),
            kanjis: await searchKanjiResult(normalizedKeyword),
        }
    }

    if (tab === "grammar") {
        return {
            ...createEmptySearchResult(),
            grammars: await searchGrammarResult(
                normalizedKeyword,
                language
            ),
        }
    }

    if (tab === "all") {
        const [vocabularies, kanjis, grammars] = await Promise.all([
            searchVocabularyResult(normalizedKeyword, language),
            searchKanjiResult(normalizedKeyword),
            searchGrammarResult(normalizedKeyword, language),
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