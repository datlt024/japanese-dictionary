import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"
import {
    createPracticeSession,
    listPracticeSessions,
} from "@/server/repositories/practice/practice-session.repository"

export const dynamic = "force-dynamic"

export async function GET() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })

    const rl = await rateLimit(`practice-sessions-get:${user.id}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const { data, error } = await listPracticeSessions(supabase, user.id)
    if (error) return serverError(error, "GET /api/practice/sessions")

    return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })

    const rl = await rateLimit(`practice-sessions-post:${user.id}`, 60, 60_000)
    if (!rl.ok) return rl.response

    const body = await request.json().catch(() => null)

    const { notebook_id, mode, known_ids, unknown_ids, total_items, time_taken } = body ?? {}

    if (
        typeof notebook_id !== "string" ||
        typeof mode !== "string" ||
        !["flashcard", "quiz", "writing", "minitest"].includes(mode) ||
        !Array.isArray(known_ids) ||
        !known_ids.every((id: unknown) => typeof id === "string") ||
        !Array.isArray(unknown_ids) ||
        !unknown_ids.every((id: unknown) => typeof id === "string") ||
        typeof total_items !== "number"
    ) {
        return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 })
    }

    const { data: nb, error: nbError } = await supabase
        .from("notebooks")
        .select("id")
        .eq("id", notebook_id)
        .eq("user_id", user.id)
        .maybeSingle()

    if (nbError) return serverError(nbError, "POST /api/practice/sessions")
    if (!nb) {
        return NextResponse.json({ error: "Sổ tay không tồn tại" }, { status: 404 })
    }

    const { data, error } = await createPracticeSession(supabase, user.id, {
        notebook_id,
        mode,
        known_ids: known_ids.map(String),
        unknown_ids: unknown_ids.map(String),
        total_items,
        time_taken: typeof time_taken === "number" ? time_taken : null,
    })

    if (error) return serverError(error, "POST /api/practice/sessions")

    return NextResponse.json(data, { status: 201 })
}
