import {
    capitalizeFirstLetter,
    formatMeaningEn,
} from "./formatMeaning"

import { formatMeaningVi } from "./formatMeaningVi"
import { getVocabularyMeaning } from "./getVocabularyMeaning"

import type { Vocabulary } from "@/domain/vocabulary/vocabulary.type"

// Strips trailing parenthetical explanations, e.g. "Vị kia (cách nói lịch sự của あの方)" → "Vị kia"
function stripParentheticalExplanation(text: string): string {
    return text.replace(/\s*\([^)]*\)\s*$/, "").trim()
}

export function getHeaderMeaning(
    vocabulary: Vocabulary,
    language: "vi" | "en"
) {
    const displayMeaning = getVocabularyMeaning(vocabulary)

    if (language === "en") {
        return capitalizeFirstLetter(
            formatMeaningEn(vocabulary.senses?.[0]?.meaning_en) ||
            displayMeaning ||
            "Updating..."
        )
    }

    return stripParentheticalExplanation(
        formatMeaningVi(
            vocabulary.senses?.[0]?.meaning_vi ||
            displayMeaning ||
            "Đang cập nhật"
        )
    )
}