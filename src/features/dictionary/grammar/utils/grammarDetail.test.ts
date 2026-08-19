import { describe, it, expect } from "vitest"
import { hasItems, splitMeaning, getShortMeaning, getMainMeaning, getExplanation } from "./grammarDetail"
import type { GrammarPoint } from "@/domain/grammar"

function makeGrammar(overrides: Partial<GrammarPoint> = {}): GrammarPoint {
    return {
        id: 1,
        pattern: "〜たい",
        display_pattern: "〜たい",
        reading: "たい",
        jlpt_level: "N5",
        meaning_vi: null,
        meaning_en: null,
        short_meaning_vi: null,
        explanation_vi: null,
        explanation_en: null,
        nuance_vi: null,
        register: null,
        formation: [],
        examples: [],
        senses: [],
        special_cases: [],
        variants: [],
        common_pairs: [],
        short_forms: [],
        similar_grammar: [],
        differences: [],
        notes: [],
        tags: [],
        frequency: null,
        is_common: null,
        ...overrides,
    }
}

describe("hasItems", () => {
    it("returns true for non-empty array", () => {
        expect(hasItems([1, 2, 3])).toBe(true)
    })

    it("returns false for empty array", () => {
        expect(hasItems([])).toBe(false)
    })

    it("returns false for null", () => {
        expect(hasItems(null)).toBe(false)
    })

    it("returns false for undefined", () => {
        expect(hasItems(undefined)).toBe(false)
    })
})

describe("splitMeaning", () => {
    it("splits on semicolons", () => {
        expect(splitMeaning("muốn; ước muốn")).toEqual(["muốn", "ước muốn"])
    })

    it("splits on fullwidth semicolons", () => {
        expect(splitMeaning("muốn；ước muốn")).toEqual(["muốn", "ước muốn"])
    })

    it("trims whitespace from each part", () => {
        expect(splitMeaning("  muốn  ;  ước muốn  ")).toEqual(["muốn", "ước muốn"])
    })

    it("returns empty array for null", () => {
        expect(splitMeaning(null)).toEqual([])
    })

    it("returns single item for string without separator", () => {
        expect(splitMeaning("muốn")).toEqual(["muốn"])
    })

    it("filters out empty strings", () => {
        expect(splitMeaning("muốn;;ước muốn")).toEqual(["muốn", "ước muốn"])
    })
})

describe("getShortMeaning", () => {
    it("prefers short_meaning_vi", () => {
        const grammar = makeGrammar({
            short_meaning_vi: "muốn",
            meaning_vi: "muốn làm",
            meaning_en: "want to do",
        })
        expect(getShortMeaning(grammar)).toBe("muốn")
    })

    it("falls back to meaning_vi when short_meaning_vi is null", () => {
        const grammar = makeGrammar({
            short_meaning_vi: null,
            meaning_vi: "muốn làm",
            meaning_en: "want to do",
        })
        expect(getShortMeaning(grammar)).toBe("muốn làm")
    })

    it("falls back to meaning_en when vi is null", () => {
        const grammar = makeGrammar({
            short_meaning_vi: null,
            meaning_vi: null,
            meaning_en: "want to do",
        })
        expect(getShortMeaning(grammar)).toBe("want to do")
    })

    it("returns default when all null", () => {
        const grammar = makeGrammar({
            short_meaning_vi: null,
            meaning_vi: null,
            meaning_en: null,
        })
        expect(getShortMeaning(grammar)).toBe("Chưa có nghĩa")
    })
})

describe("getMainMeaning", () => {
    it("returns meaning_vi when available", () => {
        const grammar = makeGrammar({ meaning_vi: "muốn làm", meaning_en: "want to do" })
        expect(getMainMeaning(grammar)).toBe("muốn làm")
    })

    it("falls back to meaning_en", () => {
        const grammar = makeGrammar({ meaning_vi: null, meaning_en: "want to do" })
        expect(getMainMeaning(grammar)).toBe("want to do")
    })
})

describe("getExplanation", () => {
    it("returns explanation_vi when available", () => {
        const grammar = makeGrammar({
            explanation_vi: "Dùng để diễn tả mong muốn.",
            explanation_en: "Used to express desire.",
        })
        expect(getExplanation(grammar)).toBe("Dùng để diễn tả mong muốn.")
    })

    it("falls back to explanation_en", () => {
        const grammar = makeGrammar({
            explanation_vi: null,
            explanation_en: "Used to express desire.",
        })
        expect(getExplanation(grammar)).toBe("Used to express desire.")
    })

    it("returns null when both are null", () => {
        const grammar = makeGrammar({ explanation_vi: null, explanation_en: null })
        expect(getExplanation(grammar)).toBeNull()
    })
})
