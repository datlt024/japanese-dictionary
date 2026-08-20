import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { isAdminUser } from "@/server/utils/admin"

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminUser(user)) redirect("/")
    return <>{children}</>
}
