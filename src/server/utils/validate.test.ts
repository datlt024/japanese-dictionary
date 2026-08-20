import { describe, it, expect, vi } from "vitest"
import { parseBody } from "./validate"

// Mock NextResponse for tests
vi.mock("next/server", () => ({
    NextResponse: {
        json: (body: unknown, init?: { status?: number }) => ({
            _body: body,
            _status: init?.status ?? 200,
        }),
    },
}))

describe("parseBody", () => {
    describe("required string field", () => {
        const schema = { name: { type: "string" as const, min: 1, max: 200 } }

        it("accepts valid string", () => {
            const result = parseBody({ name: "Test" }, schema)
            expect(result.ok).toBe(true)
            if (result.ok) expect(result.data.name).toBe("Test")
        })

        it("trims whitespace", () => {
            const result = parseBody({ name: "  hello  " }, schema)
            expect(result.ok).toBe(true)
            if (result.ok) expect(result.data.name).toBe("hello")
        })

        it("rejects empty string (after trim, below min)", () => {
            const result = parseBody({ name: "   " }, schema)
            expect(result.ok).toBe(false)
        })

        it("rejects string exceeding max length", () => {
            const result = parseBody({ name: "a".repeat(201) }, schema)
            expect(result.ok).toBe(false)
        })

        it("rejects missing required field", () => {
            const result = parseBody({}, schema)
            expect(result.ok).toBe(false)
        })

        it("rejects non-string value", () => {
            const result = parseBody({ name: 123 }, schema)
            expect(result.ok).toBe(false)
        })
    })

    describe("optional field", () => {
        const schema = {
            name: { type: "string" as const, min: 1 },
            description: { type: "string" as const, optional: true },
        }

        it("accepts body without optional field", () => {
            const result = parseBody({ name: "Test" }, schema)
            expect(result.ok).toBe(true)
        })

        it("accepts body with optional field", () => {
            const result = parseBody({ name: "Test", description: "desc" }, schema)
            expect(result.ok).toBe(true)
            if (result.ok) expect(result.data.description).toBe("desc")
        })
    })

    describe("number field", () => {
        const schema = { count: { type: "number" as const, min: 0, max: 100 } }

        it("accepts valid number", () => {
            const result = parseBody({ count: 5 }, schema)
            expect(result.ok).toBe(true)
            if (result.ok) expect(result.data.count).toBe(5)
        })

        it("rejects out-of-range number", () => {
            const result = parseBody({ count: 101 }, schema)
            expect(result.ok).toBe(false)
        })

        it("rejects string as number", () => {
            const result = parseBody({ count: "5" }, schema)
            expect(result.ok).toBe(false)
        })

        it("rejects NaN", () => {
            const result = parseBody({ count: NaN }, schema)
            expect(result.ok).toBe(false)
        })
    })

    describe("boolean field", () => {
        const schema = { active: { type: "boolean" as const } }

        it("accepts true", () => {
            const result = parseBody({ active: true }, schema)
            expect(result.ok).toBe(true)
        })

        it("accepts false", () => {
            const result = parseBody({ active: false }, schema)
            expect(result.ok).toBe(true)
        })

        it("rejects string 'true'", () => {
            const result = parseBody({ active: "true" }, schema)
            expect(result.ok).toBe(false)
        })
    })

    describe("invalid body types", () => {
        const schema = { name: { type: "string" as const } }

        it("rejects null body", () => {
            const result = parseBody(null, schema)
            expect(result.ok).toBe(false)
        })

        it("rejects array body", () => {
            const result = parseBody([], schema)
            expect(result.ok).toBe(false)
        })

        it("rejects string body", () => {
            const result = parseBody("text", schema)
            expect(result.ok).toBe(false)
        })
    })
})
