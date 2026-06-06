import type { KanjiRelatedWord } from "@/domain/kanji"

export function getRelatedWordMeaning(
    word: KanjiRelatedWord
) {
    return word.meaning_vi || word.meaning_en || ""
}