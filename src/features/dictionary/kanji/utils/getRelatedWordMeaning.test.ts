import { describe, it, expect } from "vitest"
import { getRelatedWordMeaning } from "./getRelatedWordMeaning"
import type { KanjiRelatedWord } from "@/domain/kanji"

function makeWord(meaning_vi: string | null, meaning_en: string | null): KanjiRelatedWord {
    return { id: 1, word: "日本語", kana: "にほんご", meaning_vi, meaning_en }
}

describe("getRelatedWordMeaning", () => {
    it("returns meaning_vi when available", () => {
        expect(getRelatedWordMeaning(makeWord("tiếng Nhật", "Japanese"))).toBe("tiếng Nhật")
    })

    it("falls back to meaning_en when meaning_vi is null", () => {
        expect(getRelatedWordMeaning(makeWord(null, "Japanese"))).toBe("Japanese")
    })

    it("returns empty string when both are null", () => {
        expect(getRelatedWordMeaning(makeWord(null, null))).toBe("")
    })

    it("prefers meaning_vi over meaning_en when both are present", () => {
        expect(getRelatedWordMeaning(makeWord("tiếng Nhật", "Japanese language"))).toBe("tiếng Nhật")
    })
})
