import { describe, it, expect } from "vitest"
import { formatMeaningEn, capitalizeFirstLetter } from "./formatMeaning"

describe("formatMeaningEn", () => {
    it("returns empty string for null", () => {
        expect(formatMeaningEn(null)).toBe("")
    })

    it("returns empty string for empty string", () => {
        expect(formatMeaningEn("")).toBe("")
    })

    it("capitalizes single meaning", () => {
        expect(formatMeaningEn("dog")).toBe("Dog")
    })

    it("splits by semicolon and capitalizes each part", () => {
        expect(formatMeaningEn("dog; animal; pet")).toBe("Dog; Animal; Pet")
    })

    it("trims surrounding whitespace from each part", () => {
        expect(formatMeaningEn("  cat  ;  feline  ")).toBe("Cat; Feline")
    })

    it("filters out empty parts after split", () => {
        expect(formatMeaningEn("dog;;cat")).toBe("Dog; Cat")
    })

    it("preserves already capitalized words", () => {
        expect(formatMeaningEn("Japan; country")).toBe("Japan; Country")
    })

    it("handles single-char meaning", () => {
        expect(formatMeaningEn("a")).toBe("A")
    })
})

describe("capitalizeFirstLetter", () => {
    it("returns empty string for empty input", () => {
        expect(capitalizeFirstLetter("")).toBe("")
    })

    it("capitalizes first letter", () => {
        expect(capitalizeFirstLetter("hello")).toBe("Hello")
    })

    it("trims leading whitespace and capitalizes", () => {
        expect(capitalizeFirstLetter("  world")).toBe("World")
    })

    it("does not alter already capitalized string", () => {
        expect(capitalizeFirstLetter("Tokyo")).toBe("Tokyo")
    })

    it("preserves rest of string", () => {
        expect(capitalizeFirstLetter("big city")).toBe("Big city")
    })
})
