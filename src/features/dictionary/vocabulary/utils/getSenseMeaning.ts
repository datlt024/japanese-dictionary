import { formatMeaningEn } from "./formatMeaning"

import type { Vocabulary } from "@/domain/vocabulary/vocabulary.type"

type VocabularySense = Vocabulary["senses"][number]

export function getSenseMeaning(
    sense: VocabularySense,
    language: "vi" | "en"
) {
    if (language === "en") {
        return (
            formatMeaningEn(sense.meaning_en) ||
            sense.meaning_vi ||
            "Updating..."
        )
    }

    return (
        sense.meaning_vi ||
        formatMeaningEn(sense.meaning_en) ||
        "Đang cập nhật"
    )
}