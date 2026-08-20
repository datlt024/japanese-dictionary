import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

import type { Database } from "@/shared/types/database.generated"
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/shared/utils/publicEnv"

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const oauthError = searchParams.get("error")
    const rawNext = searchParams.get("next") ?? "/"
    // Block open redirects: only allow relative paths, never //host or absolute URLs
    const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/"

    if (oauthError) {
        const desc = searchParams.get("error_description") ?? oauthError
        return NextResponse.redirect(
            `${origin}/?auth_error=${encodeURIComponent(desc)}`
        )
    }

    if (code) {
        const cookieStore = await cookies()

        const supabase = createServerClient<Database>(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {}
                    },
                },
            }
        )

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    return NextResponse.redirect(`${origin}/?error=auth`)
}
