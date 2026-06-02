import {
    useCallback,
    useSyncExternalStore,
} from "react"

const STORAGE_KEY = "searchHistories"
const CHANGE_EVENT = "searchHistoriesChanged"

function getStoredHistories(): string[] {
    if (typeof window === "undefined") {
        return []
    }

    try {
        const storedHistories =
            localStorage.getItem(STORAGE_KEY)

        return storedHistories
            ? JSON.parse(storedHistories)
            : []
    } catch {
        return []
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
        const trimmedKeyword = keyword.trim()

        if (!trimmedKeyword) {
            return
        }

        const currentHistories = getStoredHistories()

        const newHistories = [
            trimmedKeyword,
            ...currentHistories.filter(
                (item) => item !== trimmedKeyword
            ),
        ].slice(0, 10)

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(newHistories)
        )

        window.dispatchEvent(new Event(CHANGE_EVENT))
    }, [])

    return {
        histories,
        addHistory,
    }
}