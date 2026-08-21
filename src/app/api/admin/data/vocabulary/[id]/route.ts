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

    const rl = await rateLimit(`admin-data-vocab-patch:${user.id}`, 60, 60_000)
    if (!rl.ok) return rl.response

    const { id } = await params
    const vocabId = Number(id)
    if (!Number.isInteger(vocabId) || vocabId <= 0) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 })

    const raw = await request.json().catch(() => null)
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 })
    }
    const body = raw as Record<string, unknown>

    const patch: Record<string, unknown> = {}
    if ("primary_word" in body) {
        const v = typeof body.primary_word === "string" ? body.primary_word.trim() : ""
        if (!v) return NextResponse.json({ error: "primary_word không được trống" }, { status: 400 })
        patch.primary_word = v
    }
    if ("primary_kana" in body) patch.primary_kana = typeof body.primary_kana === "string" ? body.primary_kana.trim() || null : null
    if ("romaji" in body) patch.romaji = typeof body.romaji === "string" ? body.romaji.trim() || null : null
    if ("jlpt" in body) patch.jlpt = typeof body.jlpt === "string" && JLPT_VALUES.includes(body.jlpt) ? body.jlpt : null
    if ("is_common" in body) patch.is_common = typeof body.is_common === "boolean" ? body.is_common : false
    if ("verb_group" in body) patch.verb_group = typeof body.verb_group === "string" ? body.verb_group.trim() || null : null

    const sensesUpsert = Array.isArray(body.senses_upsert) ? body.senses_upsert as { id?: number; meaning_vi: string; meaning_en?: string | null }[] : null
    const sensesDelete = Array.isArray(body.senses_delete) ? (body.senses_delete as unknown[]).filter(x => typeof x === "number") as number[] : null

    if (Object.keys(patch).length === 0 && !sensesUpsert && !sensesDelete) {
        return NextResponse.json({ error: "Không có trường nào để cập nhật" }, { status: 400 })
    }

    let vocabData = null
    if (Object.keys(patch).length > 0) {
        const { data, error } = await supabaseServer
            .from("vocabularies")
            .update(patch)
            .eq("id", vocabId)
            .select("id, primary_word, primary_kana, romaji, jlpt, is_common, verb_group, created_at")
            .single()
        if (error) return serverError(error, `PATCH /api/admin/data/vocabulary/${id}`)
        vocabData = data
    } else {
        const { data, error } = await supabaseServer
            .from("vocabularies")
            .select("id, primary_word, primary_kana, romaji, jlpt, is_common, verb_group, created_at")
            .eq("id", vocabId)
            .single()
        if (error) return serverError(error, `PATCH /api/admin/data/vocabulary/${id}`)
        vocabData = data
    }

    if (sensesDelete && sensesDelete.length > 0) {
        const { error } = await supabaseServer
            .from("vocabulary_senses")
            .delete()
            .in("id", sensesDelete)
            .eq("vocabulary_id", vocabId)
        if (error) return serverError(error, `PATCH /api/admin/data/vocabulary/${id} senses_delete`)
    }

    if (sensesUpsert && sensesUpsert.length > 0) {
        const toInsert = sensesUpsert.filter(s => !s.id)
        const toUpdate = sensesUpsert.filter(s => s.id)

        if (toInsert.length > 0) {
            const maxIdx = await supabaseServer
                .from("vocabulary_senses")
                .select("sense_index")
                .eq("vocabulary_id", vocabId)
                .order("sense_index", { ascending: false })
                .limit(1)
                .single()
            const nextIdx = (maxIdx.data?.sense_index ?? -1) + 1

            const { error } = await supabaseServer.from("vocabulary_senses").insert(
                toInsert.map((s, i) => ({
                    vocabulary_id: vocabId,
                    meaning_vi: s.meaning_vi.trim() || null,
                    meaning_en: s.meaning_en?.trim() || null,
                    sense_index: nextIdx + i,
                }))
            )
            if (error) return serverError(error, `PATCH /api/admin/data/vocabulary/${id} senses_insert`)
        }

        for (const s of toUpdate) {
            const { error } = await supabaseServer
                .from("vocabulary_senses")
                .update({ meaning_vi: s.meaning_vi.trim() || null, meaning_en: s.meaning_en?.trim() || null })
                .eq("id", s.id!)
                .eq("vocabulary_id", vocabId)
            if (error) return serverError(error, `PATCH /api/admin/data/vocabulary/${id} senses_update`)
        }
    }

    const { data: senses } = await supabaseServer
        .from("vocabulary_senses")
        .select("id, meaning_vi, meaning_en, sense_index")
        .eq("vocabulary_id", vocabId)
        .order("sense_index", { ascending: true })

    return NextResponse.json({ ...vocabData, vocabulary_senses: senses ?? [] })
}

export async function DELETE(_request: NextRequest, { params }: Params) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminUser(user)) return NextResponse.json({ error: "Không có quyền" }, { status: 403 })

    const rl = await rateLimit(`admin-data-vocab-delete:${user.id}`, 20, 60_000)
    if (!rl.ok) return rl.response

    const { id } = await params
    const vocabId = Number(id)
    if (!Number.isInteger(vocabId) || vocabId <= 0) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 })

    const { error } = await supabaseServer.from("vocabularies").delete().eq("id", vocabId)
    if (error) return serverError(error, `DELETE /api/admin/data/vocabulary/${id}`)
    return new NextResponse(null, { status: 204 })
}
