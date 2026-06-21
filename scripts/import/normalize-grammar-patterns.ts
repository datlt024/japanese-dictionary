import dotenv from "dotenv"
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

type GrammarRow = {
    id: number
    pattern: string
}

function normalizePattern(pattern: string) {
    let value = pattern.trim()

    value = value
        .replace(/\(.+?\)/g, "")
        .replace(/い-djective/g, "A-い")
        .replace(/な-djective/g, "A-な")
        .replace(/i-adjective/gi, "A-い")
        .replace(/na-adjective/gi, "A-な")
        .replace(/adjective/gi, "A")
        .replace(/erb/g, "V")
        .replace(/oun/g, "N")
        .replace(/Verb/gi, "V")
        .replace(/Noun/gi, "N")
        .replace(/[～〜]/g, "〜")
        .replace(/\s+/g, "")

    const manualMap: Record<string, string> = {
        "がいちばん": "いちばん",
        "A-いく+V": "A-い + く + V",
        "A-なに+V": "A-な + に + V",
        "どこにも+V+ないです": "どこにも + V-ない + です",
        "どこにも+V+ません": "どこにも + V-ません",
        "A-いくする/なる": "A-い + くする／くなる",
        "A-なにする/なる": "A-な + にする／になる",
        "N+中": "N + 中",
        "Vて+さしあげる": "V-て + さしあげる",
        "Vない+ことにする": "V-ない + ことにする",
        "V+続ける": "V-ます + 続ける",
        "そんな+N": "そんな + N",
        "N+あっての+N": "N + あっての + N",
        "N+ぐるみ": "N + ぐるみ",
        "Nごとき/Nごとく": "N + ごとき／N + ごとく",
        "N+というもの": "N + というもの",
        "N+ときたら": "N + ときたら",
        "N+ともあろう+N": "N + ともあろう + N",
        "N+ならでは": "N + ならでは",
        "N+ぬいて": "N + ぬきで／N + をぬいて",
        "N+のいかんだ": "N + のいかんだ",
        "N+はどうであれ": "N + はどうであれ",
        "Nを皮切りに/を皮切りにして": "N + を皮切りに／N + を皮切りにして",
        "N+前提で": "N + 前提で",
        "Vる/N+限り": "V-辞書形 + 限り／N + の限り",
    }

    if (manualMap[value]) {
        return manualMap[value]
    }

    value = value
        .replace(/\+/g, " + ")
        .replace(/\//g, "／")
        .replace(/\s+/g, " ")
        .trim()

    return value
}

function toSlug(pattern: string) {
    return pattern
        .replace(/[～〜]/g, "")
        .replace(/\s+/g, "")
        .replace(/[。．.、]/g, "")
        .replace(/\+/g, "")
        .replace(/／/g, "")
        .trim()
}

async function main() {
    const { data, error } = await supabase
        .from("grammars")
        .select("id, pattern")
        .order("id", { ascending: true })

    if (error) {
        throw error
    }

    const rows = data as GrammarRow[]

    let updated = 0

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
            console.error("Failed row:", row)
            throw updateError
        }

        updated += 1
        console.log(`${row.id}: ${row.pattern} -> ${normalized}`)
    }

    console.log(`Done. Updated ${updated}/${rows.length} rows.`)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})