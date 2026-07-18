import { redirect } from "next/navigation"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import NotebooksClient from "@/features/notebook/components/NotebooksClient/NotebooksClient"

export const metadata = { title: "Sổ tay cá nhân — Yomi" }

export default async function NotebooksPage() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/")
    return <NotebooksClient />
}
