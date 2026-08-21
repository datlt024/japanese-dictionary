import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { isAdminUser } from "@/server/utils/admin"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminUser(user)) return NextResponse.json({ error: "Không có quyền" }, { status: 403 })

    const rl = await rateLimit(`admin-data-kanji-patch:${user.id}`, 60, 60_000)
    if (!rl.ok) return rl.response

    const { id } = await params
    const kanjiId = Number(id)
    if (!Number.isInteger(kanjiId) || kanjiId <= 0) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 })

    const raw = await request.json().catch(() => null)
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 })
    }
    const body = raw as Record<string, unknown>

    const patch: Record<string, unknown> = {}
    if ("kanji" in body) {
        const v = typeof body.kanji === "string" ? body.kanji.trim() : ""
        if (!v) return NextResponse.json({ error: "kanji không được trống" }, { status: 400 })
        patch.kanji = v
    }
    if ("meaning_vi" in body)  patch.meaning_vi  = typeof body.meaning_vi  === "string" ? body.meaning_vi.trim()  || null : null
    if ("meaning_en" in body)  patch.meaning_en  = typeof body.meaning_en  === "string" ? body.meaning_en.trim()  || null : null
    if ("onyomi"    in body)   patch.onyomi      = typeof body.onyomi      === "string" ? body.onyomi.trim()      || null : null
    if ("kunyomi"   in body)   patch.kunyomi     = typeof body.kunyomi     === "string" ? body.kunyomi.trim()     || null : null
    if ("han_viet"  in body)   patch.han_viet    = typeof body.han_viet    === "string" ? body.han_viet.trim()    || null : null
    if ("memory_tip" in body)  patch.memory_tip  = typeof body.memory_tip  === "string" ? body.memory_tip.trim()  || null : null
    if ("jlpt" in body) {
        const v = typeof body.jlpt === "number" ? body.jlpt : null
        patch.jlpt = v !== null && Number.isInteger(v) && v >= 1 && v <= 5 ? v : null
    }
    if ("stroke_count" in body) {
        const v = typeof body.stroke_count === "number" ? body.stroke_count : null
        patch.stroke_count = v !== null && Number.isInteger(v) && v > 0 ? v : null
    }

    if (Object.keys(patch).length === 0) return NextResponse.json({ error: "Không có trường nào để cập nhật" }, { status: 400 })

    const { data, error } = await supabaseServer
        .from("kanjis")
        .update(patch)
        .eq("id", kanjiId)
        .select("id, kanji, meaning_vi, meaning_en, onyomi, kunyomi, han_viet, jlpt, stroke_count, created_at")
        .single()

    if (error) return serverError(error, `PATCH /api/admin/data/kanji/${id}`)
    return NextResponse.json(data)
}

export async function DELETE(_request: NextRequest, { params }: Params) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminUser(user)) return NextResponse.json({ error: "Không có quyền" }, { status: 403 })

    const rl = await rateLimit(`admin-data-kanji-delete:${user.id}`, 10, 60_000)
    if (!rl.ok) return rl.response

    const { id } = await params
    const kanjiId = Number(id)
    if (!Number.isInteger(kanjiId) || kanjiId <= 0) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 })

    const { error } = await supabaseServer.from("kanjis").delete().eq("id", kanjiId)
    if (error) return serverError(error, `DELETE /api/admin/data/kanji/${id}`)
    return new NextResponse(null, { status: 204 })
}
