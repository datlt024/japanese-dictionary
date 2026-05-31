import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
}

if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

type GrammarPoint = {
    pattern: string
    jlpt_level: string
    meaning_vi: string
    meaning_en: string
    structure: string
    explanation_vi: string
    explanation_en: string
    example_jp: string
    example_vi: string
}

async function main() {
    const filePath = path.join(
        process.cwd(),
        "data-import/grammar-points.json"
    )

    const raw = fs.readFileSync(filePath, "utf-8")
    const grammarPoints: GrammarPoint[] = JSON.parse(raw)

    const rows = grammarPoints.map((item) => ({
        ...item,
        source: "manual-seed"
    }))

    const { error } = await supabase
        .from("grammar_points")
        .insert(rows)

    if (error) {
        console.error("Import failed:", error)
        return
    }

    console.log(`Imported ${rows.length} grammar points`)
}

main()