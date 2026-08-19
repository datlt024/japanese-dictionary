import { unstable_cache } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/server/supabase/admin"
import { listExploreSections } from "@/server/repositories/notebook/public-notebook.repository"
import { serverError } from "@/server/utils/api-error"
import { getClientIp, rateLimit } from "@/shared/utils/rate-limit"

const getCachedExploreSections = unstable_cache(
    () => listExploreSections(supabaseAdmin),
    ["explore-sections"],
    { revalidate: 300 }
)

export async function GET(req: NextRequest) {
    const rl = await rateLimit(`explore:${getClientIp(req)}`, 60, 60_000)
    if (!rl.ok) return rl.response

    const { data, error } = await getCachedExploreSections()

    if (error) {
        return serverError(error, "GET /api/explore/notebooks")
    }

    return NextResponse.json(data ?? [], {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
    })
}
