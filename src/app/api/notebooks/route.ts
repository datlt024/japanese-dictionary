import { NextRequest, NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import {
    createNotebook,
    listNotebooksWithItemCount,
} from "@/server/repositories/notebook/notebook.repository"

export async function GET() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const { data, error } = await listNotebooksWithItemCount(supabase)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const transformed = (data as unknown as Array<{
        id: string
        name: string
        description: string | null
        created_at: string
        updated_at: string
        notebook_items: { count: number }[]
    }> ?? []).map((nb) => ({
        id: nb.id,
        name: nb.name,
        description: nb.description,
        created_at: nb.created_at,
        updated_at: nb.updated_at,
        item_count: nb.notebook_items?.[0]?.count ?? 0,
    }))

    return NextResponse.json(transformed)
}

export async function POST(request: NextRequest) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const name = typeof body?.name === "string" ? body.name.trim() : ""

    if (!name) {
        return NextResponse.json({ error: "Tên sổ tay không được để trống" }, { status: 400 })
    }

    const description = typeof body?.description === "string"
        ? body.description.trim() || null
        : null

    const { data, error } = await createNotebook(supabase, user.id, name, description ?? undefined)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}
