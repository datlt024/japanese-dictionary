// Polyfill localStorage/sessionStorage for jsdom under Node 26+.
// Node 26 defines these as experimental globals (undefined unless --localstorage-file
// is passed), which shadows jsdom's own implementation. We override with a simple
// in-memory Map that matches the Web Storage API surface.
class MemoryStorage implements Storage {
    private store = new Map<string, string>()
    get length() { return this.store.size }
    key(n: number): string | null { return [...this.store.keys()][n] ?? null }
    getItem(k: string): string | null { return this.store.get(k) ?? null }
    setItem(k: string, v: string) { this.store.set(k, String(v)) }
    removeItem(k: string) { this.store.delete(k) }
    clear() { this.store.clear() }
}

if (typeof window !== "undefined") {
    Object.defineProperty(window, "localStorage", {
        value: new MemoryStorage(),
        writable: true,
        configurable: true,
    })
    Object.defineProperty(window, "sessionStorage", {
        value: new MemoryStorage(),
        writable: true,
        configurable: true,
    })
}
