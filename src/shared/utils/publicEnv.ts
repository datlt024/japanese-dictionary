function requirePublicEnv(name: string): string {
    const value = process.env[name]
    if (!value) throw new Error(`Missing required public environment variable: ${name}`)
    return value
}

export const SUPABASE_URL = requirePublicEnv("NEXT_PUBLIC_SUPABASE_URL")
export const SUPABASE_PUBLISHABLE_KEY = requirePublicEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
