import { type NextRequest, NextResponse } from "next/server"
import type { User } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { isAdminUser } from "@/server/utils/admin"
import { serverError } from "@/server/utils/api-error"

async function requireAdmin() {
    const authClient = await createSupabaseServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user || !isAdminUser(user)) return null
    return user
}

export async function GET() {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })

    // Fetch all auth users across pages (Supabase caps perPage at 1000)
    const allAuthUsers: User[] = []
    let page = 1
    while (true) {
        const { data, error } = await supabaseServer.auth.admin.listUsers({ perPage: 1000, page })
        if (error) return serverError(error, "GET /api/admin/users auth")
        allAuthUsers.push(...(data.users ?? []))
        if ((data.users ?? []).length < 1000) break
        page++
    }

    const profileResult = await supabaseServer
        .from("user_profiles")
        .select("id, display_name, jlpt_level, streak_count, created_at")

    if (profileResult.error) return serverError(profileResult.error, "GET /api/admin/users profiles")

    const profileMap = new Map((profileResult.data ?? []).map(p => [p.id, p]))

    const users = allAuthUsers.map(au => {
        const profile = profileMap.get(au.id)
        return {
            id: au.id,
            email: au.email ?? null,
            phone: au.phone ?? null,
            display_name: profile?.display_name ?? "—",
            jlpt_level: profile?.jlpt_level ?? null,
            streak_count: profile?.streak_count ?? 0,
            created_at: au.created_at,
            last_sign_in_at: au.last_sign_in_at ?? null,
            email_confirmed_at: au.email_confirmed_at ?? null,
            role: (au.app_metadata?.role as string | undefined) ?? "free",
            subscription_until: (au.app_metadata?.subscription_until as string | undefined) ?? null,
        }
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({ users })
}

export async function POST(request: NextRequest) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })

    const body = await request.json().catch(() => null)
    const email = typeof body?.email === "string" ? body.email.trim() : ""
    const password = typeof body?.password === "string" ? body.password : ""
    const role = typeof body?.role === "string" ? body.role : "free"

    if (!email) return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: "Mật khẩu tối thiểu 8 ký tự" }, { status: 400 })

    const { data, error } = await supabaseServer.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { role },
    })
    if (error) return serverError(error, "POST /api/admin/users create")

    return NextResponse.json({ ok: true, id: data.user?.id })
}
