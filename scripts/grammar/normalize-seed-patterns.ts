import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

dotenv.config({
    path: ".env.local",
})

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type GrammarRow = {
    id: number
    pattern: string
}

const PATTERN_MAP: Record<string, string> = {
    "いちばん": "A が いちばん",

    "ととどちら": "A と B と どちら",
    "ととどっち": "A と B と どっち",

    "どちらとどちら": "A と B と どちら",
    "どっちとどっち": "A と B と どっち",

    "じゃ": "じゃ",
    "それじゃ": "それじゃ",
    "それでは": "それでは",

    "A-い + くする／くなる":
        "A-い + くする／A-い + くなる",

    "N + をぬいて":
        "N + をぬいて",

    "V-辞書形 + 限り／N + の限り":
        "V-辞書形 + 限り／N + の限り",
}

function normalizePattern(pattern: string) {
    let value = pattern.trim()

    if (PATTERN_MAP[value]) {
        value = PATTERN_MAP[value]
    }

    value = value
        .replace(/\s+/g, " ")
        .trim()

    return value
}

function toSlug(pattern: string) {
    return pattern
        .replace(/[～〜]/g, "")
        .replace(/\s+/g, "")
        .replace(/[。．、.]/g, "")
        .replace(/\+/g, "")
        .replace(/／/g, "")
        .trim()
}

async function main() {
    const { data, error } = await supabase
        .from("grammars")
        .select("id, pattern")
        .order("id")

    if (error) {
        throw error
    }

    const rows = data as GrammarRow[]

    let count = 0

    for (const row of rows) {
        const normalized = normalizePattern(row.pattern)

        if (normalized === row.pattern) {
            continue
        }

        const { error: updateError } = await supabase
            .from("grammars")
            .update({
                pattern: normalized,
                slug: toSlug(normalized),
            })
            .eq("id", row.id)

        if (updateError) {
            throw updateError
        }

        console.log(`${row.pattern} -> ${normalized}`)
        count++
    }

    console.log(`Updated ${count} rows`)
}

main().catch(console.error)