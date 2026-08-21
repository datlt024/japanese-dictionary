"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"

import type { NotebookWithCount } from "@/domain/notebook/notebook.type"

export function useNotebooks(enabled = true) {
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [extraPages, setExtraPages] = useState<NotebookWithCount[][]>([])

    const { data, isLoading, error, mutate } = useSWR<NotebookWithCount[]>(
        enabled ? "/api/notebooks" : null,
        async (url: string) => {
            const res = await fetch(url)
            if (!res.ok) throw new Error("fetch failed")
            const cursor = res.headers.get("X-Next-Cursor")
            setNextCursor(cursor)
            setExtraPages([])
            return res.json()
        },
        { revalidateOnFocus: true, dedupingInterval: 10_000 }
    )

    const loadMore = useCallback(async () => {
        if (!nextCursor) return
        const res = await fetch(`/api/notebooks?cursor=${encodeURIComponent(nextCursor)}`)
        if (!res.ok) return
        const cursor = res.headers.get("X-Next-Cursor")
        setNextCursor(cursor)
        const page: NotebookWithCount[] = await res.json()
        setExtraPages((prev) => [...prev, page])
    }, [nextCursor])

    const notebooks = [...(data ?? []), ...extraPages.flat()]

    return {
        notebooks,
        loading: isLoading,
        error: error as Error | undefined,
        mutate,
        hasMore: !!nextCursor,
        loadMore,
    }
}
