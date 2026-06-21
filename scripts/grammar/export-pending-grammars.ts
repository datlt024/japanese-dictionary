import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"

dotenv.config({
    path: ".env.local",
})

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
    const { data, error } = await supabase
        .from("grammars")
        .select(`
            id,
            pattern,
            jlpt_level,
            meaning_en,
            explanation_en,
            formation,
            examples
        `)
        .eq("ai_status", "pending")
        .order("sort_order")
        .limit(20)

    if (error) {
        throw error
    }

    const outputPath = path.join(
        process.cwd(),
        "data/generated/pending-grammars.json"
    )

    fs.mkdirSync(path.dirname(outputPath), {
        recursive: true,
    })

    fs.writeFileSync(
        outputPath,
        JSON.stringify(data, null, 2),
        "utf8"
    )

    console.log(`Exported ${data.length} grammars`)
}

main().catch(console.error)