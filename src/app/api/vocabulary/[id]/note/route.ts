import { NextRequest, NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { serverError } from "@/server/utils/api-error"
import { getClientIp, rateLimit } from "@/shared/utils/rate-limit"

type RouteContext = { params: Promise<{ id: string }> }

function parseVocabularyId(id: string) {
    const n = Number(id)
    return Number.isInteger(n) && n > 0 ? n : null
}

export async function GET(
    _request: NextRequest,
    { params }: RouteContext
) {
    const { id } = await params
    const vocabularyId = parseVocabularyId(id)

    if (!vocabularyId) {
        return NextResponse.json({ error: "id không hợp lệ" }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ note: null })
    }

    const { data, error } = await supabase
        .from("user_vocabulary_notes")
        .select("note_text, updated_at")
        .eq("user_id", user.id)
        .eq("vocabulary_id", vocabularyId)
        .maybeSingle()

    if (error) {
        return serverError(error, "GET /api/vocabulary/[id]/note")
    }

    return NextResponse.json({ note: data ?? null })
}

export async function PUT(
    request: NextRequest,
    { params }: RouteContext
) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Cần đăng nhập để lưu ghi chú" }, { status: 401 })
    }

    const ip = getClientIp(request)
    const rl = rateLimit(`note-put:${user.id}:${ip}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const { id } = await params
    const vocabularyId = parseVocabularyId(id)

    if (!vocabularyId) {
        return NextResponse.json({ error: "id không hợp lệ" }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    const noteText = typeof body?.note_text === "string" ? body.note_text.trim() : ""

    if (noteText.length > 2000) {
        return NextResponse.json({ error: "Ghi chú tối đa 2000 ký tự" }, { status: 400 })
    }

    const { data, error } = await supabase
        .from("user_vocabulary_notes")
        .upsert(
            {
                user_id: user.id,
                vocabulary_id: vocabularyId,
                note_text: noteText,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,vocabulary_id" }
        )
        .select("note_text, updated_at")
        .single()

    if (error) {
        return serverError(error, "PUT /api/vocabulary/[id]/note")
    }

    return NextResponse.json(data)
}

export async function DELETE(
    _request: NextRequest,
    { params }: RouteContext
) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 })
    }

    const { id } = await params
    const vocabularyId = parseVocabularyId(id)

    if (!vocabularyId) {
        return NextResponse.json({ error: "id không hợp lệ" }, { status: 400 })
    }

    const { error } = await supabase
        .from("user_vocabulary_notes")
        .delete()
        .eq("user_id", user.id)
        .eq("vocabulary_id", vocabularyId)

    if (error) {
        return serverError(error, "DELETE /api/vocabulary/[id]/note")
    }

    return NextResponse.json({ ok: true })
}
