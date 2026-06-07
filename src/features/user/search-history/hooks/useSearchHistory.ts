import {
    useCallback,
    useSyncExternalStore,
} from "react"

const STORAGE_KEY = "searchHistories"
const CHANGE_EVENT = "searchHistoriesChanged"
const MAX_HISTORY_ITEMS = 10
const MAX_HISTORY_KEYWORD_LENGTH = 40

function isStringArray(value: unknown): value is string[] {
    return (
        Array.isArray(value) &&
        value.every((item) => typeof item === "string")
    )
}

function normalizeHistoryKeyword(keyword: string) {
    return keyword.replace(/\s+/g, " ").trim()
}

function isValidHistoryKeyword(keyword: string) {
    if (!keyword) {
        return false
    }

    if (keyword.length > MAX_HISTORY_KEYWORD_LENGTH) {
        return false
    }

    if (/https?:\/\//i.test(keyword)) {
        return false
    }

    if (/localhost|\.com|\.net|\.jp/i.test(keyword)) {
        return false
    }

    return true
}

function sanitizeHistories(histories: string[]) {
    return histories
        .map(normalizeHistoryKeyword)
        .filter(isValidHistoryKeyword)
        .filter(
            (item, index, self) =>
                self.findIndex((value) => value === item) === index
        )
        .slice(0, MAX_HISTORY_ITEMS)
}

function emitHistoriesChanged() {
    window.dispatchEvent(new Event(CHANGE_EVENT))
}

function getStoredHistories(): string[] {
    if (typeof window === "undefined") {
        return []
    }

    try {
        const storedHistories =
            localStorage.getItem(STORAGE_KEY)

        if (!storedHistories) {
            return []
        }

        const parsed = JSON.parse(storedHistories)

        return isStringArray(parsed)
            ? sanitizeHistories(parsed)
            : []
    } catch {
        return []
    }
}

function setStoredHistories(histories: string[]) {
    if (typeof window === "undefined") {
        return
    }

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(sanitizeHistories(histories))
        )

        emitHistoriesChanged()
    } catch {
        // Ignore localStorage errors.
    }
}

function getSnapshot() {
    return JSON.stringify(getStoredHistories())
}

function getServerSnapshot() {
    return "[]"
}

function subscribe(callback: () => void) {
    if (typeof window === "undefined") {
        return () => { }
    }

    const handleStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY) {
            callback()
        }
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener(CHANGE_EVENT, callback)

    return () => {
        window.removeEventListener("storage", handleStorage)
        window.removeEventListener(CHANGE_EVENT, callback)
    }
}

export default function useSearchHistory() {
    const snapshot = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
    )

    const histories = JSON.parse(snapshot) as string[]

    const addHistory = useCallback((keyword: string) => {
        const normalizedKeyword =
            normalizeHistoryKeyword(keyword)

        if (!isValidHistoryKeyword(normalizedKeyword)) {
            return
        }

        const currentHistories = getStoredHistories()

        const newHistories = [
            normalizedKeyword,
            ...currentHistories.filter(
                (item) => item !== normalizedKeyword
            ),
        ]

        setStoredHistories(newHistories)
    }, [])

    const removeHistory = useCallback((keyword: string) => {
        const normalizedKeyword =
            normalizeHistoryKeyword(keyword)

        if (!normalizedKeyword) {
            return
        }

        const currentHistories = getStoredHistories()

        setStoredHistories(
            currentHistories.filter(
                (item) => item !== normalizedKeyword
            )
        )
    }, [])

    const clearHistories = useCallback(() => {
        setStoredHistories([])
    }, [])

    return {
        histories,
        addHistory,
        removeHistory,
        clearHistories,
    }
}