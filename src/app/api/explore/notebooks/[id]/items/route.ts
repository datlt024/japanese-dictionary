import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/server/supabase/admin"
import { enrichItems } from "@/server/services/notebook/enrich-items.service"
import { serverError } from "@/server/utils/api-error"
import type { NotebookItem } from "@/domain/notebook/notebook.type"

type Params = { params: Promise<{ id: string }> }

async function isNotebookAccessible(notebookId: string): Promise<boolean> {
    // Accessible if individually public
    const { data: directPublic } = await supabaseAdmin
        .from("notebooks")
        .select("id")
        .eq("id", notebookId)
        .eq("is_public", true)
        .maybeSingle()

    if (directPublic) return true

    // Or if it belongs to a public group
    const { data: nb } = await supabaseAdmin
        .from("notebooks")
        .select("group_id")
        .eq("id", notebookId)
        .maybeSingle()

    if (!nb?.group_id) return false

    const { data: group } = await supabaseAdmin
        .from("notebook_groups")
        .select("id")
        .eq("id", nb.group_id)
        .eq("is_public", true)
        .maybeSingle()

    return !!group
}

export async function GET(_req: NextRequest, { params }: Params) {
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
        .select("*")
        .eq("notebook_id", id)
        .order("added_at", { ascending: true })

    if (error) return serverError(error, "GET /api/explore/notebooks/[id]/items")

    const enriched = await enrichItems((data ?? []) as NotebookItem[])
    return NextResponse.json(enriched)
}
