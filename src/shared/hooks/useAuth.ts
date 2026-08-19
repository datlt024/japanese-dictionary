"use client"

import {
    useEffect,
    useState,
} from "react"

import type { User } from "@supabase/supabase-js"

import { createSupabaseBrowserClient } from "@/shared/lib/supabase/auth-client"

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createSupabaseBrowserClient()

        // getSession() reads from localStorage — no network call, resolves in ~5ms.
        // API routes still call getUser() server-side for proper JWT verification.
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null)
            setLoading(false)
        })

        const { data: { subscription } } =
            supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null)
                setLoading(false)
            })

        return () => subscription.unsubscribe()
    }, [])

    async function signOut() {
        const supabase = createSupabaseBrowserClient()
        await supabase.auth.signOut()
    }

    return { user, loading, signOut }
}
