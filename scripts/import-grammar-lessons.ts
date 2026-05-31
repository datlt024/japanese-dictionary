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

type GrammarLesson = {
    id: number
    title: string
    link: string
    source: string
}

async function main() {
    const filePath = path.join(
        process.cwd(),
        "data/grammar/japanese-grammar-db/build/db.json"
    )

    const raw = fs.readFileSync(filePath, "utf-8")
    const lessons: GrammarLesson[] = JSON.parse(raw)

    const rows = lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        link: lesson.link,
        source: lesson.source,
    }))

    const { error } = await supabase
        .from("grammar_lessons")
        .upsert(rows, {
            onConflict: "id",
        })

    if (error) {
        console.error("Import failed:", error)
        return
    }

    console.log(`Imported ${rows.length} grammar lessons`)
}

main()