import type {
    VocabularyKanjiDetail,
} from "@/server/services/vocabulary/vocabulary.service"

export function getKanjiStrokeCount(kanji: VocabularyKanjiDetail) {
    return (
        (kanji as { stroke_count?: number | null }).stroke_count ||
        (kanji as { strokes?: number | null }).strokes ||
        null
    )
}