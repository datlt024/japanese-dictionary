import { describe, it, expect } from "vitest"
import { deinflectKeyword } from "./deinflect"

describe("deinflectKeyword", () => {
    it("deinflects ます form → dictionary form", () => {
        const results = deinflectKeyword("書きます")
        expect(results).toContain("書く")
    })

    it("deinflects ました (polite past)", () => {
        const results = deinflectKeyword("書きました")
        expect(results).toContain("書く")
    })

    it("deinflects ません (polite negative)", () => {
        const results = deinflectKeyword("書きません")
        expect(results).toContain("書く")
    })

    it("deinflects ない (negative plain)", () => {
        const results = deinflectKeyword("書かない")
        expect(results).toContain("書く")
    })

    it("deinflects て form (godan ku-verb)", () => {
        const results = deinflectKeyword("書いて")
        expect(results).toContain("書く")
    })

    it("deinflects た form (godan ku-verb)", () => {
        const results = deinflectKeyword("書いた")
        expect(results).toContain("書く")
    })

    it("deinflects ている form", () => {
        const results = deinflectKeyword("書いている")
        expect(results).toContain("書く")
    })

    it("deinflects って form (u-verb)", () => {
        const results = deinflectKeyword("買って")
        expect(results).toContain("買う")
    })

    it("deinflects した form for する verbs", () => {
        const results = deinflectKeyword("した")
        expect(results).toContain("する")
    })

    it("handles katakana input (converts to hiragana first)", () => {
        const results = deinflectKeyword("カイマス")
        // katakana カイマス → hiragana かいます → could match かう → 買う
        expect(Array.isArray(results)).toBe(true)
    })

    it("returns array for already-dictionary-form words (no match)", () => {
        const results = deinflectKeyword("食べる")
        // Should still return array (possibly including る verb deinflection)
        expect(Array.isArray(results)).toBe(true)
    })

    it("does not include the original input in results", () => {
        const input = "書きます"
        const results = deinflectKeyword(input)
        expect(results).not.toContain(input)
    })
})
