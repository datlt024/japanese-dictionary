import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/shared/types/database.generated"
import type { NotebookItemType } from "@/domain/notebook/notebook.type"

type Client = SupabaseClient<Database>

export async function listNotebookItems(supabase: Client, notebookId: string, userId: string) {
    return supabase
        .from("notebook_items")
        .select("id, notebook_id, item_type, item_id, added_at")
        .eq("notebook_id", notebookId)
        .eq("user_id", userId)
        .order("added_at", { ascending: false })
}

export async function addNotebookItem(
    supabase: Client,
    notebookId: string,
    userId: string,
    itemType: NotebookItemType,
    itemId: string
) {
    return supabase
        .from("notebook_items")
        .insert({
            notebook_id: notebookId,
            user_id: userId,
            item_type: itemType,
            item_id: itemId,
        })
        .select("id, notebook_id, item_type, item_id, added_at")
        .single()
}

export async function removeNotebookItem(
    supabase: Client,
    notebookId: string,
    userId: string,
    itemType: NotebookItemType,
    itemId: string
) {
    return supabase
        .from("notebook_items")
        .delete()
        .eq("notebook_id", notebookId)
        .eq("user_id", userId)
        .eq("item_type", itemType)
        .eq("item_id", itemId)
}

export async function checkItemInNotebooks(
    supabase: Client,
    userId: string,
    itemType: NotebookItemType,
    itemId: string
) {
    return supabase
        .from("notebook_items")
        .select("notebook_id")
        .eq("user_id", userId)
        .eq("item_type", itemType)
        .eq("item_id", itemId)
}
