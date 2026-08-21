import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { isAdminUser } from "@/server/utils/admin"

export async function GET() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ isAdmin: false })
    return NextResponse.json({ isAdmin: isAdminUser(user) })
}
