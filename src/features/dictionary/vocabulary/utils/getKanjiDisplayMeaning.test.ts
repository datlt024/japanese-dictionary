import { describe, it, expect } from "vitest"
import { getKanjiDisplayMeaning } from "./getKanjiDisplayMeaning"

function makeKanji(meaning_vi: string | null, meaning_en: string | null) {
    return { meaning_vi, meaning_en, stroke_count: null } as { meaning_vi: string | null; meaning_en: string | null; stroke_count: number | null }
}

describe("getKanjiDisplayMeaning", () => {
    describe("language=vi", () => {
        it("returns meaning_vi when available", () => {
            expect(getKanjiDisplayMeaning(makeKanji("nước", "water"), "vi")).toBe("nước")
        })

        it("falls back to meaning_en when meaning_vi is null", () => {
            expect(getKanjiDisplayMeaning(makeKanji(null, "water"), "vi")).toBe("water")
        })

        it("returns '-' when both are null", () => {
            expect(getKanjiDisplayMeaning(makeKanji(null, null), "vi")).toBe("-")
        })
    })

    describe("language=en", () => {
        it("returns meaning_en when available", () => {
            expect(getKanjiDisplayMeaning(makeKanji("nước", "water"), "en")).toBe("water")
        })

        it("falls back to meaning_vi when meaning_en is null", () => {
            expect(getKanjiDisplayMeaning(makeKanji("nước", null), "en")).toBe("nước")
        })

        it("returns '-' when both are null", () => {
            expect(getKanjiDisplayMeaning(makeKanji(null, null), "en")).toBe("-")
        })
    })
})
