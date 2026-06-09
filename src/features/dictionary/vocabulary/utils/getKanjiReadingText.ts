import type {
    VocabularyKanjiDetail,
} from "@/server/services/vocabulary/vocabulary.service"

export function getKanjiReadingText(kanji: VocabularyKanjiDetail) {
    return [kanji.onyomi, kanji.kunyomi].filter(Boolean).join(" ")
}