import { describe, it, expect } from "vitest"
import { createKanjiHref } from "./createKanjiHref"

describe("createKanjiHref", () => {
    it("builds a basic href with required params", () => {
        const href = createKanjiHref("日", "日本語", "vi", false)
        expect(href).toContain("/kanji/%E6%97%A5")
        expect(href).toContain("q=%E6%97%A5%E6%9C%AC%E8%AA%9E")
        expect(href).toContain("lang=vi")
    })

    it("adds embedded param when embedded is true", () => {
        const href = createKanjiHref("日", "日本語", "vi", true)
        expect(href).toContain("embedded=1")
    })

    it("does not include embedded param when false", () => {
        const href = createKanjiHref("日", "日本語", "vi", false)
        expect(href).not.toContain("embedded")
    })

    it("uses en language correctly", () => {
        const href = createKanjiHref("水", "水", "en", false)
        expect(href).toContain("lang=en")
    })

    it("encodes special characters in kanji path", () => {
        const href = createKanjiHref("語", "語", "vi", false)
        expect(href.startsWith("/kanji/")).toBe(true)
    })
})
