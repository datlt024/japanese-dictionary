/**
 * Debug script: list all notebooks and groups with their user_ids.
 * Run with: tsx --env-file=.env.local scripts/debug/debug-notebooks.ts
 */
import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminUserId = process.env.ADMIN_USER_IDS?.split(",")[0]?.trim()!

const supabase = createClient(url, serviceKey)

async function main() {
    console.log(`\nAdmin user ID: ${adminUserId}\n`)

    // ── Groups ────────────────────────────────────────────
    const { data: groups } = await supabase
        .from("notebook_groups")
        .select("id, name, user_id")
        .order("name")

    console.log(`=== NOTEBOOK GROUPS (${groups?.length ?? 0} total) ===`)
    for (const g of groups ?? []) {
        const match = g.user_id === adminUserId ? "✓" : "✗ WRONG USER_ID"
        console.log(`  [${match}] "${g.name}" — user_id: ${g.user_id}`)
    }

    // ── Notebooks ─────────────────────────────────────────
    const { data: notebooks } = await supabase
        .from("notebooks")
        .select("id, name, user_id, group_id")
        .order("name")

    console.log(`\n=== NOTEBOOKS (${notebooks?.length ?? 0} total) ===`)
    for (const nb of notebooks ?? []) {
        const match = nb.user_id === adminUserId ? "✓" : "✗ WRONG USER_ID"
        const group = groups?.find(g => g.id === nb.group_id)
        const groupLabel = group ? `→ group: "${group.name}"` : nb.group_id ? `→ group_id: ${nb.group_id} (NOT FOUND)` : "(no group)"
        console.log(`  [${match}] "${nb.name}" — user_id: ${nb.user_id} ${groupLabel}`)
    }

    // ── Notebooks with wrong user_id ──────────────────────
    const wrongGroups = (groups ?? []).filter(g => g.user_id !== adminUserId)
    const wrongNotebooks = (notebooks ?? []).filter(nb => nb.user_id !== adminUserId)

    if (wrongGroups.length > 0 || wrongNotebooks.length > 0) {
        console.log(`\n=== FIX NEEDED ===`)
        if (wrongGroups.length > 0) {
            console.log(`\nGroups with wrong user_id (${wrongGroups.length}):`)
            for (const g of wrongGroups) console.log(`  "${g.name}" (${g.id})`)
        }
        if (wrongNotebooks.length > 0) {
            console.log(`\nNotebooks with wrong user_id (${wrongNotebooks.length}):`)
            for (const nb of wrongNotebooks) console.log(`  "${nb.name}" (${nb.id})`)
        }

        const args = process.argv.slice(2)
        if (args.includes("--fix")) {
            console.log(`\nApplying fix — updating user_id to ${adminUserId}...`)

            if (wrongGroups.length > 0) {
                const { error } = await supabase
                    .from("notebook_groups")
                    .update({ user_id: adminUserId })
                    .in("id", wrongGroups.map(g => g.id))
                if (error) console.error("Error fixing groups:", error)
                else console.log(`  ✓ Fixed ${wrongGroups.length} group(s)`)
            }

            if (wrongNotebooks.length > 0) {
                const { error } = await supabase
                    .from("notebooks")
                    .update({ user_id: adminUserId })
                    .in("id", wrongNotebooks.map(nb => nb.id))
                if (error) console.error("Error fixing notebooks:", error)
                else console.log(`  ✓ Fixed ${wrongNotebooks.length} notebook(s)`)
            }

            console.log("\nDone. Refresh the browser to see the changes.")
        } else {
            console.log(`\nRun with --fix to update user_ids:`)
            console.log(`  tsx --env-file=.env.local scripts/debug/debug-notebooks.ts --fix`)
        }
    } else {
        console.log(`\n✓ All groups and notebooks have correct user_id.`)
        console.log(`  If notebooks still don't show, check the browser console for API errors.`)
    }
}

main().catch(console.error)
