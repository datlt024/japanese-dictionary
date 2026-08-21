import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { deleteComment } from "@/server/repositories/community/community.repository"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"

export const dynamic = "force-dynamic"

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 })
    }

    const rl = await rateLimit(`comments-del:${user.id}`, 20, 60_000)
    if (!rl.ok) return rl.response

    const { data, error } = await deleteComment(supabaseServer, id, user.id)
    if (error) return serverError(error, "DELETE /api/comments/[id]")
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return NextResponse.json({ error: "Bình luận không tồn tại" }, { status: 404 })
    }

    revalidateTag("public-comments")
    return new NextResponse(null, { status: 204 })
}
