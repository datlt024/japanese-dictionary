import type { MetadataRoute } from "next"
import { supabaseServer } from "@/server/supabase/server"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yomi.vn"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticUrls: MetadataRoute.Sitemap = [
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
    ]

    try {
        const [
            { data: vocabIds },
            { data: kanjiIds },
            { data: grammarIds },
        ] = await Promise.all([
            supabaseServer.from("vocabularies").select("id").limit(5000),
            supabaseServer.from("kanjis").select("kanji").limit(5000),
            supabaseServer.from("grammars").select("id").limit(5000),
        ])

        const vocabUrls: MetadataRoute.Sitemap =
            vocabIds?.map(({ id }) => ({
                url: `${BASE_URL}/vocabulary/${id}`,
                changeFrequency: "monthly" as const,
                priority: 0.8,
                lastModified: new Date(),
            })) ?? []

        const kanjiUrls: MetadataRoute.Sitemap =
            kanjiIds?.map(({ kanji }) => ({
                url: `${BASE_URL}/kanji/${encodeURIComponent(kanji)}`,
                changeFrequency: "monthly" as const,
                priority: 0.7,
                lastModified: new Date(),
            })) ?? []

        const grammarUrls: MetadataRoute.Sitemap =
            grammarIds?.map(({ id }) => ({
                url: `${BASE_URL}/grammar/${id}`,
                changeFrequency: "monthly" as const,
                priority: 0.7,
                lastModified: new Date(),
            })) ?? []

        return [...staticUrls, ...vocabUrls, ...kanjiUrls, ...grammarUrls]
    } catch {
        return staticUrls
    }
}
