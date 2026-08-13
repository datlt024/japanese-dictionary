"use client"

import useSWR from "swr"

import type { EnrichedNotebookItem } from "@/domain/notebook/notebook.type"

async function fetcher(url: string): Promise<EnrichedNotebookItem[]> {
    const res = await fetch(url)
    if (!res.ok) throw new Error("fetch failed")
    return res.json()
}

export function useNotebookItems(notebookId: string | null) {
    const { data, isLoading, error, mutate } = useSWR<EnrichedNotebookItem[]>(
        notebookId ? `/api/notebooks/${notebookId}/items` : null,
        fetcher,
        { revalidateOnFocus: false }
    )

    return {
        items: data ?? [],
        loading: isLoading,
        error: error as Error | undefined,
        mutate,
    }
}
