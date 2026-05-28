import { useEffect, useState } from "react"

export default function useSearchHistory() {
    const [histories, setHistories] = useState<string[]>([])

    useEffect(() => {
        const storedHistories =
            localStorage.getItem("searchHistories")

        if (storedHistories) {
            setHistories(JSON.parse(storedHistories))
        }
    }, [])

    const addHistory = (keyword: string) => {
        if (!keyword.trim()) {
            return
        }

        const newHistories = [
            keyword,
            ...histories.filter(
                (item) => item !== keyword
            ),
        ].slice(0, 10)

        setHistories(newHistories)

        localStorage.setItem(
            "searchHistories",
            JSON.stringify(newHistories)
        )
    }

    return {
        histories,
        addHistory,
    }
}