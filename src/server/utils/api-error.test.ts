import { describe, it, expect, vi } from "vitest"

vi.mock("next/server", () => ({
    NextResponse: {
        json: (body: unknown, init?: { status?: number }) => ({
            _body: body,
            _status: init?.status ?? 200,
        }),
    },
}))

const { serverError } = await import("./api-error")

describe("serverError", () => {
    it("returns HTTP 500", () => {
        const res = serverError(new Error("boom"), "ctx") as { _status: number }
        expect(res._status).toBe(500)
    })

    it("returns Vietnamese error message in body", () => {
        const res = serverError(new Error("any"), "ctx") as { _body: { error: string } }
        expect(typeof res._body.error).toBe("string")
        expect(res._body.error.length).toBeGreaterThan(0)
    })

    it("accepts a plain string error", () => {
        const res = serverError("plain string error", "ctx") as { _status: number }
        expect(res._status).toBe(500)
    })

    it("accepts an arbitrary object error", () => {
        const res = serverError({ code: 42 }, "ctx") as { _status: number }
        expect(res._status).toBe(500)
    })
})
