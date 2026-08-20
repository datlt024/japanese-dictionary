import { describe, it, expect } from "vitest"
import { getSenseMeaning } from "./getSenseMeaning"

function makeSense(meaning_vi: string | null, meaning_en: string | null) {
    return {
        id: 1,
        sense_index: 0,
        meaning_vi,
        meaning_en,
        part_of_speech: null,
        meaning_vi_glosses: null,
    }
}

describe("getSenseMeaning", () => {
    describe("language=vi", () => {
        it("returns meaning_vi when available", () => {
            const sense = makeSense("nước", "water")
            expect(getSenseMeaning(sense, "vi")).toBe("nước")
        })

        it("falls back to formatted meaning_en when meaning_vi is null", () => {
            const sense = makeSense(null, "water; liquid")
            expect(getSenseMeaning(sense, "vi")).toBe("Water; Liquid")
        })

        it("falls back to fallback string when both null", () => {
            const sense = makeSense(null, null)
            expect(getSenseMeaning(sense, "vi")).toBe("Đang cập nhật")
        })

        it("falls back to fallback string when meaning_en is empty", () => {
            const sense = makeSense(null, "")
            expect(getSenseMeaning(sense, "vi")).toBe("Đang cập nhật")
        })
    })

    describe("language=en", () => {
        it("returns formatted meaning_en when available", () => {
            const sense = makeSense("nước", "water; liquid")
            expect(getSenseMeaning(sense, "en")).toBe("Water; Liquid")
        })

        it("falls back to meaning_vi when meaning_en is null", () => {
            const sense = makeSense("nước", null)
            expect(getSenseMeaning(sense, "en")).toBe("nước")
        })

        it("falls back to fallback string when both null", () => {
            const sense = makeSense(null, null)
            expect(getSenseMeaning(sense, "en")).toBe("Updating...")
        })
    })
})
