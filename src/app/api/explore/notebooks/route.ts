import { NextResponse } from "next/server"
import { supabaseServer } from "@/server/supabase/server"
import { listExploreSections } from "@/server/repositories/notebook/public-notebook.repository"
import { serverError } from "@/server/utils/api-error"

export async function GET() {
    const { data, error } = await listExploreSections(supabaseServer)

    if (error) {
        return serverError(error, "GET /api/explore/notebooks")
    }

    return NextResponse.json(data ?? [])
}
