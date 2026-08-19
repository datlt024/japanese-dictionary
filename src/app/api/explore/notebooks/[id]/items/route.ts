import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/server/supabase/admin"
import { enrichItems } from "@/server/services/notebook/enrich-items.service"
import { serverError } from "@/server/utils/api-error"
import { getClientIp, rateLimit } from "@/shared/utils/rate-limit"
import type { NotebookItem } from "@/domain/notebook/notebook.type"

type Params = { params: Promise<{ id: string }> }

async function isNotebookAccessible(notebookId: string): Promise<boolean> {
    // Single query: check is_public and group_id together
    const { data: nb } = await supabaseAdmin
        .from("notebooks")
        .select("is_public, group_id")
        .eq("id", notebookId)
        .maybeSingle()

    if (!nb) return false
    if (nb.is_public) return true
    if (!nb.group_id) return false

    const { data: group } = await supabaseAdmin
        .from("notebook_groups")
        .select("is_public")
        .eq("id", nb.group_id)
        .eq("is_public", true)
        .maybeSingle()

    return !!group
}

export async function GET(req: NextRequest, { params }: Params) {
    const rl = await rateLimit(`explore-items:${getClientIp(req)}`, 60, 60_000)
    if (!rl.ok) return rl.response

    const { id } = await params

    const accessible = await isNotebookAccessible(id)
    if (!accessible) {
        return NextResponse.json(
            { error: "Sổ tay không tồn tại hoặc không công khai" },
            { status: 404 }
        )
    }

    const { data, error } = await supabaseAdmin
        .from("notebook_items")
        .select("id, notebook_id, item_type, item_id, added_at")
        .eq("notebook_id", id)
        .order("added_at", { ascending: true })

    if (error) return serverError(error, "GET /api/explore/notebooks/[id]/items")

    const enriched = await enrichItems((data ?? []) as NotebookItem[])
    return NextResponse.json(enriched, {
        headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
    })
}
