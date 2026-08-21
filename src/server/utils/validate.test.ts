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

    describe("integer field", () => {
        const schema = { id: { type: "integer" as const, min: 1 } }

        it("accepts positive integer", () => {
            const result = parseBody({ id: 42 }, schema)
            expect(result.ok).toBe(true)
            if (result.ok) expect(result.data.id).toBe(42)
        })

        it("rejects float", () => {
            const result = parseBody({ id: 3.14 }, schema)
            expect(result.ok).toBe(false)
        })

        it("rejects string integer", () => {
            const result = parseBody({ id: "5" }, schema)
            expect(result.ok).toBe(false)
        })

        it("rejects below min", () => {
            const result = parseBody({ id: 0 }, schema)
            expect(result.ok).toBe(false)
        })

        it("accepts optional missing integer", () => {
            const s = { id: { type: "integer" as const, optional: true } }
            const result = parseBody({}, s)
            expect(result.ok).toBe(true)
        })
    })

    describe("enum field", () => {
        const schema = { type: { type: "enum" as const, values: ["vocabulary", "kanji", "grammar"] as const } }

        it("accepts valid enum value", () => {
            const result = parseBody({ type: "kanji" }, schema)
            expect(result.ok).toBe(true)
            if (result.ok) expect(result.data.type).toBe("kanji")
        })

        it("rejects value not in enum", () => {
            const result = parseBody({ type: "invalid" }, schema)
            expect(result.ok).toBe(false)
        })

        it("rejects non-string value", () => {
            const result = parseBody({ type: 123 }, schema)
            expect(result.ok).toBe(false)
        })

        it("is case-sensitive", () => {
            const result = parseBody({ type: "Vocabulary" }, schema)
            expect(result.ok).toBe(false)
        })

        it("accepts optional missing enum", () => {
            const s = { type: { type: "enum" as const, values: ["a", "b"] as const, optional: true } }
            const result = parseBody({}, s)
            expect(result.ok).toBe(true)
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
