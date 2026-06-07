import type { Kanji } from "@/domain/kanji/kanji.type"

export function getKanjiMeaning(kanji: Kanji) {
    return kanji.meaning_vi || kanji.meaning_en || "-"
}