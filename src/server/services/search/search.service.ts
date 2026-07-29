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
import { tryRomajiToHiragana } from "@/shared/utils/japanese"

function createEmptySearchResult(): SearchResult {
    return {
        vocabularies: [],
        kanjis: [],
        grammars: [],
        examples: [],
    }
}

function normalizeSearchKeyword(keyword: string): string {
    const trimmed = keyword.trim()
    // If input is pure ASCII (romaji), try converting to hiragana for Japanese search
    if (!/[぀-ヿ一-龯]/.test(trimmed)) {
        const hiragana = tryRomajiToHiragana(trimmed)
        if (hiragana) return hiragana
    }
    return trimmed
}

function logSearchError(label: string, error: unknown) {
    const e = error as Record<string, unknown>
    console.error(label, e?.message ?? String(error), {
        code: e?.code,
        details: e?.details,
        hint: e?.hint,
    })
}

async function searchVocabularyResult(
    keyword: string,
    language: DictionaryLanguage
): Promise<VocabularyResult[]> {
    try {
        const { data, error } = await searchVocabulariesByKeyword(
            keyword,
            language
        )

        if (error) {
            logSearchError("Vocabulary search error:", error)
            return []
        }

        return (data ?? []) as VocabularyResult[]
    } catch (err) {
        logSearchError("Vocabulary search exception:", err)
        return []
    }
}

async function searchKanjiResult(
    keyword: string
): Promise<KanjiSearchItem[]> {
    try {
        const { data, error } = await searchKanjiByKeyword(keyword)

        if (error) {
            logSearchError("Kanji search error:", error)
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
            logSearchError("Kanji batch search error:", batchError)
            return []
        }

        return (batchData || []) as KanjiSearchItem[]
    } catch (err) {
        logSearchError("Kanji search exception:", err)
        return []
    }
}

async function searchGrammarResult(
    keyword: string,
): Promise<GrammarSearchItem[]> {
    try {
        const { data, error } = await searchGrammarsByKeyword(keyword)

        if (error) {
            logSearchError("Grammar search error:", error)
            return []
        }

        return (data ?? []) as GrammarSearchItem[]
    } catch (err) {
        logSearchError("Grammar search exception:", err)
        return []
    }
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
