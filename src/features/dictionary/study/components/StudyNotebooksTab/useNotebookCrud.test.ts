/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { act, createElement } from "react"
import { createRoot } from "react-dom/client"
import { useNotebookCrud } from "./useNotebookCrud"

// Minimal renderHook using React 19 act + react-dom/client
function renderHook<T>(useHook: () => T) {
    let captured: T
    const container = document.createElement("div")
    document.body.appendChild(container)

    function TestComponent() {
        captured = useHook()
        return null
    }

    let root: ReturnType<typeof createRoot>
    act(() => {
        root = createRoot(container)
        root.render(createElement(TestComponent))
    })

    return {
        get result() { return captured! },
        unmount() { act(() => { root.unmount() }); container.remove() },
    }
}

const NOTEBOOKS = [
    { id: "nb-1", name: "Grammar N5", item_count: 3, group_id: null, created_at: "2024-01-01" },
    { id: "nb-2", name: "Vocab N4",   item_count: 1, group_id: "g-1", created_at: "2024-01-02" },
]

function makeArgs(overrides?: Partial<Parameters<typeof useNotebookCrud>[0]>) {
    return {
        notebooks: NOTEBOOKS,
        mutateNotebooks: vi.fn().mockResolvedValue(undefined),
        mutateGroups: vi.fn().mockResolvedValue(undefined),
        onSelectClear: vi.fn(),
        ...overrides,
    }
}

function mockFetch(ok: boolean, body: unknown = {}) {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok, json: () => Promise.resolve(body) }))
}

beforeEach(() => {
    vi.restoreAllMocks()
})

// ── handleCreate ──────────────────────────────────────────────────────────────

describe("handleCreate", () => {
    it("returns duplicate error when name already exists (case-insensitive)", async () => {
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ret: string | null
        await act(async () => { ret = await result.handleCreate("grammar n5", null) })
        expect(ret!).toContain("đã tồn tại")
        expect(args.mutateNotebooks).not.toHaveBeenCalled()
    })

    it("POSTs to /api/notebooks with name and group_id", async () => {
        mockFetch(true)
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        await act(async () => { await result.handleCreate("New Notebook", "g-1") })
        expect(vi.mocked(fetch)).toHaveBeenCalledWith("/api/notebooks", expect.objectContaining({
            method: "POST",
            body: JSON.stringify({ name: "New Notebook", group_id: "g-1" }),
        }))
    })

    it("calls mutateNotebooks on success and returns null", async () => {
        mockFetch(true)
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ret: string | null
        await act(async () => { ret = await result.handleCreate("Fresh", null) })
        expect(ret!).toBeNull()
        expect(args.mutateNotebooks).toHaveBeenCalledOnce()
    })

    it("returns error message and does not mutate on server error", async () => {
        mockFetch(false)
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ret: string | null
        await act(async () => { ret = await result.handleCreate("Fresh", null) })
        expect(typeof ret!).toBe("string")
        expect(args.mutateNotebooks).not.toHaveBeenCalled()
    })

    it("returns error on network failure", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")))
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ret: string | null
        await act(async () => { ret = await result.handleCreate("Fresh", null) })
        expect(typeof ret!).toBe("string")
    })
})

// ── handleCreateGroup ─────────────────────────────────────────────────────────

describe("handleCreateGroup", () => {
    it("POSTs to /api/notebook-groups", async () => {
        mockFetch(true, { id: "g-new" })
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ret: { id: string } | null
        await act(async () => { ret = await result.handleCreateGroup("My Group") })
        expect(vi.mocked(fetch)).toHaveBeenCalledWith("/api/notebook-groups", expect.objectContaining({ method: "POST" }))
        expect(ret!).toEqual({ id: "g-new" })
        expect(args.mutateGroups).toHaveBeenCalledOnce()
    })

    it("returns null on server error", async () => {
        mockFetch(false)
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ret: { id: string } | null
        await act(async () => { ret = await result.handleCreateGroup("My Group") })
        expect(ret!).toBeNull()
    })
})

// ── handleDeleteNotebook ──────────────────────────────────────────────────────

describe("handleDeleteNotebook", () => {
    it("DELETEs /api/notebooks/:id and returns true on success", async () => {
        mockFetch(true)
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ok: boolean
        await act(async () => { ok = await result.handleDeleteNotebook("nb-1") })
        expect(ok!).toBe(true)
        expect(vi.mocked(fetch)).toHaveBeenCalledWith("/api/notebooks/nb-1", { method: "DELETE" })
        expect(args.mutateNotebooks).toHaveBeenCalledOnce()
        expect(args.onSelectClear).toHaveBeenCalledWith("nb-1")
    })

    it("returns false and does not mutate on server failure", async () => {
        mockFetch(false)
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ok: boolean
        await act(async () => { ok = await result.handleDeleteNotebook("nb-1") })
        expect(ok!).toBe(false)
        expect(args.mutateNotebooks).not.toHaveBeenCalled()
        expect(args.onSelectClear).not.toHaveBeenCalled()
    })

    it("returns false on network failure", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")))
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ok: boolean
        await act(async () => { ok = await result.handleDeleteNotebook("nb-1") })
        expect(ok!).toBe(false)
        expect(args.mutateNotebooks).not.toHaveBeenCalled()
    })
})

