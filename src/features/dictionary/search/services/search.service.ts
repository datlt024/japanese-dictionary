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

import { getKanjisByCharacters, searchKanjiByKeyword } from "@/server/repositories/kanji/search-kanji.repository"
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

    if (data) {
        return Array.isArray(data)
            ? data as KanjiSearchItem[]
            : [data] as KanjiSearchItem[]
    }

    // keyword is multi-char or single kanji not found — extract individual kanji and batch-lookup
    const chars = Array.from(
        new Set(
            Array.from(keyword.matchAll(/[一-龯]/g)).map((m) => m[0])
        )
    )

    if (chars.length === 0) return []

    const { data: batchData, error: batchError } = await getKanjisByCharacters(chars)

    if (batchError) {
        console.error("Kanji batch search error:", batchError)
        return []
    }

    return (batchData || []) as KanjiSearchItem[]
}

async function searchGrammarResult(
    keyword: string,
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