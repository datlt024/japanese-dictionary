import type { VocabularyKanjiDetail } from "@/domain/vocabulary"

export function getKanjiReadingText(kanji: VocabularyKanjiDetail) {
    return [kanji.onyomi, kanji.kunyomi].filter(Boolean).join(" ")
}