import { describe, it, expect } from "vitest"
import { uniqueById, uniqueArray } from "./array"

describe("uniqueById", () => {
    it("removes duplicate ids, keeping last occurrence", () => {
        const items = [
            { id: 1, name: "a" },
            { id: 2, name: "b" },
            { id: 1, name: "a2" },
        ]
        const result = uniqueById(items)
        expect(result).toHaveLength(2)
        expect(result.map((x) => x.id)).toEqual([1, 2])
    })

    it("returns empty array for empty input", () => {
        expect(uniqueById([])).toEqual([])
    })

    it("returns same array when no duplicates", () => {
        const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
        expect(uniqueById(items)).toHaveLength(3)
    })
})

describe("uniqueArray", () => {
    it("removes duplicate primitives", () => {
        expect(uniqueArray([1, 2, 2, 3, 1])).toEqual([1, 2, 3])
    })

    it("handles strings", () => {
        expect(uniqueArray(["a", "b", "a"])).toEqual(["a", "b"])
    })

    it("returns empty array for empty input", () => {
        expect(uniqueArray([])).toEqual([])
    })

    it("preserves order of first occurrence", () => {
        expect(uniqueArray([3, 1, 2, 1, 3])).toEqual([3, 1, 2])
    })
})
