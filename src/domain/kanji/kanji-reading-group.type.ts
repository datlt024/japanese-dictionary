import type { KanjiRelatedWord } from "./kanji-related-word.type"

export type KanjiReadingGroup = {
    reading: string
    words: KanjiRelatedWord[]
}