// ── handleDeleteGroup ─────────────────────────────────────────────────────────

describe("handleDeleteGroup", () => {
    it("DELETEs /api/notebook-groups/:id and mutates both on success", async () => {
        mockFetch(true)
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ok: boolean
        await act(async () => { ok = await result.handleDeleteGroup("g-1") })
        expect(ok!).toBe(true)
        expect(vi.mocked(fetch)).toHaveBeenCalledWith("/api/notebook-groups/g-1", { method: "DELETE" })
        expect(args.mutateGroups).toHaveBeenCalledOnce()
        expect(args.mutateNotebooks).toHaveBeenCalledOnce()
    })

    it("returns false and does not mutate on failure", async () => {
        mockFetch(false)
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ok: boolean
        await act(async () => { ok = await result.handleDeleteGroup("g-1") })
        expect(ok!).toBe(false)
        expect(args.mutateGroups).not.toHaveBeenCalled()
        expect(args.mutateNotebooks).not.toHaveBeenCalled()
    })
})

// ── handleRenameGroup ─────────────────────────────────────────────────────────

describe("handleRenameGroup", () => {
    it("PATCHes /api/notebook-groups/:id", async () => {
        mockFetch(true)
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ok: boolean
        await act(async () => { ok = await result.handleRenameGroup("g-1", "Renamed") })
        expect(ok!).toBe(true)
        expect(vi.mocked(fetch)).toHaveBeenCalledWith("/api/notebook-groups/g-1", expect.objectContaining({
            method: "PATCH",
            body: JSON.stringify({ name: "Renamed" }),
        }))
        expect(args.mutateGroups).toHaveBeenCalledOnce()
    })

    it("returns false for empty name without fetching", async () => {
        const fetchSpy = vi.fn()
        vi.stubGlobal("fetch", fetchSpy)
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ok: boolean
        await act(async () => { ok = await result.handleRenameGroup("g-1", "") })
        expect(ok!).toBe(false)
        expect(fetchSpy).not.toHaveBeenCalled()
    })
})

// ── handleRenameNotebook ──────────────────────────────────────────────────────

describe("handleRenameNotebook", () => {
    it("returns duplicate error when another notebook has the same name", async () => {
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ret: string | null
        await act(async () => { ret = await result.handleRenameNotebook("nb-1", "vocab n4") })
        expect(ret!).toContain("đã tồn tại")
    })

    it("allows renaming to own current name (same id excluded)", async () => {
        mockFetch(true)
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ret: string | null
        await act(async () => { ret = await result.handleRenameNotebook("nb-1", "Grammar N5") })
        expect(ret!).toBeNull()
        expect(args.mutateNotebooks).toHaveBeenCalledOnce()
    })

    it("PATCHes /api/notebooks/:id", async () => {
        mockFetch(true)
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        await act(async () => { await result.handleRenameNotebook("nb-1", "Updated Name") })
        expect(vi.mocked(fetch)).toHaveBeenCalledWith("/api/notebooks/nb-1", expect.objectContaining({
            method: "PATCH",
            body: JSON.stringify({ name: "Updated Name" }),
        }))
    })
})

// ── handleMoveNotebook ────────────────────────────────────────────────────────

describe("handleMoveNotebook", () => {
    it("PATCHes with group_id and returns true on success", async () => {
        mockFetch(true)
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ok: boolean
        await act(async () => { ok = await result.handleMoveNotebook("nb-1", "g-2") })
        expect(ok!).toBe(true)
        expect(vi.mocked(fetch)).toHaveBeenCalledWith("/api/notebooks/nb-1", expect.objectContaining({
            body: JSON.stringify({ group_id: "g-2" }),
        }))
        expect(args.mutateNotebooks).toHaveBeenCalledOnce()
    })

    it("returns false and does not mutate on failure", async () => {
        mockFetch(false)
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ok: boolean
        await act(async () => { ok = await result.handleMoveNotebook("nb-1", "g-2") })
        expect(ok!).toBe(false)
        expect(args.mutateNotebooks).not.toHaveBeenCalled()
    })
})

// ── handleUngroup ─────────────────────────────────────────────────────────────

describe("handleUngroup", () => {
    it("PATCHes with group_id: null and returns true on success", async () => {
        mockFetch(true)
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ok: boolean
        await act(async () => { ok = await result.handleUngroup("nb-2") })
        expect(ok!).toBe(true)
        expect(vi.mocked(fetch)).toHaveBeenCalledWith("/api/notebooks/nb-2", expect.objectContaining({
            body: JSON.stringify({ group_id: null }),
        }))
        expect(args.mutateNotebooks).toHaveBeenCalledOnce()
    })

    it("returns false and does not mutate on failure", async () => {
        mockFetch(false)
        const args = makeArgs()
        const { result } = renderHook(() => useNotebookCrud(args))
        let ok: boolean
        await act(async () => { ok = await result.handleUngroup("nb-2") })
        expect(ok!).toBe(false)
        expect(args.mutateNotebooks).not.toHaveBeenCalled()
    })
})
