import type { Kanji } from "@/domain/kanji/kanji.types"

export function getKanjiMeaning(kanji: Kanji) {
    return kanji.meaning_vi || kanji.meaning_en || "-"
}