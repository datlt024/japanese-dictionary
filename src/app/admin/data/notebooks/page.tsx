import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { isAdminUser } from "@/server/utils/admin"
import AppLayout from "@/shared/components/layout/AppLayout"
import NotebooksDataClient from "./NotebooksDataClient"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Sổ tay công khai | Yomi Admin" }

export default async function NotebooksDataPage() {
    const authClient = await createSupabaseServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user || !isAdminUser(user)) redirect("/")

    const { data, count } = await supabaseServer
        .from("notebooks")
        .select("id, name, description, is_public, public_category, public_description, display_order, user_id, created_at, updated_at, notebook_items(count)", { count: "exact" })
        .order("is_public", { ascending: false })
        .order("display_order", { ascending: true })
        .order("name", { ascending: true })
        .range(0, 99)

    const rows = (data ?? []).map((nb) => {
        const { notebook_items, ...rest } = nb as typeof nb & { notebook_items: { count: number }[] }
        return { ...rest, item_count: notebook_items?.[0]?.count ?? 0 }
    })

    return (
        <AppLayout title="Sổ tay công khai" hideSearch>
            <NotebooksDataClient initialRows={rows} initialTotal={count ?? 0} />
        </AppLayout>
    )
}
