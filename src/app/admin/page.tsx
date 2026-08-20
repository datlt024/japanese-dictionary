import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { isAdminUser } from "@/server/utils/admin"
import AppLayout from "@/shared/components/layout/AppLayout"
import AdminClient from "./AdminClient"

export const metadata: Metadata = {
    title: "Quản lý sổ tay | Yomi Admin",
}

export default async function AdminPage() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdminUser(user)) {
        redirect("/")
    }

    return (
        <AppLayout title="Quản lý sổ tay" hideSearch>
            <AdminClient />
        </AppLayout>
    )
}
