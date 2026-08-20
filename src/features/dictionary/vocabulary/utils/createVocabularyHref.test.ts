import { describe, it, expect } from "vitest"
import { createVocabularyHref } from "./createVocabularyHref"

describe("createVocabularyHref", () => {
    it("builds href with vi language", () => {
        expect(createVocabularyHref(42, "vi", false)).toBe("/vocabulary/42?lang=vi")
    })

    it("builds href with en language", () => {
        expect(createVocabularyHref(99, "en", false)).toBe("/vocabulary/99?lang=en")
    })

    it("includes embedded param when embedded=true", () => {
        const href = createVocabularyHref(7, "vi", true)
        expect(href).toContain("embedded=1")
        expect(href).toContain("lang=vi")
    })

    it("does not include embedded param when embedded=false", () => {
        const href = createVocabularyHref(7, "vi", false)
        expect(href).not.toContain("embedded")
    })

    it("uses given numeric id", () => {
        expect(createVocabularyHref(1000, "en", false)).toContain("/vocabulary/1000")
    })
})
