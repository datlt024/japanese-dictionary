import type { Kanji } from "../types/kanji.types"

export function getKanjiMeaning(kanji: Kanji) {
    return kanji.meaning_vi || kanji.meaning_en || "-"
}