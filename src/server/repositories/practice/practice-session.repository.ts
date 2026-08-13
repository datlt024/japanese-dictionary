import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/shared/types/database.generated"

type Client = SupabaseClient<Database>

export type PracticeSessionInsert = {
    notebook_id: string
    mode: string
    known_ids: string[]
    unknown_ids: string[]
    total_items: number
    time_taken?: number | null
}

export async function createPracticeSession(
    supabase: Client,
    userId: string,
    data: PracticeSessionInsert
) {
    return supabase
        .from("practice_sessions")
        .insert({
            user_id: userId,
            notebook_id: data.notebook_id,
            mode: data.mode,
            known_ids: data.known_ids,
            unknown_ids: data.unknown_ids,
            total_items: data.total_items,
            time_taken: data.time_taken ?? null,
        })
        .select("id, created_at")
        .single()
}

export async function listPracticeSessions(
    supabase: Client,
    userId: string,
    limit = 20
) {
    return supabase
        .from("practice_sessions")
        .select("id, notebook_id, mode, known_ids, unknown_ids, total_items, time_taken, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)
}

export async function listPracticeSessionsByNotebook(
    supabase: Client,
    userId: string,
    notebookId: string,
    limit = 10
) {
    return supabase
        .from("practice_sessions")
        .select("id, mode, known_ids, unknown_ids, total_items, time_taken, created_at")
        .eq("user_id", userId)
        .eq("notebook_id", notebookId)
        .order("created_at", { ascending: false })
        .limit(limit)
}
