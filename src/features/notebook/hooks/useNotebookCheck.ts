"use client"

import useSWR from "swr"

import type { NotebookItemType } from "@/domain/notebook/notebook.type"

async function fetcher(url: string): Promise<{ notebookIds: string[] }> {
    const res = await fetch(url)
    if (!res.ok) return { notebookIds: [] }
    return res.json()
}

export function useNotebookCheck(
    itemType: NotebookItemType,
    itemId: string,
    enabled = true
) {
    const key =
        enabled && itemId
            ? `/api/notebooks/check?type=${itemType}&id=${encodeURIComponent(itemId)}`
            : null

    const { data, mutate } = useSWR<{ notebookIds: string[] }>(key, fetcher, {
        revalidateOnFocus: false,
    })

    return {
        notebookIds: data?.notebookIds ?? [],
        mutate,
    }
}
