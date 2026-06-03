import type {
    KanjiRelatedWord,
} from "../types"

export function getRelatedWordMeaning(
    word: KanjiRelatedWord
) {
    return word.meaning_vi || word.meaning_en || ""
}