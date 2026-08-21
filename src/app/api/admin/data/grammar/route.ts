import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { isAdminUser } from "@/server/utils/admin"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"

export const dynamic = "force-dynamic"

const PAGE_SIZE = 50
const JLPT_VALUES = ["N5", "N4", "N3", "N2", "N1"]

export async function GET(request: NextRequest) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminUser(user)) return NextResponse.json({ error: "Không có quyền" }, { status: 403 })

    const rl = await rateLimit(`admin-data-grammar-get:${user.id}`, 120, 60_000)
    if (!rl.ok) return rl.response

    const { searchParams } = request.nextUrl
    const page = Math.max(0, Number(searchParams.get("page") ?? "0") || 0)
    const q = searchParams.get("q")?.trim() ?? ""
    const jlpt = searchParams.get("jlpt") ?? ""
    const offset = page * PAGE_SIZE

    let query = supabaseServer
        .from("grammars")
        .select("id, pattern, display_pattern, jlpt_level, meaning_vi, short_meaning_vi, explanation_vi, nuance_vi, is_common, ai_status, slug, created_at", { count: "exact" })
        .order("jlpt_level", { ascending: true })
        .order("id", { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1)

    if (q) query = query.or(`pattern.ilike.%${q}%,display_pattern.ilike.%${q}%,meaning_vi.ilike.%${q}%`)
    if (jlpt && JLPT_VALUES.includes(jlpt)) query = query.eq("jlpt_level", jlpt)

    const { data, error, count } = await query
    if (error) return serverError(error, "GET /api/admin/data/grammar")

    return NextResponse.json({ rows: data ?? [], total: count ?? 0, page, has_more: (page + 1) * PAGE_SIZE < (count ?? 0) })
}

export async function POST(request: NextRequest) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminUser(user)) return NextResponse.json({ error: "Không có quyền" }, { status: 403 })

    const rl = await rateLimit(`admin-data-grammar-post:${user.id}`, 10, 60_000)
    if (!rl.ok) return rl.response

    const raw = await request.json().catch(() => null)
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 })
    }
    const body = raw as Record<string, unknown>

    const pattern = typeof body.pattern === "string" ? body.pattern.trim() : ""
    if (!pattern) return NextResponse.json({ error: "pattern là bắt buộc" }, { status: 400 })
    const jlptLevel = typeof body.jlpt_level === "string" && JLPT_VALUES.includes(body.jlpt_level) ? body.jlpt_level : null
    if (!jlptLevel) return NextResponse.json({ error: "jlpt_level không hợp lệ" }, { status: 400 })
    const meaningVi = typeof body.meaning_vi === "string" ? body.meaning_vi.trim() : ""
    if (!meaningVi) return NextResponse.json({ error: "meaning_vi là bắt buộc" }, { status: 400 })
    const slug = typeof body.slug === "string" ? body.slug.trim() : ""
    if (!slug) return NextResponse.json({ error: "slug là bắt buộc" }, { status: 400 })
    const sourceId = `admin_${Date.now()}`

    const { data, error } = await supabaseServer
        .from("grammars")
        .insert({
            pattern,
            display_pattern: typeof body.display_pattern === "string" ? body.display_pattern.trim() || null : null,
            jlpt_level: jlptLevel,
            meaning_vi: meaningVi,
            short_meaning_vi: typeof body.short_meaning_vi === "string" ? body.short_meaning_vi.trim() || null : null,
            explanation_vi: typeof body.explanation_vi === "string" ? body.explanation_vi.trim() || null : null,
            nuance_vi: typeof body.nuance_vi === "string" ? body.nuance_vi.trim() || null : null,
            is_common: typeof body.is_common === "boolean" ? body.is_common : false,
            slug,
            source_id: sourceId,
            special_cases: [],
        })
        .select("id, pattern, display_pattern, jlpt_level, meaning_vi, short_meaning_vi, explanation_vi, nuance_vi, is_common, ai_status, slug, created_at")
        .single()

    if (error) return serverError(error, "POST /api/admin/data/grammar")
    return NextResponse.json(data, { status: 201 })
}
