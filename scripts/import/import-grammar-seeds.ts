import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"

dotenv.config({
    path: ".env.local",
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
}

if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1"

type GrammarSeed = {
    pattern: string
    reading: string | null
    jlpt_level: JlptLevel | null
    source: string
    source_title: string
    source_short_explanation: string | null
    source_long_explanation: string | null
    source_formation: string | null
    source_examples: {
        japanese: string
        translation_en: string | null
    }[]
}

const inputPath = path.join(
    process.cwd(),
    "data/generated/grammar-seeds.json"
)

const seeds = JSON.parse(
    fs.readFileSync(inputPath, "utf8")
) as GrammarSeed[]

function toSlug(pattern: string) {
    return pattern
        .replace(/[～〜]/g, "")
        .replace(/\s+/g, "")
        .replace(/[。．.、]/g, "")
        .trim()
}

function toSourceId(item: GrammarSeed, index: number) {
    return `${item.source}:${item.jlpt_level ?? "unknown"}:${String(index + 1).padStart(5, "0")}`
}

function toRow(item: GrammarSeed, index: number) {
    const sourceId = toSourceId(item, index)

    return {
        source_id: sourceId,
        sort_order: index + 1,

        slug: toSlug(item.pattern),
        pattern: item.pattern,
        reading: item.reading,
        jlpt_level: item.jlpt_level,

        meaning_vi: "",
        meaning_en: item.source_short_explanation ?? "",

        short_meaning_vi: "",
        explanation_vi: "",
        explanation_en: item.source_long_explanation ?? "",

        nuance_vi: null,

        frequency: null,
        is_common: false,

        formation: item.source_formation
            ? [
                {
                    source: item.source,
                    raw: item.source_formation,
                },
            ]
            : [],

        reading_rules: [],
        variants: [],
        short_forms: [],
        common_pairs: [],

        notes: [
            {
                source: item.source,
                source_title: item.source_title,
            },
        ],

        similar_grammar: [],
        differences: [],
        tags: item.jlpt_level
            ? [item.jlpt_level, item.source]
            : [item.source],

        examples: item.source_examples.map((example) => ({
            japanese: example.japanese,
            translation_vi: "",
            translation_en: example.translation_en ?? "",
        })),
    }
}

async function main() {
    console.log(`Loaded ${seeds.length} seeds`)

    const { error: deleteError } = await supabase
        .from("grammars")
        .delete()
        .gte("id", 0)

    if (deleteError) {
        throw deleteError
    }

    console.log("Old grammar data deleted")

    const rows = seeds.map(toRow)

    const batchSize = 200

    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize)

        const { error } = await supabase
            .from("grammars")
            .insert(batch)

        if (error) {
            console.error("Insert error at batch:", i)
            console.error(batch[0])
            throw error
        }

        console.log(
            `Inserted ${Math.min(i + batchSize, rows.length)}/${rows.length}`
        )
    }

    console.log("Import done")
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})