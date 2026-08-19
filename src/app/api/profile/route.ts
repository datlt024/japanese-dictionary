import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"
import {
    getProfile,
    upsertProfile,
} from "@/server/repositories/community/community.repository"

export const dynamic = "force-dynamic"

export async function GET() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json(null)
    }

    const rl = await rateLimit(`profile-get:${user.id}`, 60, 60_000)
    if (!rl.ok) return rl.response

    const { data } = await getProfile(supabase, user.id)
    return NextResponse.json(data ?? null)
}

export async function PATCH(request: NextRequest) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const rl = await rateLimit(`profile-patch:${user.id}`, 10, 60_000)
    if (!rl.ok) return rl.response

    const body = await request.json().catch(() => null)
    const displayName = typeof body?.display_name === "string" ? body.display_name.trim() : null
    const jlptLevel = typeof body?.jlpt_level === "string" ? body.jlpt_level || null : undefined

    if (displayName !== null && (displayName.length < 1 || displayName.length > 30)) {
        return NextResponse.json({ error: "Tên hiển thị từ 1–30 ký tự" }, { status: 400 })
    }

    const { data: current } = await getProfile(supabase, user.id)
    const newName = displayName ?? current?.display_name ?? ""
    const newLevel = jlptLevel !== undefined ? jlptLevel : (current?.jlpt_level ?? null)

    const { error } = await upsertProfile(supabase, user.id, newName, newLevel)
    if (error) {
        return serverError(error, "PATCH /api/profile")
    }

    return NextResponse.json({ display_name: newName, jlpt_level: newLevel })
}
