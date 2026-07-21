import type {
    Kanji,
    KanjiReadingGroup,
} from "@/domain/kanji"

import type { Vocabulary } from "@/domain/vocabulary/vocabulary.type"
import type { VocabularyKanjiDetail } from "@/server/services/vocabulary/vocabulary.service"
import type { DictionaryLanguage } from "@/shared/types/dictionaryLanguage"

export type QuickLookupKanjiTarget = {
    type: "kanji"
    title: string
    kanji: Kanji
    kunyomiGroups: KanjiReadingGroup[]
    onyomiGroups: KanjiReadingGroup[]
    currentKanji: string
    kanjiOptions: string[]
    searchKeyword: string
}

export type QuickLookupTarget =
    | {
        type: "vocabulary"
        title: string
        vocabulary: Vocabulary
        kanjiDetails: VocabularyKanjiDetail[]
        kanjiTargets: QuickLookupKanjiTarget[]
    }
    | QuickLookupKanjiTarget
    | {
        type: "not_found"
        title: string
    }

export async function getQuickLookupTarget(
    text: string,
    language: DictionaryLanguage
): Promise<QuickLookupTarget> {
    const q = text.trim()

    try {
        const response = await fetch(
            `/api/quick-lookup?q=${encodeURIComponent(
                q
            )}&lang=${encodeURIComponent(language)}`
        )

        if (!response.ok) {
            return {
                type: "not_found",
                title: q,
            }
        }

        return (await response.json()) as QuickLookupTarget
    } catch {
        return {
            type: "not_found",
            title: q,
        }
    }
}