import { describe, it, expect } from "vitest"
import { extractKanjis } from "./extractKanjis"

describe("extractKanjis", () => {
    it("extracts a single kanji from text", () => {
        expect(extractKanjis("日")).toEqual(["日"])
    })

    it("extracts multiple kanjis", () => {
        expect(extractKanjis("日本語")).toEqual(["日", "本", "語"])
    })

    it("ignores hiragana and katakana", () => {
        expect(extractKanjis("ひらがな")).toEqual([])
        expect(extractKanjis("カタカナ")).toEqual([])
    })

    it("ignores latin characters", () => {
        expect(extractKanjis("hello")).toEqual([])
    })

    it("returns empty array for empty string", () => {
        expect(extractKanjis("")).toEqual([])
    })

    it("extracts kanjis from mixed text", () => {
        expect(extractKanjis("今日は")).toEqual(["今", "日"])
    })

    it("extracts kanjis from sentence with punctuation", () => {
        const result = extractKanjis("東京は大きい。")
        expect(result).toEqual(["東", "京", "大"])
    })
})
