"use client"

import useSWR from "swr"

import type { NotebookWithCount } from "@/domain/notebook/notebook.type"

async function fetcher(url: string): Promise<NotebookWithCount[]> {
    const res = await fetch(url)
    if (!res.ok) throw new Error("fetch failed")
    return res.json()
}

export function useNotebooks(enabled = true) {
    const { data, isLoading, mutate } = useSWR<NotebookWithCount[]>(
        enabled ? "/api/notebooks" : null,
        fetcher,
        { revalidateOnFocus: false }
    )

    return {
        notebooks: data ?? [],
        loading: isLoading,
        mutate,
    }
}
