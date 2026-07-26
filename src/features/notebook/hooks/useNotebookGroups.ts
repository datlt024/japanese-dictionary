"use client"

import useSWR from "swr"

import type { NotebookGroup } from "@/domain/notebook/notebook.type"

async function fetcher(url: string): Promise<NotebookGroup[]> {
    const res = await fetch(url)
    if (!res.ok) throw new Error("fetch failed")
    return res.json()
}

export function useNotebookGroups(enabled = true) {
    const { data, isLoading, mutate } = useSWR<NotebookGroup[]>(
        enabled ? "/api/notebook-groups" : null,
        fetcher,
        { revalidateOnFocus: false }
    )

    return {
        groups: data ?? [],
        loading: isLoading,
        mutate,
    }
}
