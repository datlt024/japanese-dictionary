import { describe, it, expect } from "vitest"
import { getSenseGlosses } from "./getSenseGlosses"

describe("getSenseGlosses", () => {
    it("returns empty array for null", () => {
        expect(getSenseGlosses(null)).toEqual([])
    })

    it("returns empty array for non-array", () => {
        expect(getSenseGlosses("string")).toEqual([])
        expect(getSenseGlosses(42)).toEqual([])
        expect(getSenseGlosses({})).toEqual([])
    })

    it("filters out invalid items", () => {
        const input = [
            { index: 0, meaning: "dog" },
            { index: "0", meaning: "cat" },   // index not a number
            { index: 1 },                       // missing meaning
            null,
            42,
        ]
        const result = getSenseGlosses(input)
        expect(result).toHaveLength(1)
        expect(result[0]).toEqual({ index: 0, meaning: "dog" })
    })

    it("returns valid glosses", () => {
        const input = [
            { index: 0, meaning: "dog" },
            { index: 1, meaning: "canine" },
        ]
        expect(getSenseGlosses(input)).toEqual(input)
    })

    it("returns empty array for empty array", () => {
        expect(getSenseGlosses([])).toEqual([])
    })
})
