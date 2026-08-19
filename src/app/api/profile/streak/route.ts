import { NextRequest, NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"
import { upsertStreak } from "@/server/repositories/community/community.repository"

export async function POST(request: NextRequest) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })

    const rl = await rateLimit(`streak-post:${user.id}`, 60, 60_000)
    if (!rl.ok) return rl.response

    const body = await request.json().catch(() => null)
    const { streak_count, streak_last_date, streak_active_days } = body ?? {}

    if (
        typeof streak_count !== "number" ||
        !Number.isInteger(streak_count) ||
        streak_count < 0 ||
        streak_count > 3650 ||
        (streak_last_date !== null && typeof streak_last_date !== "string") ||
        !Array.isArray(streak_active_days) ||
        streak_active_days.length > 7 ||
        !streak_active_days.every((d: unknown) => typeof d === "number")
    ) {
        return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 })
    }

    if (streak_last_date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(streak_last_date)) {
        return NextResponse.json({ error: "Định dạng ngày không hợp lệ" }, { status: 400 })
    }

    const { error } = await upsertStreak(supabase, user.id, {
        streak_count,
        streak_last_date: streak_last_date ?? null,
        streak_active_days: streak_active_days.filter((d) => typeof d === "number"),
    })

    if (error) return serverError(error, "POST /api/profile/streak")

    return NextResponse.json({ ok: true })
}
