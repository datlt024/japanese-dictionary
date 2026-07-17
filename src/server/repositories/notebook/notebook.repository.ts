import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/shared/types/database.generated"

type Client = SupabaseClient<Database>

export async function listNotebooks(supabase: Client) {
    return supabase
        .from("notebooks")
        .select("id, name, description, created_at, updated_at")
        .order("created_at", { ascending: false })
}

export async function listNotebooksWithItemCount(supabase: Client, userId: string) {
    return supabase
        .from("notebooks")
        .select("id, name, description, created_at, updated_at, notebook_items(count)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
}

export async function getNotebook(supabase: Client, notebookId: string) {
    return supabase
        .from("notebooks")
        .select("id, name, description, created_at, updated_at")
        .eq("id", notebookId)
        .single()
}

export async function createNotebook(
    supabase: Client,
    userId: string,
    name: string,
    description?: string
) {
    return supabase
        .from("notebooks")
        .insert({ user_id: userId, name, description: description ?? null })
        .select("id, name, description, created_at, updated_at")
        .single()
}

export async function updateNotebook(
    supabase: Client,
    notebookId: string,
    userId: string,
    fields: { name?: string; description?: string | null }
) {
    return supabase
        .from("notebooks")
        .update(fields)
        .eq("id", notebookId)
        .eq("user_id", userId)
        .select("id, name, description, created_at, updated_at")
        .single()
}

export async function deleteNotebook(supabase: Client, notebookId: string, userId: string) {
    return supabase
        .from("notebooks")
        .delete()
        .eq("id", notebookId)
        .eq("user_id", userId)
}
