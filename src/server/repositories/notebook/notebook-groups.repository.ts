import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/shared/types/database.generated"

type Client = SupabaseClient<Database>

export async function listNotebookGroups(supabase: Client, userId: string) {
    return supabase
        .from("notebook_groups")
        .select("id, name, description, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
}

export async function createNotebookGroup(
    supabase: Client,
    userId: string,
    name: string,
    description?: string
) {
    return supabase
        .from("notebook_groups")
        .insert({ user_id: userId, name, description: description ?? null })
        .select("id, name, description, created_at, updated_at")
        .single()
}

export async function updateNotebookGroup(
    supabase: Client,
    groupId: string,
    userId: string,
    fields: { name?: string; description?: string | null }
) {
    return supabase
        .from("notebook_groups")
        .update(fields)
        .eq("id", groupId)
        .eq("user_id", userId)
        .select("id, name, description, created_at, updated_at")
        .single()
}

export async function deleteNotebookGroup(supabase: Client, groupId: string, userId: string) {
    return supabase
        .from("notebook_groups")
        .delete()
        .eq("id", groupId)
        .eq("user_id", userId)
}
