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

    const rl = await rateLimit(`admin-data-vocab-get:${user.id}`, 120, 60_000)
    if (!rl.ok) return rl.response

    const { searchParams } = request.nextUrl
    const page = Math.max(0, Number(searchParams.get("page") ?? "0") || 0)
    const q = searchParams.get("q")?.trim() ?? ""
    const jlpt = searchParams.get("jlpt") ?? ""
    const offset = page * PAGE_SIZE

    let query = supabaseServer
        .from("vocabularies")
        .select("id, primary_word, primary_kana, romaji, jlpt, is_common, verb_group, created_at", { count: "exact" })
        .order("id", { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1)

    if (q) query = query.or(`primary_word.ilike.%${q}%,primary_kana.ilike.%${q}%,romaji.ilike.%${q}%`)
    if (jlpt && JLPT_VALUES.includes(jlpt)) query = query.eq("jlpt", jlpt)

    const { data, error, count } = await query
    if (error) return serverError(error, "GET /api/admin/data/vocabulary")

    return NextResponse.json({ rows: data ?? [], total: count ?? 0, page, has_more: (page + 1) * PAGE_SIZE < (count ?? 0) })
}

export async function POST(request: NextRequest) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminUser(user)) return NextResponse.json({ error: "Không có quyền" }, { status: 403 })

    const rl = await rateLimit(`admin-data-vocab-post:${user.id}`, 20, 60_000)
    if (!rl.ok) return rl.response

    const raw = await request.json().catch(() => null)
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 })
    }
    const body = raw as Record<string, unknown>

    const primaryWord = typeof body.primary_word === "string" ? body.primary_word.trim() : ""
    if (!primaryWord) return NextResponse.json({ error: "primary_word là bắt buộc" }, { status: 400 })

    const { data, error } = await supabaseServer
        .from("vocabularies")
        .insert({
            primary_word: primaryWord,
            primary_kana: typeof body.primary_kana === "string" ? body.primary_kana.trim() || null : null,
            romaji: typeof body.romaji === "string" ? body.romaji.trim() || null : null,
            jlpt: typeof body.jlpt === "string" && JLPT_VALUES.includes(body.jlpt) ? body.jlpt : null,
            is_common: typeof body.is_common === "boolean" ? body.is_common : false,
            verb_group: typeof body.verb_group === "string" ? body.verb_group.trim() || null : null,
        })
        .select("id, primary_word, primary_kana, romaji, jlpt, is_common, verb_group, created_at")
        .single()

    if (error) return serverError(error, "POST /api/admin/data/vocabulary")
    return NextResponse.json(data, { status: 201 })
}
