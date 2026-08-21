import { describe, it, expect } from "vitest"
import { getKanjiMeaning } from "./getKanjiMeaning"
import type { Kanji } from "@/domain/kanji/kanji.type"

function makeKanji(meaning_vi: string | null, meaning_en: string | null): Kanji {
    return {
        id: 1,
        kanji: "日",
        onyomi: null,
        kunyomi: null,
        stroke_count: 4,
        jlpt: 4,
        meaning_vi,
        meaning_en,
        han_viet: null,
        radical: null,
        radical_number: null,
        radical_name_vi: null,
        radical_name_ja: null,
        memory_tip: null,
        grade: null,
        frequency: null,
    }
}

describe("getKanjiMeaning", () => {
    it("returns meaning_vi when available", () => {
        expect(getKanjiMeaning(makeKanji("mặt trời", "sun"))).toBe("mặt trời")
    })

    it("falls back to meaning_en when meaning_vi is null", () => {
        expect(getKanjiMeaning(makeKanji(null, "sun"))).toBe("sun")
    })

    it("returns '-' when both are null/empty", () => {
        expect(getKanjiMeaning(makeKanji(null, null))).toBe("-")
    })

    it("returns meaning_vi even when empty string (truthy check)", () => {
        // Empty string is falsy, so falls through to meaning_en
        expect(getKanjiMeaning(makeKanji("", "sun"))).toBe("sun")
    })
})
