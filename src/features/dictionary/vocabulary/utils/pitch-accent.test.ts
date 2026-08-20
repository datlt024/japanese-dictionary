import { describe, it, expect } from "vitest"
import {
    getKanaMorae,
    getPitchAccentType,
    getPitchPattern,
    getPitchAccentLabel,
} from "./pitch-accent"

describe("getKanaMorae", () => {
    it("splits simple kana into single morae", () => {
        expect(getKanaMorae("あいう")).toEqual(["あ", "い", "う"])
    })

    it("attaches small kana to preceding mora", () => {
        expect(getKanaMorae("きょ")).toEqual(["きょ"])
        expect(getKanaMorae("しゃ")).toEqual(["しゃ"])
    })

    it("handles mixed regular and small kana", () => {
        expect(getKanaMorae("きょうと")).toEqual(["きょ", "う", "と"])
    })

    it("handles katakana small kana", () => {
        expect(getKanaMorae("キョ")).toEqual(["キョ"])
    })

    it("counts long vowel mark ー as its own mora", () => {
        expect(getKanaMorae("ラーメン")).toEqual(["ラ", "ー", "メ", "ン"])
    })

    it("returns empty array for empty string", () => {
        expect(getKanaMorae("")).toEqual([])
    })

    it("handles small kana at start (no preceding mora) as standalone", () => {
        expect(getKanaMorae("ゃあ")).toEqual(["ゃ", "あ"])
    })

    it("compound syllable with multiple small kana", () => {
        expect(getKanaMorae("にほんご")).toEqual(["に", "ほ", "ん", "ご"])
    })
})

describe("getPitchAccentType", () => {
    it("returns heiban when pitch is 0", () => {
        expect(getPitchAccentType(0, 3)).toBe("heiban")
        expect(getPitchAccentType(0, 1)).toBe("heiban")
    })

    it("returns atamadaka when pitch is 1", () => {
        expect(getPitchAccentType(1, 3)).toBe("atamadaka")
        expect(getPitchAccentType(1, 5)).toBe("atamadaka")
    })

    it("returns odaka when pitch equals moraeCount", () => {
        expect(getPitchAccentType(3, 3)).toBe("odaka")
        expect(getPitchAccentType(2, 2)).toBe("odaka")
    })

    it("returns odaka when pitch exceeds moraeCount", () => {
        expect(getPitchAccentType(5, 3)).toBe("odaka")
    })

    it("returns nakadaka for middle pitch values", () => {
        expect(getPitchAccentType(2, 4)).toBe("nakadaka")
        expect(getPitchAccentType(3, 5)).toBe("nakadaka")
    })
})

describe("getPitchPattern", () => {
    describe("heiban (pitch=0)", () => {
        it("first mora low, rest high", () => {
            expect(getPitchPattern(0, 3)).toEqual([false, true, true])
        })

        it("single mora stays low", () => {
            expect(getPitchPattern(0, 1)).toEqual([false])
        })
    })

    describe("atamadaka (pitch=1)", () => {
        it("first mora high, rest low", () => {
            expect(getPitchPattern(1, 3)).toEqual([true, false, false])
        })
    })

    describe("nakadaka", () => {
        it("first low, middle high, tail low", () => {
            expect(getPitchPattern(2, 4)).toEqual([false, true, false, false])
            expect(getPitchPattern(3, 5)).toEqual([false, true, true, false, false])
        })
    })

    describe("odaka (pitch = moraeCount)", () => {
        it("first low, rest high", () => {
            expect(getPitchPattern(3, 3)).toEqual([false, true, true])
        })
    })
})

describe("getPitchAccentLabel", () => {
    it("returns Vietnamese label for heiban", () => {
        expect(getPitchAccentLabel("heiban")).toContain("Bằng phẳng")
        expect(getPitchAccentLabel("heiban")).toContain("平板型")
    })

    it("returns label for atamadaka", () => {
        expect(getPitchAccentLabel("atamadaka")).toContain("頭高型")
    })

    it("returns label for nakadaka", () => {
        expect(getPitchAccentLabel("nakadaka")).toContain("中高型")
    })

    it("returns label for odaka", () => {
        expect(getPitchAccentLabel("odaka")).toContain("尾高型")
    })
})
