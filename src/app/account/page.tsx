import { redirect } from "next/navigation"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { getProfile } from "@/server/repositories/community/community.repository"

import AccountClient from "@/features/auth/components/AccountClient/AccountClient"
import Header from "@/shared/components/layout/Header"
import layoutStyles from "@/shared/components/layout/AppLayout.module.css"

export const metadata = { title: "Tài khoản — Mazii" }

export default async function AccountPage() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/")
    }

    const { data: profile } = await getProfile(supabase, user.id)

    return (
        <>
            <Header title="Tài khoản" />
            <div className={layoutStyles.appShell}>
                <AccountClient
                    email={user.email ?? ""}
                    initialDisplayName={profile?.display_name ?? ""}
                    initialJlptLevel={profile?.jlpt_level ?? null}
                    hasPassword={
                        (user.app_metadata?.providers as string[] | undefined)?.includes("email") ?? false
                    }
                />
            </div>
        </>
    )
}
