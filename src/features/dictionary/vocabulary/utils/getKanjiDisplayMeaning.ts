import type {
    VocabularyKanjiDetail,
} from "@/server/services/vocabulary/vocabulary.service"

export function getKanjiDisplayMeaning(
    kanji: VocabularyKanjiDetail,
    language: "vi" | "en"
) {
    if (language === "en") {
        return kanji.meaning_en || kanji.meaning_vi || "-"
    }

    return kanji.meaning_vi || kanji.meaning_en || "-"
}