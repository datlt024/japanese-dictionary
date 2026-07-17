import { NextRequest, NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { deleteComment } from "@/server/repositories/community/community.repository"
import { serverError } from "@/server/utils/api-error"

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

    const { error } = await deleteComment(supabase, id, user.id)
    if (error) {
        return serverError(error, "DELETE /api/comments/[id]")
    }

    return new NextResponse(null, { status: 204 })
}
