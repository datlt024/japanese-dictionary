import { useCallback, useSyncExternalStore } from "react"

const STORAGE_KEY = "bookmarks"
const CHANGE_EVENT = "bookmarksChanged"

function getStoredBookmarks(): number[] {
    if (typeof window === "undefined") {
        return []
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return []

        const parsed = JSON.parse(raw)

        if (
            Array.isArray(parsed) &&
            parsed.every((item) => typeof item === "number")
        ) {
            return parsed
        }
    } catch {
        // ignore malformed data
    }

    return []
}

function saveBookmarks(ids: number[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    window.dispatchEvent(new Event(CHANGE_EVENT))
}

function subscribe(callback: () => void) {
    window.addEventListener(STORAGE_KEY, callback)
    window.addEventListener(CHANGE_EVENT, callback)

    return () => {
        window.removeEventListener(STORAGE_KEY, callback)
        window.removeEventListener(CHANGE_EVENT, callback)
    }
}

export default function useBookmark() {
    const bookmarks = useSyncExternalStore(
        subscribe,
        getStoredBookmarks,
        () => []
    )

    const toggleBookmark = useCallback((id: number) => {
        const current = getStoredBookmarks()
        const next = current.includes(id)
            ? current.filter((item) => item !== id)
            : [...current, id]

        saveBookmarks(next)
    }, [])

    return {
        bookmarks,
        toggleBookmark,
    }
}
