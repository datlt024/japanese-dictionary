import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"
import {
    getProfile,
    upsertProfile,
} from "@/server/repositories/community/community.repository"

export const dynamic = "force-dynamic"

export async function GET() {
    // Use the auth client only for the JWT verification (reads cookie).
    // Use the singleton service client for the data query to avoid opening
    // a new PostgREST connection on every request.
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json(null)
    }

    const rl = await rateLimit(`profile-get:${user.id}`, 60, 60_000)
    if (!rl.ok) return rl.response

    const { data } = await getProfile(supabaseServer, user.id)
    return NextResponse.json(data ?? null, {
        headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" },
    })
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

    // Only fetch the current profile when the client omits a field and we need the
    // existing value to avoid overwriting it.  The common case (both fields present)
    // saves one round-trip.
    const needCurrentProfile = displayName === null || jlptLevel === undefined
    const current = needCurrentProfile ? (await getProfile(supabaseServer, user.id)).data : null

    const newName = displayName ?? current?.display_name ?? ""
    const newLevel = jlptLevel !== undefined ? jlptLevel : (current?.jlpt_level ?? null)

    const { error } = await upsertProfile(supabaseServer, user.id, newName, newLevel)
    if (error) {
        return serverError(error, "PATCH /api/profile")
    }

    return NextResponse.json({ display_name: newName, jlpt_level: newLevel })
}
