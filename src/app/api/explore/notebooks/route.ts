import { unstable_cache } from "next/cache"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/server/supabase/admin"
import { listExploreSections } from "@/server/repositories/notebook/public-notebook.repository"
import { serverError } from "@/server/utils/api-error"

const getCachedExploreSections = unstable_cache(
    () => listExploreSections(supabaseAdmin),
    ["explore-sections"],
    { revalidate: 300 }
)

export async function GET() {
    const { data, error } = await getCachedExploreSections()

    if (error) {
        return serverError(error, "GET /api/explore/notebooks")
    }

    return NextResponse.json(data ?? [], {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
    })
}
