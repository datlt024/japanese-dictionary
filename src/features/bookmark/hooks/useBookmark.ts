import { useState } from "react"

export default function useBookmark() {
    const [bookmarks, setBookmarks] =
        useState<number[]>(() => {
            if (typeof window === "undefined") {
                return []
            }

            const storedBookmarks =
                localStorage.getItem("bookmarks")

            return storedBookmarks
                ? JSON.parse(storedBookmarks)
                : []
        })

    const toggleBookmark = (id: number) => {
        let newBookmarks: number[]

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