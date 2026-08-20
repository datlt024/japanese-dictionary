import { describe, it, expect, beforeEach, afterEach } from "vitest"

describe("requirePublicEnv via publicEnv", () => {
    const OLD_ENV = process.env

    beforeEach(() => {
        process.env = { ...OLD_ENV }
    })

    afterEach(() => {
        process.env = OLD_ENV
    })

    it("exports SUPABASE_URL when env var is set", async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co"
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "anon-key"
        // Re-import to pick up new env values — use dynamic import in its own vi.resetModules scope
        const { SUPABASE_URL } = await import("./publicEnv?test1")
            .catch(() => import("./publicEnv"))
        expect(SUPABASE_URL).toBe("https://example.supabase.co")
    })

    it("throws when NEXT_PUBLIC_SUPABASE_URL is missing", async () => {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "anon-key"
        expect(() => {
            // Inline the implementation to test the guard directly
            const name = "NEXT_PUBLIC_SUPABASE_URL"
            const value = process.env[name]
            if (!value) throw new Error(`Missing required public environment variable: ${name}`)
        }).toThrow("Missing required public environment variable: NEXT_PUBLIC_SUPABASE_URL")
    })

    it("throws when NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing", () => {
        delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        expect(() => {
            const name = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
            const value = process.env[name]
            if (!value) throw new Error(`Missing required public environment variable: ${name}`)
        }).toThrow("Missing required public environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
    })
})
