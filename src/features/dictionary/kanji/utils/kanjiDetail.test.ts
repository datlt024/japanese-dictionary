import { describe, it, expect } from "vitest"
import { splitKanjiReadings, kanjiJlptToLabel, formatKanjiJlpt, splitMeaningText } from "./kanjiDetail"

describe("splitKanjiReadings", () => {
    it("returns empty array for null", () => {
        expect(splitKanjiReadings(null)).toEqual([])
    })

    it("returns empty array for empty string", () => {
        expect(splitKanjiReadings("")).toEqual([])
    })

    it("splits by Japanese comma 、", () => {
        expect(splitKanjiReadings("あ、い、う")).toEqual(["あ", "い", "う"])
    })

    it("splits by ASCII comma", () => {
        expect(splitKanjiReadings("on,kun,other")).toEqual(["on", "kun", "other"])
    })

    it("splits by semicolon", () => {
        expect(splitKanjiReadings("a;b;c")).toEqual(["a", "b", "c"])
    })

    it("splits by whitespace", () => {
        expect(splitKanjiReadings("あ い う")).toEqual(["あ", "い", "う"])
    })

    it("trims and filters empty parts", () => {
        expect(splitKanjiReadings("  a , , b  ")).toEqual(["a", "b"])
    })

    it("handles single value", () => {
        expect(splitKanjiReadings("おん")).toEqual(["おん"])
    })
})

describe("kanjiJlptToLabel", () => {
    it("returns null for null input", () => {
        expect(kanjiJlptToLabel(null)).toBeNull()
    })

    it("maps 4 → N5 (easiest)", () => {
        expect(kanjiJlptToLabel(4)).toBe("N5")
    })

    it("maps 3 → N4", () => {
        expect(kanjiJlptToLabel(3)).toBe("N4")
    })

    it("maps 2 → N3", () => {
        expect(kanjiJlptToLabel(2)).toBe("N3")
    })

    it("maps 1 → N2 (hardest in KANJIDIC)", () => {
        expect(kanjiJlptToLabel(1)).toBe("N2")
    })

    it("falls back to N{n} for unknown values", () => {
        expect(kanjiJlptToLabel(5)).toBe("N5")
    })
})

describe("formatKanjiJlpt", () => {
    it("returns formatted JLPT string for known level", () => {
        expect(formatKanjiJlpt(4)).toBe("JLPT N5")
        expect(formatKanjiJlpt(1)).toBe("JLPT N2")
    })

    it("returns fallback text for null", () => {
        expect(formatKanjiJlpt(null)).toBe("JLPT không xác định")
    })
})

describe("splitMeaningText", () => {
    it("returns empty array for null", () => {
        expect(splitMeaningText(null)).toEqual([])
    })

    it("returns empty array for empty string", () => {
        expect(splitMeaningText("")).toEqual([])
    })

    it("splits by comma", () => {
        expect(splitMeaningText("water,liquid,fluid")).toEqual(["water", "liquid", "fluid"])
    })

    it("splits by semicolon", () => {
        expect(splitMeaningText("a;b")).toEqual(["a", "b"])
    })

    it("splits by Japanese comma 、", () => {
        expect(splitMeaningText("水、液体")).toEqual(["水", "液体"])
    })

    it("trims whitespace around each part", () => {
        expect(splitMeaningText("  a ,  b  ")).toEqual(["a", "b"])
    })

    it("filters empty parts", () => {
        expect(splitMeaningText("a,,b")).toEqual(["a", "b"])
    })
})
