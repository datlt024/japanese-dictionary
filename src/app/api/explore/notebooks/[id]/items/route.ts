import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/server/supabase/server"
import { enrichItems } from "@/server/services/notebook/enrich-items.service"
import { serverError } from "@/server/utils/api-error"
import type { NotebookItem } from "@/domain/notebook/notebook.type"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
    const { id } = await params

    // Verify notebook is public (service role can read all, but we enforce is_public check)
    const { data: nb, error: nbError } = await supabaseServer
        .from("notebooks")
        .select("id")
        .eq("id", id)
        .eq("is_public", true)
        .maybeSingle()

    if (nbError) return serverError(nbError, "GET /api/explore/notebooks/[id]/items")
    if (!nb) return NextResponse.json({ error: "Sổ tay không tồn tại hoặc không công khai" }, { status: 404 })

    const { data, error } = await supabaseServer
        .from("notebook_items")
        .select("*")
        .eq("notebook_id", id)
        .order("added_at", { ascending: true })

    if (error) return serverError(error, "GET /api/explore/notebooks/[id]/items")

    const enriched = await enrichItems((data ?? []) as NotebookItem[])
    return NextResponse.json(enriched)
}
