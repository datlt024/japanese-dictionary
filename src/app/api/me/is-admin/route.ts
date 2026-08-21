import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { isAdminUser } from "@/server/utils/admin"
import { getClientIp, rateLimit } from "@/shared/utils/rate-limit"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    const ip = getClientIp(request)
    const rl = await rateLimit(`is-admin:${ip}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ isAdmin: false })
    return NextResponse.json({ isAdmin: isAdminUser(user) })
}
