"use client"

import useSWR from "swr"

import type { NotebookGroup } from "@/domain/notebook/notebook.type"

async function fetcher(url: string): Promise<NotebookGroup[]> {
    const res = await fetch(url)
    if (!res.ok) throw new Error("fetch failed")
    return res.json()
}

export function useNotebookGroups(enabled = true) {
    const { data, isLoading, error, mutate } = useSWR<NotebookGroup[]>(
        enabled ? "/api/notebook-groups" : null,
        fetcher,
        { revalidateOnFocus: true, dedupingInterval: 10_000 }
    )

    return {
        groups: data ?? [],
        loading: isLoading,
        error: error as Error | undefined,
        mutate,
    }
}
