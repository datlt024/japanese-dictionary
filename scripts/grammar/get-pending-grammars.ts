import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

dotenv.config({ path: ".env.local" })

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
        .limit(10)

    if (error) throw error

    console.log(JSON.stringify(data, null, 2))
}

main()