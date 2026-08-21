import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"
import {
    addNotebookItem,
    listNotebookItems,
    removeNotebookItem,
} from "@/server/repositories/notebook/notebook-items.repository"
import { enrichItems } from "@/server/services/notebook/enrich-items.service"
import type {
    NotebookItem,
    NotebookItemType,
} from "@/domain/notebook/notebook.type"

export const dynamic = "force-dynamic"

const VALID_ITEM_TYPES: NotebookItemType[] = ["vocabulary", "kanji", "grammar"]

function isValidItemType(value: unknown): value is NotebookItemType {
    return VALID_ITEM_TYPES.includes(value as NotebookItemType)
}

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
    const { id } = await params

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const rl = await rateLimit(`nb-items-get:${user.id}`, 60, 60_000)
    if (!rl.ok) return rl.response

    const { data, error } = await listNotebookItems(supabaseServer, id, user.id)

    if (error) {
        return serverError(error, "GET /api/notebooks/[id]/items")
    }

    const enriched = await enrichItems((data ?? []) as NotebookItem[])

    return NextResponse.json(enriched)
}

export async function POST(request: NextRequest, { params }: Params) {
    const { id } = await params

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const rl = await rateLimit(`nb-items-write:${user.id}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const body = await request.json().catch(() => null)
    const itemType = body?.item_type
    const itemId = typeof body?.item_id === "string" ? body.item_id.trim() : ""

    if (!isValidItemType(itemType)) {
        return NextResponse.json({ error: "item_type không hợp lệ" }, { status: 400 })
    }

    if (!itemId) {
        return NextResponse.json({ error: "item_id không được để trống" }, { status: 400 })
    }

    const { data: nb } = await supabaseServer
        .from("notebooks")
        .select("id")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle()

    if (!nb) {
        return NextResponse.json({ error: "Sổ tay không tồn tại" }, { status: 404 })
    }

    const { data, error } = await addNotebookItem(supabaseServer, id, user.id, itemType, itemId)

    if (error) {
        // Unique constraint violation = item đã tồn tại
        if (error.code === "23505") {
            return NextResponse.json({ error: "Mục này đã có trong sổ tay" }, { status: 409 })
        }
        return serverError(error, "POST /api/notebooks/[id]/items")
    }

    return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const { id } = await params

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const rl = await rateLimit(`nb-items-write:${user.id}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const body = await request.json().catch(() => null)
    const itemType = body?.item_type
    const itemId = typeof body?.item_id === "string" ? body.item_id.trim() : ""

    if (!isValidItemType(itemType)) {
        return NextResponse.json({ error: "item_type không hợp lệ" }, { status: 400 })
    }

    if (!itemId) {
        return NextResponse.json({ error: "item_id không được để trống" }, { status: 400 })
    }

    const { error } = await removeNotebookItem(supabaseServer, id, user.id, itemType, itemId)

    if (error) {
        return serverError(error, "DELETE /api/notebooks/[id]/items")
    }

    return new NextResponse(null, { status: 204 })
}
