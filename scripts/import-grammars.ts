import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import fs from "fs/promises"
import path from "path"

dotenv.config({
    path: ".env.local",
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase env variables")
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    const filePath = path.join(
        process.cwd(),
        "data-import/grammar-n5.json"
    )

    const file = await fs.readFile(filePath, "utf-8")
    const grammars = JSON.parse(file)

    const batchSize = 100

    for (let i = 0; i < grammars.length; i += batchSize) {
        const batch = grammars.slice(i, i + batchSize)

        const { error } = await supabase
            .from("grammars")
            .insert(batch)

        if (error) {
            console.error("Import error:", error)
            process.exit(1)
        }

        console.log(
            `Imported ${i + batch.length}/${grammars.length}`
        )
    }

    console.log("Import completed!")
}

main()