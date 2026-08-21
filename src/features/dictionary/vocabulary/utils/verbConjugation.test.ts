import { describe, it, expect } from "vitest"
import { conjugateVerb } from "./verbConjugation"

describe("conjugateVerb — group 2 (ichidan)", () => {
    it("conjugates 食べる correctly", () => {
        const result = conjugateVerb("食べる", "group_2")
        const forms = Object.fromEntries(result.map(r => [r.label, r.form]))
        expect(forms["Dạng ます"]).toBe("食べます")
        expect(forms["Dạng phủ định"]).toBe("食べない")
        expect(forms["Dạng て"]).toBe("食べて")
        expect(forms["Dạng quá khứ"]).toBe("食べた")
        expect(forms["Dạng khả năng"]).toBe("食べられる")
        expect(forms["Dạng ý chí"]).toBe("食べよう")
    })

    it("conjugates 見る correctly", () => {
        const result = conjugateVerb("見る", "group_2")
        const forms = Object.fromEntries(result.map(r => [r.label, r.form]))
        expect(forms["Dạng ます"]).toBe("見ます")
        expect(forms["Dạng phủ định"]).toBe("見ない")
        expect(forms["Dạng て"]).toBe("見て")
    })

    it("returns 6 conjugation forms", () => {
        const result = conjugateVerb("起きる", "group_2")
        expect(result).toHaveLength(6)
    })
})

describe("conjugateVerb — group 1 (godan)", () => {
    it("conjugates 書く (ku-verb) correctly", () => {
        const result = conjugateVerb("書く", "group_1")
        const forms = Object.fromEntries(result.map(r => [r.label, r.form]))
        expect(forms["Dạng ます"]).toBe("書きます")
        expect(forms["Dạng phủ định"]).toBe("書かない")
        expect(forms["Dạng て"]).toBe("書いて")
        expect(forms["Dạng quá khứ"]).toBe("書いた")
    })

    it("conjugates 話す (su-verb) correctly", () => {
        const result = conjugateVerb("話す", "group_1")
        const forms = Object.fromEntries(result.map(r => [r.label, r.form]))
        expect(forms["Dạng ます"]).toBe("話します")
        expect(forms["Dạng phủ định"]).toBe("話さない")
        expect(forms["Dạng て"]).toBe("話して")
        expect(forms["Dạng quá khứ"]).toBe("話した")
    })

    it("conjugates 買う (u-verb) correctly", () => {
        const result = conjugateVerb("買う", "group_1")
        const forms = Object.fromEntries(result.map(r => [r.label, r.form]))
        expect(forms["Dạng ます"]).toBe("買います")
        expect(forms["Dạng phủ định"]).toBe("買わない")
        expect(forms["Dạng て"]).toBe("買って")
        expect(forms["Dạng quá khứ"]).toBe("買った")
    })

    it("conjugates 飲む (mu-verb) correctly", () => {
        const result = conjugateVerb("飲む", "group_1")
        const forms = Object.fromEntries(result.map(r => [r.label, r.form]))
        expect(forms["Dạng て"]).toBe("飲んで")
        expect(forms["Dạng quá khứ"]).toBe("飲んだ")
    })
})

describe("conjugateVerb — group 3 (irregular)", () => {
    it("conjugates する correctly", () => {
        const result = conjugateVerb("する", "group_3")
        const forms = Object.fromEntries(result.map(r => [r.label, r.form]))
        expect(forms["Dạng ます"]).toBe("します")
        expect(forms["Dạng phủ định"]).toBe("しない")
        expect(forms["Dạng て"]).toBe("して")
        expect(forms["Dạng quá khứ"]).toBe("した")
        expect(forms["Dạng khả năng"]).toBe("できる")
    })

    it("conjugates 来る correctly", () => {
        const result = conjugateVerb("来る", "group_3")
        const forms = Object.fromEntries(result.map(r => [r.label, r.form]))
        expect(forms["Dạng ます"]).toBe("来ます（きます）")
        expect(forms["Dạng phủ định"]).toBe("来ない（こない）")
    })

    it("conjugates compound verb 勉強する correctly", () => {
        const result = conjugateVerb("勉強する", "group_3")
        const forms = Object.fromEntries(result.map(r => [r.label, r.form]))
        expect(forms["Dạng ます"]).toBe("勉強します")
        expect(forms["Dạng phủ định"]).toBe("勉強しない")
        expect(forms["Dạng て"]).toBe("勉強して")
    })
})

describe("conjugateVerb — godan gu-ending verbs", () => {
    it("conjugates 泳ぐ (gu-verb) て form correctly", () => {
        const result = conjugateVerb("泳ぐ", "group_1")
        const forms = Object.fromEntries(result.map(r => [r.label, r.form]))
        expect(forms["Dạng て"]).toBe("泳いで")
        expect(forms["Dạng quá khứ"]).toBe("泳いだ")
    })

    it("conjugates 急ぐ (gu-verb) correctly", () => {
        const result = conjugateVerb("急ぐ", "group_1")
        const forms = Object.fromEntries(result.map(r => [r.label, r.form]))
        expect(forms["Dạng ます"]).toBe("急ぎます")
        expect(forms["Dạng phủ định"]).toBe("急がない")
        expect(forms["Dạng て"]).toBe("急いで")
        expect(forms["Dạng quá khứ"]).toBe("急いだ")
    })
})

describe("conjugateVerb — godan nu/bu/ru endings", () => {
    it("conjugates 死ぬ (nu-verb) て form correctly", () => {
        const result = conjugateVerb("死ぬ", "group_1")
        const forms = Object.fromEntries(result.map(r => [r.label, r.form]))
        expect(forms["Dạng て"]).toBe("死んで")
        expect(forms["Dạng quá khứ"]).toBe("死んだ")
    })

    it("conjugates 遊ぶ (bu-verb) て form correctly", () => {
        const result = conjugateVerb("遊ぶ", "group_1")
        const forms = Object.fromEntries(result.map(r => [r.label, r.form]))
        expect(forms["Dạng て"]).toBe("遊んで")
        expect(forms["Dạng quá khứ"]).toBe("遊んだ")
    })

    it("conjugates 切る (ru-godan-verb) correctly", () => {
        const result = conjugateVerb("切る", "group_1")
        const forms = Object.fromEntries(result.map(r => [r.label, r.form]))
        expect(forms["Dạng ます"]).toBe("切ります")
        expect(forms["Dạng て"]).toBe("切って")
        expect(forms["Dạng quá khứ"]).toBe("切った")
    })
})

describe("conjugateVerb — edge cases", () => {
    it("returns empty array when verb is empty", () => {
        expect(conjugateVerb("", "group_1")).toEqual([])
    })

    it("returns empty array when group is null", () => {
        expect(conjugateVerb("書く", null)).toEqual([])
    })
})
