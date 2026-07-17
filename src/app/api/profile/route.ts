import { NextRequest, NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import {
    getProfile,
    upsertProfile,
} from "@/server/repositories/community/community.repository"

export async function GET() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json(null)
    }

    const { data } = await getProfile(supabase, user.id)
    return NextResponse.json(data ?? null)
}

export async function PATCH(request: NextRequest) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

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
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ display_name: newName, jlpt_level: newLevel })
}
