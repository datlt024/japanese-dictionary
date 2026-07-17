import { NextRequest, NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { checkItemInNotebooks } from "@/server/repositories/notebook/notebook-items.repository"
import { rateLimit } from "@/shared/utils/rate-limit"
import type { NotebookItemType } from "@/domain/notebook/notebook.type"

const VALID_ITEM_TYPES: NotebookItemType[] = ["vocabulary", "kanji", "grammar"]

function isValidItemType(value: unknown): value is NotebookItemType {
    return VALID_ITEM_TYPES.includes(value as NotebookItemType)
}

// GET /api/notebooks/check?type=vocabulary&id=12345
// Returns: { notebookIds: string[] }
export async function GET(request: NextRequest) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ notebookIds: [] })
    }

    const rl = rateLimit(`nb-check:${user.id}`, 120, 60_000)
    if (!rl.ok) return NextResponse.json({ notebookIds: [] })

    const itemType = request.nextUrl.searchParams.get("type")
    const itemId = request.nextUrl.searchParams.get("id")?.trim() ?? ""

    if (!isValidItemType(itemType) || !itemId) {
        return NextResponse.json({ notebookIds: [] })
    }

    const { data, error } = await checkItemInNotebooks(supabase, user.id, itemType, itemId)

    if (error || !data) {
        return NextResponse.json({ notebookIds: [] })
    }

    return NextResponse.json({ notebookIds: data.map((row) => row.notebook_id) })
}
