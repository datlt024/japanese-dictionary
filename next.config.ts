import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
    : "*.supabase.co"

const cspDirectives = [
    "default-src 'self'",
    // Next.js requires unsafe-inline + unsafe-eval for client-side hydration
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`,
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
].join("; ")

const nextConfig: NextConfig = {
    poweredByHeader: false,

    images: {
        formats: ["image/avif", "image/webp"],
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'none'; script-src 'none'; sandbox;",
    },

    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    // HSTS: 2 years, include subdomains
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=63072000; includeSubDomains; preload",
                    },
                    { key: "Content-Security-Policy", value: cspDirectives },
                    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
                ],
            },
        ]
    },
}

export default nextConfig
