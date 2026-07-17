import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mazii.net"

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${BASE_URL}/search`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/kanji`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/study`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/translate`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/notebooks`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
        },
    ]
}
