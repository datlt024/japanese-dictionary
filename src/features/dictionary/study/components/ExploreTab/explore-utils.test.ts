// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
    fetchExploreSections,
    fetchPublicItems,
    loadLiked, saveLiked,
    loadLikedSections, saveLikedSections,
    loadViewed, saveViewed,
} from "./explore-utils"

// ── helpers ───────────────────────────────────────────────────────────────────

function makeFetch(status: number, body: unknown) {
    return vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(body),
    })
}

beforeEach(() => {
    localStorage.clear()
})
afterEach(() => {
    vi.unstubAllGlobals()
})

// ── fetchExploreSections ──────────────────────────────────────────────────────

describe("fetchExploreSections", () => {
    it("returns parsed sections on success", async () => {
        vi.stubGlobal("fetch", makeFetch(200, [{ id: "s1", type: "category", notebooks: [] }]))
        const result = await fetchExploreSections()
        expect(result).toEqual([{ id: "s1", type: "category", notebooks: [] }])
    })

    it("throws on non-ok response (SWR expects fetchers to throw)", async () => {
        vi.stubGlobal("fetch", makeFetch(500, { error: "server error" }))
        await expect(fetchExploreSections()).rejects.toThrow()
    })

    it("throws on 401 unauthenticated", async () => {
        vi.stubGlobal("fetch", makeFetch(401, { error: "Unauthorized" }))
        await expect(fetchExploreSections()).rejects.toThrow()
    })

    it("fetches the correct endpoint", async () => {
        const spy = makeFetch(200, [])
        vi.stubGlobal("fetch", spy)
        await fetchExploreSections()
        expect(spy.mock.calls[0][0]).toBe("/api/explore/notebooks")
    })
})

// ── fetchPublicItems ──────────────────────────────────────────────────────────

describe("fetchPublicItems", () => {
    it("returns parsed items on success", async () => {
        const items = [{ id: "item1", item_type: "vocabulary" }]
        vi.stubGlobal("fetch", makeFetch(200, items))
        const result = await fetchPublicItems("nb-abc")
        expect(result).toEqual(items)
    })

    it("throws on non-ok response", async () => {
        vi.stubGlobal("fetch", makeFetch(404, { error: "not found" }))
        await expect(fetchPublicItems("nb-missing")).rejects.toThrow()
    })

    it("includes the notebookId in the URL", async () => {
        const spy = makeFetch(200, [])
        vi.stubGlobal("fetch", spy)
        await fetchPublicItems("my-notebook-id")
        expect(spy.mock.calls[0][0]).toContain("my-notebook-id")
    })
})

// ── localStorage helpers ──────────────────────────────────────────────────────

describe("loadLiked / saveLiked", () => {
    it("returns empty set when nothing saved", () => {
        expect(loadLiked("user1")).toEqual(new Set())
    })

    it("round-trips a set of ids", () => {
        const ids = new Set(["a", "b", "c"])
        saveLiked(ids, "user1")
        expect(loadLiked("user1")).toEqual(ids)
    })

    it("isolates data by userId", () => {
        saveLiked(new Set(["x"]), "user1")
        saveLiked(new Set(["y"]), "user2")
        expect(loadLiked("user1")).toEqual(new Set(["x"]))
        expect(loadLiked("user2")).toEqual(new Set(["y"]))
    })

    it("uses guest namespace when userId is undefined", () => {
        saveLiked(new Set(["g1"]), undefined)
        expect(loadLiked(undefined)).toEqual(new Set(["g1"]))
    })

    it("returns empty set on corrupted localStorage data", () => {
        localStorage.setItem("yomi_explore_liked:user1", "NOT_JSON{{{")
        expect(loadLiked("user1")).toEqual(new Set())
    })
})

describe("loadViewed / saveViewed", () => {
    it("returns empty array when nothing saved", () => {
        expect(loadViewed("user1")).toEqual([])
    })

    it("round-trips a viewed list", () => {
        saveViewed(["nb1", "nb2", "nb3"], "user1")
        expect(loadViewed("user1")).toEqual(["nb1", "nb2", "nb3"])
    })

    it("returns empty array on corrupted data", () => {
        localStorage.setItem("yomi_explore_viewed:user1", "][bad")
        expect(loadViewed("user1")).toEqual([])
    })
})

describe("loadLikedSections / saveLikedSections", () => {
    it("round-trips a set of section ids", () => {
        const ids = new Set(["sec1", "sec2"])
        saveLikedSections(ids, "user1")
        expect(loadLikedSections("user1")).toEqual(ids)
    })

    it("returns empty set when nothing saved", () => {
        expect(loadLikedSections("user-new")).toEqual(new Set())
    })
})
