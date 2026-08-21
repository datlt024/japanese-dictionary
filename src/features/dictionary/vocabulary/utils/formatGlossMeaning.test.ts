import { describe, it, expect } from "vitest"
import { formatGlossMeaning } from "./formatGlossMeaning"

describe("formatGlossMeaning", () => {
    it("capitalizes the first letter", () => {
        expect(formatGlossMeaning("dog")).toBe("Dog")
    })

    it("trims leading whitespace before capitalizing", () => {
        expect(formatGlossMeaning("  cat")).toBe("Cat")
    })

    it("trims trailing whitespace", () => {
        expect(formatGlossMeaning("dog  ")).toBe("Dog")
    })

    it("handles already capitalized text", () => {
        expect(formatGlossMeaning("Japan")).toBe("Japan")
    })

    it("handles empty string", () => {
        expect(formatGlossMeaning("")).toBe("")
    })

    it("handles single character", () => {
        expect(formatGlossMeaning("a")).toBe("A")
    })
})
