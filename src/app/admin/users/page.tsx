import type { Metadata } from "next"
import type { User } from "@supabase/supabase-js"

import { supabaseServer } from "@/server/supabase/server"
import AppLayout from "@/shared/components/layout/AppLayout"
import UsersClient from "./UsersClient"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Người dùng | Yomi Admin",
}

export interface AdminUserRecord {
    id: string
    email: string | null
    phone: string | null
    display_name: string
    jlpt_level: string | null
    streak_count: number
    created_at: string
    last_sign_in_at: string | null
    email_confirmed_at: string | null
    role: string
    subscription_until: string | null
}

export default async function AdminUsersPage() {
    // Fetch first page of auth users + profiles in parallel
    const [{ data: firstPage }, profileResult] = await Promise.all([
        supabaseServer.auth.admin.listUsers({ perPage: 1000, page: 1 }),
        supabaseServer.from("user_profiles").select("id, display_name, jlpt_level, streak_count, created_at"),
    ])

    const allAuthUsers: User[] = [...(firstPage?.users ?? [])]
    // Fetch remaining pages sequentially if needed (rare — most instances < 1000 users)
    if ((firstPage?.users ?? []).length === 1000) {
        let page = 2
        while (true) {
            const { data } = await supabaseServer.auth.admin.listUsers({ perPage: 1000, page })
            allAuthUsers.push(...(data?.users ?? []))
            if ((data?.users ?? []).length < 1000) break
            page++
        }
    }

    const profileMap = new Map((profileResult.data ?? []).map(p => [p.id, p]))

    const users: AdminUserRecord[] = allAuthUsers
        .map(au => {
            const profile = profileMap.get(au.id)
            return {
                id: au.id,
                email: au.email ?? null,
                phone: au.phone ?? null,
                display_name: profile?.display_name ?? "—",
                jlpt_level: profile?.jlpt_level ?? null,
                streak_count: profile?.streak_count ?? 0,
                created_at: au.created_at,
                last_sign_in_at: au.last_sign_in_at ?? null,
                email_confirmed_at: au.email_confirmed_at ?? null,
                role: (au.app_metadata?.role as string | undefined) ?? "free",
                subscription_until: (au.app_metadata?.subscription_until as string | undefined) ?? null,
            }
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return (
        <AppLayout title="Người dùng" hideSearch>
            <UsersClient initialUsers={users} />
        </AppLayout>
    )
}
