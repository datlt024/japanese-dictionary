import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/shared/types/database.generated"

type Client = SupabaseClient<Database>

export type EntryType = "vocabulary" | "kanji" | "grammar"
export type SortOrder = "likes" | "newest"

export type CommentRow = {
    id: string
    user_id: string
    content: string
    likes_count: number
    created_at: string
    user_profiles: { display_name: string; jlpt_level: string | null } | null
}

export async function createComment(
    supabase: Client,
    userId: string,
    entryType: EntryType,
    entryId: number,
    content: string,
) {
    return supabase
        .from("word_comments")
        .insert({ user_id: userId, entry_type: entryType, entry_id: entryId, content })
        .select("id, user_id, content, likes_count, created_at")
        .single()
}

export async function deleteComment(supabase: Client, commentId: string, userId: string) {
    return supabase
        .from("word_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", userId)
        .select("id")
}

export async function getLike(supabase: Client, userId: string, commentId: string) {
    return supabase
        .from("word_comment_likes")
        .select("user_id")
        .eq("user_id", userId)
        .eq("comment_id", commentId)
        .maybeSingle()
}

export async function addLike(supabase: Client, userId: string, commentId: string) {
    return supabase
        .from("word_comment_likes")
        .insert({ user_id: userId, comment_id: commentId })
}

export async function removeLike(supabase: Client, userId: string, commentId: string) {
    return supabase
        .from("word_comment_likes")
        .delete()
        .eq("user_id", userId)
        .eq("comment_id", commentId)
}

export async function getUserLikedCommentIds(
    supabase: Client,
    userId: string,
    commentIds: string[],
) {
    if (commentIds.length === 0) return { data: [], error: null }
    return supabase
        .from("word_comment_likes")
        .select("comment_id")
        .eq("user_id", userId)
        .in("comment_id", commentIds)
}

export async function upsertProfile(
    supabase: Client,
    userId: string,
    displayName: string,
    jlptLevel: string | null,
) {
    return supabase
        .from("user_profiles")
        .upsert({ id: userId, display_name: displayName, jlpt_level: jlptLevel })
}

export async function getProfile(supabase: Client, userId: string) {
    return supabase
        .from("user_profiles")
        .select("display_name, jlpt_level, streak_count, streak_last_date, streak_active_days")
        .eq("id", userId)
        .maybeSingle()
}

export type StreakUpdate = {
    streak_count: number
    streak_last_date: string | null  // ISO date string YYYY-MM-DD
    streak_active_days: number[]
}

export async function upsertStreak(supabase: Client, userId: string, streak: StreakUpdate) {
    return supabase
        .from("user_profiles")
        .update({
            streak_count: streak.streak_count,
            streak_last_date: streak.streak_last_date,
            streak_active_days: streak.streak_active_days,
        })
        .eq("id", userId)
}
