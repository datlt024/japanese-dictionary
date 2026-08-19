import { describe, it, expect } from "vitest"
import { normalizeKeyword, escapeLikePattern, katakanaToHiragana } from "./string"

describe("normalizeKeyword", () => {
    it("trims whitespace", () => {
        expect(normalizeKeyword("  hello  ")).toBe("hello")
    })

    it("lowercases the string", () => {
        expect(normalizeKeyword("HELLO")).toBe("hello")
        expect(normalizeKeyword("Hello World")).toBe("hello world")
    })

    it("applies NFC normalization", () => {
        // NFC composed form: é as single code point
        const decomposed = "é" // e + combining acute
        const composed = "é"    // é precomposed
        expect(normalizeKeyword(decomposed)).toBe(composed)
    })

    it("handles empty string", () => {
        expect(normalizeKeyword("")).toBe("")
    })

    it("handles Japanese input unchanged (kanji/kana)", () => {
        expect(normalizeKeyword("日本語")).toBe("日本語")
    })
})

describe("escapeLikePattern", () => {
    it("escapes percent sign", () => {
        expect(escapeLikePattern("50%")).toBe("50\\%")
    })

    it("escapes underscore", () => {
        expect(escapeLikePattern("a_b")).toBe("a\\_b")
    })

    it("escapes backslash", () => {
        expect(escapeLikePattern("a\\b")).toBe("a\\\\b")
    })

    it("leaves normal text unchanged", () => {
        expect(escapeLikePattern("hello")).toBe("hello")
    })

    it("handles Japanese text unchanged", () => {
        expect(escapeLikePattern("日本語")).toBe("日本語")
    })
})

describe("katakanaToHiragana", () => {
    it("converts full katakana string to hiragana", () => {
        expect(katakanaToHiragana("ニホン")).toBe("にほん")
    })

    it("converts individual katakana characters", () => {
        expect(katakanaToHiragana("ア")).toBe("あ")
        expect(katakanaToHiragana("イ")).toBe("い")
        expect(katakanaToHiragana("ウ")).toBe("う")
        expect(katakanaToHiragana("エ")).toBe("え")
        expect(katakanaToHiragana("オ")).toBe("お")
    })

    it("leaves hiragana unchanged", () => {
        expect(katakanaToHiragana("にほん")).toBe("にほん")
    })

    it("leaves kanji unchanged", () => {
        expect(katakanaToHiragana("日本")).toBe("日本")
    })

    it("converts mixed katakana and hiragana", () => {
        expect(katakanaToHiragana("タベる")).toBe("たべる")
    })
})
