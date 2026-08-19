import { describe, it, expect } from "vitest"
import {
    romajiToHiragana,
    tryRomajiToHiragana,
    isJapaneseKeyword,
    isSingleKanji,
    extractKanjis,
    cleanReading,
} from "./japanese"

describe("romajiToHiragana", () => {
    it("converts basic syllables", () => {
        expect(romajiToHiragana("ka")).toBe("か")
        expect(romajiToHiragana("ki")).toBe("き")
        expect(romajiToHiragana("sa")).toBe("さ")
        expect(romajiToHiragana("ta")).toBe("た")
    })

    it("converts multi-syllable words", () => {
        expect(romajiToHiragana("nihongo")).toBe("にほんご")
        expect(romajiToHiragana("gakkou")).toBe("がっこう")
    })

    it("converts double consonants to っ", () => {
        expect(romajiToHiragana("kitte")).toBe("きって")
        expect(romajiToHiragana("gakkou")).toBe("がっこう")
    })

    it("converts n before consonant to ん", () => {
        expect(romajiToHiragana("honki")).toBe("ほんき")
        expect(romajiToHiragana("sanka")).toBe("さんか")
    })

    it("converts sha/shi/shu/sho", () => {
        // Standard wāpuro: shinbun → しんぶん (n before b converts to ん)
        expect(romajiToHiragana("shinbun")).toBe("しんぶん")
        expect(romajiToHiragana("shashin")).toBe("しゃしん")
    })

    it("converts chi/tsu", () => {
        expect(romajiToHiragana("chichi")).toBe("ちち")
        expect(romajiToHiragana("tsuki")).toBe("つき")
    })

    it("converts nn to ん", () => {
        expect(romajiToHiragana("kinen")).toBe("きねん")
    })
})

describe("tryRomajiToHiragana", () => {
    it("returns null for input shorter than 4 chars", () => {
        expect(tryRomajiToHiragana("ka")).toBeNull()
        expect(tryRomajiToHiragana("sho")).toBeNull()
    })

    it("returns hiragana for valid 4+ char romaji", () => {
        const result = tryRomajiToHiragana("kaku")
        expect(result).toBe("かく")
    })

    it("returns null if not fully convertible", () => {
        // "hello" has 'h' but 'ello' part is not valid Japanese
        expect(tryRomajiToHiragana("hello")).toBeNull()
    })
})

describe("isJapaneseKeyword", () => {
    it("returns true for hiragana", () => {
        expect(isJapaneseKeyword("たべる")).toBe(true)
    })

    it("returns true for katakana", () => {
        expect(isJapaneseKeyword("タベル")).toBe(true)
    })

    it("returns true for kanji", () => {
        expect(isJapaneseKeyword("食べる")).toBe(true)
    })

    it("returns false for ASCII", () => {
        expect(isJapaneseKeyword("hello")).toBe(false)
    })

    it("returns false for numbers", () => {
        expect(isJapaneseKeyword("12345")).toBe(false)
    })
})

describe("isSingleKanji", () => {
    it("returns true for a single kanji", () => {
        expect(isSingleKanji("日")).toBe(true)
        expect(isSingleKanji("本")).toBe(true)
    })

    it("returns false for multiple kanji", () => {
        expect(isSingleKanji("日本")).toBe(false)
    })

    it("returns false for hiragana", () => {
        expect(isSingleKanji("の")).toBe(false)
    })
})

describe("extractKanjis", () => {
    it("extracts kanji from mixed text", () => {
        expect(extractKanjis("日本語")).toEqual(["日", "本", "語"])
    })

    it("returns empty array for no kanji", () => {
        expect(extractKanjis("ひらがな")).toEqual([])
    })

    it("extracts only kanji, ignoring kana", () => {
        expect(extractKanjis("食べる")).toEqual(["食"])
    })
})

describe("cleanReading", () => {
    it("removes dots from katakana reading", () => {
        // cleanReading removes dots, dashes and converts katakana → hiragana
        expect(cleanReading("ニ.ホ.ン")).toBe("にほん")
    })

    it("converts katakana to hiragana", () => {
        expect(cleanReading("ニホン")).toBe("にほん")
    })

    it("trims whitespace", () => {
        expect(cleanReading("  にほん  ")).toBe("にほん")
    })

    it("removes dashes from reading", () => {
        expect(cleanReading("カタカ-ナ")).toBe("かたかな")
    })
})
