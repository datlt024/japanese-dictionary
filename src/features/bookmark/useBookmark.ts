import { useEffect, useState } from "react"

export default function useBookmark() {
    const [bookmarks, setBookmarks] =
        useState<number[]>([])

    useEffect(() => {
        const storedBookmarks =
            localStorage.getItem("bookmarks")

        if (storedBookmarks) {
            setBookmarks(JSON.parse(storedBookmarks))
        }
    }, [])

    const toggleBookmark = (id: number) => {
        let newBookmarks = []

        if (bookmarks.includes(id)) {
            newBookmarks = bookmarks.filter(
                (item) => item !== id
            )
        } else {
            newBookmarks = [...bookmarks, id]
        }

        setBookmarks(newBookmarks)

        localStorage.setItem(
            "bookmarks",
            JSON.stringify(newBookmarks)
        )
    }

    return {
        bookmarks,
        toggleBookmark,
    }
}