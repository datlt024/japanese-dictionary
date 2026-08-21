// Next.js/Turbopack only inlines NEXT_PUBLIC_* vars when the key is a static
// string literal — process.env[variable] is not statically analysable and
// returns undefined in the client bundle even when the var is set.
export const SUPABASE_URL: string = (() => {
    const v = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!v) throw new Error("Missing required public environment variable: NEXT_PUBLIC_SUPABASE_URL")
    return v
})()

export const SUPABASE_PUBLISHABLE_KEY: string = (() => {
    const v = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    if (!v) throw new Error("Missing required public environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
    return v
})()
