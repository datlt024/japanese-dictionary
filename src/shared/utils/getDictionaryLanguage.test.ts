import { describe, it, expect } from "vitest"
import { getDictionaryLanguage } from "./getDictionaryLanguage"

describe("getDictionaryLanguage", () => {
    it("returns 'vi' by default", () => {
        const params = new URLSearchParams()
        expect(getDictionaryLanguage(params)).toBe("vi")
    })

    it("returns 'en' when lang=en", () => {
        const params = new URLSearchParams("lang=en")
        expect(getDictionaryLanguage(params)).toBe("en")
    })

    it("returns 'vi' for unknown lang values", () => {
        expect(getDictionaryLanguage(new URLSearchParams("lang=fr"))).toBe("vi")
        expect(getDictionaryLanguage(new URLSearchParams("lang="))).toBe("vi")
        expect(getDictionaryLanguage(new URLSearchParams("lang=EN"))).toBe("vi")
    })
})
