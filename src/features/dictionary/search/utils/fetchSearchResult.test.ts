import { describe, it, expect, vi, afterEach } from "vitest"
import { fetchSearchResult } from "./fetchSearchResult"

afterEach(() => {
    vi.restoreAllMocks()
})

function makeFetch(status: number, body: unknown) {
    return vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(body),
    })
}

describe("fetchSearchResult", () => {
    it("returns parsed data on a successful response", async () => {
        vi.stubGlobal("fetch", makeFetch(200, { vocabularies: [{ id: 1 }], grammars: [] }))
        const result = await fetchSearchResult("日本", "all", "vi")
        expect(result).toEqual({ vocabularies: [{ id: 1 }], grammars: [] })
    })

    it("returns empty object when response is not ok", async () => {
        vi.stubGlobal("fetch", makeFetch(500, {}))
        const result = await fetchSearchResult("error", "all", "vi")
        expect(result).toEqual({})
    })

    it("returns empty object on 429 rate-limit response", async () => {
        vi.stubGlobal("fetch", makeFetch(429, { error: "Too many requests" }))
        const result = await fetchSearchResult("test", "all", "vi")
        expect(result).toEqual({})
    })

    it("returns empty object on network error (fetch throws)", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")))
        const result = await fetchSearchResult("test", "all", "vi")
        expect(result).toEqual({})
    })

    it("encodes the query string in the URL", async () => {
        const spy = makeFetch(200, {})
        vi.stubGlobal("fetch", spy)
        await fetchSearchResult("日本語 テスト", "all", "vi")
        const calledUrl = spy.mock.calls[0][0] as string
        expect(calledUrl).toContain(encodeURIComponent("日本語 テスト"))
    })

    it("includes the tab parameter in the URL", async () => {
        const spy = makeFetch(200, {})
        vi.stubGlobal("fetch", spy)
        await fetchSearchResult("test", "kanji", "vi")
        const calledUrl = spy.mock.calls[0][0] as string
        expect(calledUrl).toContain("tab=kanji")
    })

    it("includes the language parameter in the URL", async () => {
        const spy = makeFetch(200, {})
        vi.stubGlobal("fetch", spy)
        await fetchSearchResult("test", "all", "en")
        const calledUrl = spy.mock.calls[0][0] as string
        expect(calledUrl).toContain("lang=en")
    })

    it("returns empty vocabularies and grammars when response body is empty", async () => {
        vi.stubGlobal("fetch", makeFetch(200, {}))
        const result = await fetchSearchResult("test", "all", "vi")
        // empty body → undefined vocabularies and grammars, which is valid
        expect(result).toEqual({})
    })
})
