import { describe, it, expect } from "vitest"
import { formatMeaningVi } from "./formatMeaningVi"

describe("formatMeaningVi", () => {
    it("capitalizes the first letter", () => {
        expect(formatMeaningVi("nước")).toBe("Nước")
    })

    it("trims leading whitespace and capitalizes", () => {
        expect(formatMeaningVi("  nước")).toBe("Nước")
    })

    it("applies dictionary replacement for known phrase", () => {
        expect(formatMeaningVi("sặc sỡ lòe loẹt")).toBe("Sặc sỡ; lòe loẹt")
    })

    it("applies dictionary replacement for second known phrase", () => {
        expect(formatMeaningVi("công khai trắng trợn")).toBe("Công khai; trắng trợn")
    })

    it("does not modify unknown phrases", () => {
        expect(formatMeaningVi("vui vẻ")).toBe("Vui vẻ")
    })

    it("handles already capitalized string", () => {
        expect(formatMeaningVi("Tokyo")).toBe("Tokyo")
    })

    it("preserves trailing content after capitalization", () => {
        expect(formatMeaningVi("chơi đùa")).toBe("Chơi đùa")
    })
})
