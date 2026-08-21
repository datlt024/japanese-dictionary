import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/shared/utils/publicEnv"

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
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

    const pathname = request.nextUrl.pathname

    // Guard /api/admin/* routes — must be authenticated
    if (pathname.startsWith("/api/admin")) {
        if (!user) {
            return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 })
        }
        // Admin role check (app_metadata.role === "admin") is done in each route handler
    }

    // Guard /admin/* pages — must be authenticated and have admin role
    if (pathname.startsWith("/admin")) {
        if (!user) {
            return NextResponse.redirect(new URL("/", request.url))
        }
        const adminIds = (process.env.ADMIN_USER_IDS ?? "")
            .split(",").map(s => s.trim()).filter(Boolean)
        const isAdmin = adminIds.includes(user.id) || user.app_metadata?.role === "admin"
        if (!isAdmin) {
            return NextResponse.redirect(new URL("/", request.url))
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
