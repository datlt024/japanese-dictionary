import type { VocabularyKanjiDetail } from "@/domain/vocabulary"

export function getKanjiStrokeCount(kanji: VocabularyKanjiDetail) {
    return kanji.stroke_count ?? null
}