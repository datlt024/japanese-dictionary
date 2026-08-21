import { NextRequest, NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { supabaseAdmin } from "@/server/supabase/server"
import { enrichItems } from "@/server/services/notebook/enrich-items.service"
import { serverError } from "@/server/utils/api-error"
import { getClientIp, rateLimit } from "@/shared/utils/rate-limit"
import type { NotebookItem } from "@/domain/notebook/notebook.type"

type Params = { params: Promise<{ id: string }> }

// Cache the full response (access check + items + enrichment) per notebook id.
// Public notebook content changes infrequently; 10-minute cache with 1-hour SWR is safe.
// Tags allow per-notebook cache invalidation when visibility is toggled via admin.
function getCachedNotebookItems(notebookId: string) {
    return unstable_cache(
        async () => {
            const { data: nb } = await supabaseAdmin
                .from("notebooks")
                .select("is_public")
                .eq("id", notebookId)
                .maybeSingle()

            if (!nb?.is_public) return null

            const { data, error } = await supabaseAdmin
                .from("notebook_items")
                .select("id, notebook_id, item_type, item_id, added_at")
                .eq("notebook_id", notebookId)
                .order("added_at", { ascending: true })
                .limit(200)

            if (error) throw error

            return enrichItems((data ?? []) as NotebookItem[])
        },
        [`explore-notebook-items-${notebookId}`],
        { revalidate: 600, tags: [`explore-notebook-items-${notebookId}`] }
    )
}

export async function GET(req: NextRequest, { params }: Params) {
    const rl = await rateLimit(`explore-items:${getClientIp(req)}`, 60, 60_000)
    if (!rl.ok) return rl.response

    const { id } = await params

    let enriched: Awaited<ReturnType<typeof enrichItems>> | null
    try {
        enriched = await getCachedNotebookItems(id)()
    } catch (err) {
        return serverError(err, "GET /api/explore/notebooks/[id]/items")
    }

    if (enriched === null) {
        return NextResponse.json(
            { error: "Sổ tay không tồn tại hoặc không công khai" },
            { status: 404 }
        )
    }

    return NextResponse.json(enriched, {
        headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
    })
}
