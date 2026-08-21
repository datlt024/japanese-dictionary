import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { isAdminUser } from "@/server/utils/admin"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"

type Params = { params: Promise<{ id: string }> }

const JLPT_VALUES = ["N5", "N4", "N3", "N2", "N1"]

export async function PATCH(request: NextRequest, { params }: Params) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminUser(user)) return NextResponse.json({ error: "Không có quyền" }, { status: 403 })

    const rl = await rateLimit(`admin-data-grammar-patch:${user.id}`, 60, 60_000)
    if (!rl.ok) return rl.response

    const { id } = await params
    const grammarId = Number(id)
    if (!Number.isInteger(grammarId) || grammarId <= 0) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 })

    const raw = await request.json().catch(() => null)
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 })
    }
    const body = raw as Record<string, unknown>

    const patch: Record<string, unknown> = {}
    if ("pattern" in body) {
        const v = typeof body.pattern === "string" ? body.pattern.trim() : ""
        if (!v) return NextResponse.json({ error: "pattern không được trống" }, { status: 400 })
        patch.pattern = v
    }
    if ("display_pattern" in body) patch.display_pattern = typeof body.display_pattern === "string" ? body.display_pattern.trim() || null : null
    if ("jlpt_level" in body) {
        if (typeof body.jlpt_level !== "string" || !JLPT_VALUES.includes(body.jlpt_level)) {
            return NextResponse.json({ error: "jlpt_level không hợp lệ" }, { status: 400 })
        }
        patch.jlpt_level = body.jlpt_level
    }
    if ("meaning_vi" in body) {
        const v = typeof body.meaning_vi === "string" ? body.meaning_vi.trim() : ""
        if (!v) return NextResponse.json({ error: "meaning_vi không được trống" }, { status: 400 })
        patch.meaning_vi = v
    }
    if ("short_meaning_vi" in body) patch.short_meaning_vi = typeof body.short_meaning_vi === "string" ? body.short_meaning_vi.trim() || null : null
    if ("explanation_vi" in body) patch.explanation_vi = typeof body.explanation_vi === "string" ? body.explanation_vi.trim() || null : null
    if ("nuance_vi" in body) patch.nuance_vi = typeof body.nuance_vi === "string" ? body.nuance_vi.trim() || null : null
    if ("is_common" in body) patch.is_common = typeof body.is_common === "boolean" ? body.is_common : false
    if ("slug" in body) {
        const v = typeof body.slug === "string" ? body.slug.trim() : ""
        if (!v) return NextResponse.json({ error: "slug không được trống" }, { status: 400 })
        patch.slug = v
    }

    if (Object.keys(patch).length === 0) return NextResponse.json({ error: "Không có trường nào để cập nhật" }, { status: 400 })

    const { data, error } = await supabaseServer
        .from("grammars")
        .update(patch)
        .eq("id", grammarId)
        .select("id, pattern, display_pattern, jlpt_level, meaning_vi, short_meaning_vi, explanation_vi, nuance_vi, is_common, ai_status, slug, created_at")
        .single()

    if (error) return serverError(error, `PATCH /api/admin/data/grammar/${id}`)
    return NextResponse.json(data)
}

export async function DELETE(_request: NextRequest, { params }: Params) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminUser(user)) return NextResponse.json({ error: "Không có quyền" }, { status: 403 })

    const rl = await rateLimit(`admin-data-grammar-delete:${user.id}`, 10, 60_000)
    if (!rl.ok) return rl.response

    const { id } = await params
    const grammarId = Number(id)
    if (!Number.isInteger(grammarId) || grammarId <= 0) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 })

    const { error } = await supabaseServer.from("grammars").delete().eq("id", grammarId)
    if (error) return serverError(error, `DELETE /api/admin/data/grammar/${id}`)
    return new NextResponse(null, { status: 204 })
}
