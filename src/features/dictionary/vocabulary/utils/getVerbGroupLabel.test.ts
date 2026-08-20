import { describe, it, expect } from "vitest"
import { getVerbGroupLabel } from "./getVerbGroupLabel"

describe("getVerbGroupLabel", () => {
    it("returns group 1 label for group_1", () => {
        const label = getVerbGroupLabel("group_1")
        expect(label).toContain("nhóm 1")
        expect(label).toContain("五段動詞")
    })

    it("returns group 2 label for group_2", () => {
        const label = getVerbGroupLabel("group_2")
        expect(label).toContain("nhóm 2")
        expect(label).toContain("一段動詞")
    })

    it("returns group 3 label for group_3", () => {
        const label = getVerbGroupLabel("group_3")
        expect(label).toContain("nhóm 3")
        expect(label).toContain("不規則動詞")
    })

    it("returns null for null input", () => {
        expect(getVerbGroupLabel(null)).toBeNull()
    })

    it("returns null for unknown group", () => {
        expect(getVerbGroupLabel("group_4")).toBeNull()
        expect(getVerbGroupLabel("")).toBeNull()
    })
})
