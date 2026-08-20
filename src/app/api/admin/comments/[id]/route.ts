import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { isAdminUser } from "@/server/utils/admin"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
    const { id } = await params
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdminUser(user)) {
        return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })
    }

    const rl = await rateLimit(`admin-comment-del:${user.id}`, 30, 60_000)
    if (!rl.ok) return rl.response

    // Admin can delete any comment regardless of user_id
    const { data, error } = await supabaseServer
        .from("word_comments")
        .delete()
        .eq("id", id)
        .select("id")

    if (error) return serverError(error, "DELETE /api/admin/comments/[id]")
    if (!data || data.length === 0) {
        return NextResponse.json({ error: "Bình luận không tồn tại" }, { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
}
