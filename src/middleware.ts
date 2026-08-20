import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session — do not remove; required for SSR auth to work
    const { data: { user } } = await supabase.auth.getUser()

    // Guard all /api/admin/* routes at the edge — must be authenticated
    if (request.nextUrl.pathname.startsWith("/api/admin")) {
        if (!user) {
            return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 })
        }
        // Note: admin role check (app_metadata.role === "admin") is done in each route handler
        // Middleware only ensures a session exists, avoiding service-role calls at the edge
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
