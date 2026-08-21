import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { isAdminUser } from "@/server/utils/admin"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"

export const dynamic = "force-dynamic"

const PAGE_SIZE = 50

export async function GET(request: NextRequest) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminUser(user)) return NextResponse.json({ error: "Không có quyền" }, { status: 403 })

    const rl = await rateLimit(`admin-data-kanji-get:${user.id}`, 120, 60_000)
    if (!rl.ok) return rl.response

    const { searchParams } = request.nextUrl
    const page = Math.max(0, Number(searchParams.get("page") ?? "0") || 0)
    const q = searchParams.get("q")?.trim() ?? ""
    const jlpt = searchParams.get("jlpt") ?? ""
    const offset = page * PAGE_SIZE

    let query = supabaseServer
        .from("kanjis")
        .select("id, kanji, meaning_vi, meaning_en, onyomi, kunyomi, han_viet, jlpt, stroke_count, created_at", { count: "exact" })
        .order("jlpt", { ascending: true, nullsFirst: false })
        .order("id", { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1)

    if (q) query = query.or(`kanji.ilike.%${q}%,meaning_vi.ilike.%${q}%,meaning_en.ilike.%${q}%,han_viet.ilike.%${q}%,onyomi.ilike.%${q}%,kunyomi.ilike.%${q}%`)
    const jlptNum = Number(jlpt)
    if (jlpt && Number.isInteger(jlptNum) && jlptNum >= 1 && jlptNum <= 5) query = query.eq("jlpt", jlptNum)

    const { data, error, count } = await query
    if (error) return serverError(error, "GET /api/admin/data/kanji")

    return NextResponse.json({ rows: data ?? [], total: count ?? 0, page, has_more: (page + 1) * PAGE_SIZE < (count ?? 0) })
}

export async function POST(request: NextRequest) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminUser(user)) return NextResponse.json({ error: "Không có quyền" }, { status: 403 })

    const rl = await rateLimit(`admin-data-kanji-post:${user.id}`, 10, 60_000)
    if (!rl.ok) return rl.response

    const raw = await request.json().catch(() => null)
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 })
    }
    const body = raw as Record<string, unknown>

    const kanji = typeof body.kanji === "string" ? body.kanji.trim() : ""
    if (!kanji) return NextResponse.json({ error: "kanji là bắt buộc" }, { status: 400 })

    const jlptNum = typeof body.jlpt === "number" ? body.jlpt : null
    const jlpt = jlptNum !== null && Number.isInteger(jlptNum) && jlptNum >= 1 && jlptNum <= 5 ? jlptNum : null

    const { data, error } = await supabaseServer
        .from("kanjis")
        .insert({
            kanji,
            meaning_vi: typeof body.meaning_vi === "string" ? body.meaning_vi.trim() || null : null,
            meaning_en: typeof body.meaning_en === "string" ? body.meaning_en.trim() || null : null,
            onyomi: typeof body.onyomi === "string" ? body.onyomi.trim() || null : null,
            kunyomi: typeof body.kunyomi === "string" ? body.kunyomi.trim() || null : null,
            han_viet: typeof body.han_viet === "string" ? body.han_viet.trim() || null : null,
            jlpt,
            stroke_count: typeof body.stroke_count === "number" ? body.stroke_count : null,
            memory_tip: typeof body.memory_tip === "string" ? body.memory_tip.trim() || null : null,
        })
        .select("id, kanji, meaning_vi, meaning_en, onyomi, kunyomi, han_viet, jlpt, stroke_count, created_at")
        .single()

    if (error) return serverError(error, "POST /api/admin/data/kanji")
    return NextResponse.json(data, { status: 201 })
}
