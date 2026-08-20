import "server-only"

function requireEnv(name: string): string {
    const value = process.env[name]
    if (!value) throw new Error(`Missing required environment variable: ${name}`)
    return value
}

export const env = {
    get SUPABASE_URL() { return requireEnv("NEXT_PUBLIC_SUPABASE_URL") },
    get SUPABASE_PUBLISHABLE_KEY() { return requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") },
    get SUPABASE_SERVICE_ROLE_KEY() { return requireEnv("SUPABASE_SERVICE_ROLE_KEY") },
    get SITE_URL() { return process.env.NEXT_PUBLIC_SITE_URL ?? "https://yomi.vn" },
}
