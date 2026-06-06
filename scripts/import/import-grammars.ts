import dotenv from "dotenv"
import fs from "fs/promises"
import path from "path"

import { supabaseAdmin } from "@/server/supabase/admin"

dotenv.config({
    path: ".env.local",
})

async function main() {
    const filePath = path.join(
        process.cwd(),
        "data-import",
        "grammar-n5.json"
    )

    const file = await fs.readFile(filePath, "utf-8")
    const grammars = JSON.parse(file)

    const batchSize = 100

    for (let i = 0; i < grammars.length; i += batchSize) {
        const batch = grammars.slice(i, i + batchSize)

        const { error } = await supabaseAdmin
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

main().catch((error) => {
    console.error("Import failed:", error)
    process.exit(1)
})