"use client"

import { useState } from "react"

interface Notebook { id: string; name: string; item_count: number; group_id: string | null; created_at: string }

interface UseNotebookCrudArgs {
    notebooks: Notebook[]
    mutateNotebooks: () => Promise<unknown>
    mutateGroups: () => Promise<unknown>
    onSelectClear: (id: string) => void
}

export function useNotebookCrud({ notebooks, mutateNotebooks, mutateGroups, onSelectClear }: UseNotebookCrudArgs) {
    const [createLoading,      setCreateLoading]      = useState(false)
    const [createGroupLoading, setCreateGroupLoading] = useState(false)
    const [createError,        setCreateError]        = useState<string | null>(null)
    const [deletingNbId,       setDeletingNbId]       = useState<string | null>(null)
    const [deletingGroupId,    setDeletingGroupId]    = useState<string | null>(null)
    const [renameGroupLoading, setRenameGroupLoading] = useState(false)

    async function handleCreate(name: string, groupId: string | null): Promise<string | null> {
        if (!name || createLoading) return null
        if (notebooks.some(nb => nb.name.toLowerCase() === name.toLowerCase())) {
            setCreateError("Tên sổ tay đã tồn tại.")
            return "Tên sổ tay đã tồn tại."
        }
        setCreateError(null)
        setCreateLoading(true)
        try {
            const res = await fetch("/api/notebooks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, group_id: groupId }),
            })
            if (res.ok) {
                await mutateNotebooks()
                return null
            }
            setCreateError("Không thể tạo sổ tay. Vui lòng thử lại.")
            return "Không thể tạo sổ tay. Vui lòng thử lại."
        } catch {
            setCreateError("Không thể tạo sổ tay. Vui lòng thử lại.")
            return "Không thể tạo sổ tay. Vui lòng thử lại."
        } finally {
            setCreateLoading(false)
        }
    }

    async function handleCreateGroup(name: string): Promise<{ id: string } | null> {
        if (!name || createGroupLoading) return null
        setCreateGroupLoading(true)
        try {
            const res = await fetch("/api/notebook-groups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            })
            if (res.ok) {
                const created = await res.json() as { id: string }
                await mutateGroups()
                return created
            }
            setCreateError("Không thể tạo nhóm. Vui lòng thử lại.")
            return null
        } catch {
            setCreateError("Không thể tạo nhóm. Vui lòng thử lại.")
            return null
        } finally {
            setCreateGroupLoading(false)
        }
    }

    async function handleDeleteNotebook(id: string) {
        if (deletingNbId) return
        setDeletingNbId(id)
        try {
            const res = await fetch(`/api/notebooks/${id}`, { method: "DELETE" })
            if (!res.ok) return
            await mutateNotebooks()
            onSelectClear(id)
        } catch {
            // Network error — dialog caller will still close via its own handler
        } finally {
            setDeletingNbId(null)
        }
    }

    async function handleDeleteGroup(id: string) {
        if (deletingGroupId) return
        setDeletingGroupId(id)
        try {
            const res = await fetch(`/api/notebook-groups/${id}`, { method: "DELETE" })
            if (!res.ok) return
            await Promise.all([mutateGroups(), mutateNotebooks()])
        } catch {
            // Network error — dialog caller will still close via its own handler
        } finally {
            setDeletingGroupId(null)
        }
    }

    async function handleRenameGroup(id: string, name: string): Promise<boolean> {
        if (!name) return false
        setRenameGroupLoading(true)
        try {
            const res = await fetch(`/api/notebook-groups/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            })
            if (res.ok) await mutateGroups()
            return res.ok
        } catch {
            return false
        } finally {
            setRenameGroupLoading(false)
        }
    }

    async function handleRenameNotebook(notebookId: string, name: string): Promise<string | null> {
        if (notebooks.some(nb => nb.id !== notebookId && nb.name.toLowerCase() === name.toLowerCase()))
            return "Tên sổ tay đã tồn tại."
        try {
            const res = await fetch(`/api/notebooks/${notebookId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            })
            if (!res.ok) return "Không thể đổi tên. Vui lòng thử lại."
            await mutateNotebooks()
            return null
        } catch {
            return "Không thể đổi tên. Vui lòng thử lại."
        }
    }

    async function handleMoveNotebook(notebookId: string, groupId: string): Promise<void> {
        try {
            const res = await fetch(`/api/notebooks/${notebookId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ group_id: groupId }),
            })
            if (res.ok) await mutateNotebooks()
        } catch {
            // Network error — UI stays consistent via SWR revalidation on next focus
        }
    }

    async function handleUngroup(notebookId: string): Promise<void> {
        try {
            const res = await fetch(`/api/notebooks/${notebookId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ group_id: null }),
            })
            if (res.ok) await mutateNotebooks()
        } catch {
            // Network error — UI stays consistent via SWR revalidation on next focus
        }
    }

    return {
        createLoading, createGroupLoading, createError, setCreateError,
        deletingNbId, deletingGroupId, renameGroupLoading,
        handleCreate, handleCreateGroup, handleDeleteNotebook, handleDeleteGroup,
        handleRenameGroup, handleRenameNotebook, handleMoveNotebook, handleUngroup,
    }
}
