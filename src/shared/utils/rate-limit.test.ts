import { describe, it, expect, vi } from "vitest"
import { checkRateLimit, getClientIp } from "./rate-limit"

// Mock NextResponse
vi.mock("next/server", () => ({
    NextResponse: {
        json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
            _body: body,
            _status: init?.status ?? 200,
            _headers: init?.headers ?? {},
        }),
    },
}))

// Access the private store to reset between tests
// We'll use a different key prefix per test to avoid cross-test contamination
let keyCounter = 0
function uniqueKey(prefix: string) {
    return `${prefix}:${++keyCounter}:${Date.now()}`
}

describe("checkRateLimit", () => {
    it("allows first request", () => {
        const result = checkRateLimit(uniqueKey("test"), 5, 60_000)
        expect(result.ok).toBe(true)
        expect(result.remaining).toBe(4)
    })

    it("allows requests up to the limit", () => {
        const key = uniqueKey("burst")
        for (let i = 0; i < 5; i++) {
            const r = checkRateLimit(key, 5, 60_000)
            expect(r.ok).toBe(true)
        }
    })

    it("blocks request exceeding the limit", () => {
        const key = uniqueKey("over")
        for (let i = 0; i < 5; i++) checkRateLimit(key, 5, 60_000)
        const result = checkRateLimit(key, 5, 60_000)
        expect(result.ok).toBe(false)
        expect(result.remaining).toBe(0)
    })

    it("resets after window expires", () => {
        vi.useFakeTimers()
        const key = uniqueKey("window")

        // Exhaust the limit
        for (let i = 0; i < 5; i++) checkRateLimit(key, 5, 1_000)
        expect(checkRateLimit(key, 5, 1_000).ok).toBe(false)

        // Advance past the window
        vi.advanceTimersByTime(1_100)

        // Should be allowed again
        expect(checkRateLimit(key, 5, 1_000).ok).toBe(true)
        vi.useRealTimers()
    })

    it("returns correct remaining count", () => {
        const key = uniqueKey("remaining")
        const r1 = checkRateLimit(key, 10, 60_000)
        expect(r1.remaining).toBe(9)
        const r2 = checkRateLimit(key, 10, 60_000)
        expect(r2.remaining).toBe(8)
    })

    it("returns a future resetAt timestamp", () => {
        const before = Date.now()
        const result = checkRateLimit(uniqueKey("ts"), 5, 60_000)
        expect(result.resetAt).toBeGreaterThan(before)
        expect(result.resetAt).toBeLessThanOrEqual(before + 60_000 + 50)
    })
})

describe("getClientIp", () => {
    function makeRequest(headers: Record<string, string>): Request {
        return new Request("https://example.com", { headers })
    }

    it("returns x-real-ip when present", () => {
        const req = makeRequest({ "x-real-ip": "1.2.3.4" })
        expect(getClientIp(req)).toBe("1.2.3.4")
    })

    it("returns last x-forwarded-for entry", () => {
        const req = makeRequest({ "x-forwarded-for": "1.1.1.1, 2.2.2.2, 3.3.3.3" })
        expect(getClientIp(req)).toBe("3.3.3.3")
    })

    it("x-real-ip takes precedence over x-forwarded-for", () => {
        const req = makeRequest({
            "x-real-ip": "1.2.3.4",
            "x-forwarded-for": "5.6.7.8",
        })
        expect(getClientIp(req)).toBe("1.2.3.4")
    })

    it("returns 'unknown' when no IP headers", () => {
        const req = makeRequest({})
        expect(getClientIp(req)).toBe("unknown")
    })
})
