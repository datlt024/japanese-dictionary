import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/server/supabase/admin"
import { listExploreSections } from "@/server/repositories/notebook/public-notebook.repository"
import { serverError } from "@/server/utils/api-error"

export async function GET() {
    const { data, error } = await listExploreSections(supabaseAdmin)

    if (error) {
        return serverError(error, "GET /api/explore/notebooks")
    }

    return NextResponse.json(data ?? [])
}
