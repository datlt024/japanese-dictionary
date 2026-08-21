import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { ExploreSection, PublicNotebook } from "@/domain/notebook/notebook.type"
import type { Database } from "@/shared/types/database.generated"
import { normalizeKanjiNumbers } from "@/shared/utils/japanese"

function sortNotebooks(nbs: PublicNotebook[]): PublicNotebook[] {
    return [...nbs].sort((a, b) => {
        if (a.display_order !== b.display_order) return a.display_order - b.display_order
        return normalizeKanjiNumbers(a.name).localeCompare(normalizeKanjiNumbers(b.name), ["vi", "ja", "en"], { numeric: true })
    })
}

type GroupMeta = { id: string; name: string; description: string | null; display_order: number; notebooks: PublicNotebook[] }

export async function listExploreSections(
    supabase: SupabaseClient<Database>
): Promise<{ data: ExploreSection[] | null; error: unknown }> {
    // Single query: all public notebooks with their group info (if any)
    const { data: allNbs, error } = await supabase
        .from("notebooks")
        .select("id, name, description, public_category, public_description, display_order, group_id, notebook_items(count), notebook_groups(id, name, public_description, display_order)")
        .eq("is_public", true)
        .order("display_order", { ascending: true })
        .order("name", { ascending: true })

    if (error) return { data: null, error }

    type RawNb = typeof allNbs extends (infer T)[] ? T & {
        notebook_items?: { count: number }[]
        notebook_groups?: { id: string; name: string; public_description: string | null; display_order: number } | null
    } : never

    // Separate into group notebooks and standalone notebooks
    const groupMap = new Map<string, GroupMeta>()
    const categoryMap = new Map<string, { notebooks: PublicNotebook[]; order: number }>()
    let catOrder = 0

    for (const rawNb of allNbs ?? []) {
        const row = rawNb as RawNb
        const itemCount = row.notebook_items?.[0]?.count ?? 0
        const publicNb: PublicNotebook = {
            id: row.id,
            name: row.name,
            description: row.description,
            public_category: row.public_category ?? null,
            public_description: row.public_description ?? null,
            display_order: row.display_order,
            item_count: itemCount,
        }

        if (row.group_id && row.notebook_groups) {
            const g = row.notebook_groups
            if (!groupMap.has(row.group_id)) {
                groupMap.set(row.group_id, {
                    id: g.id,
                    name: g.name,
                    description: g.public_description,
                    display_order: g.display_order ?? 0,
                    notebooks: [],
                })
            }
            groupMap.get(row.group_id)?.notebooks.push(publicNb)
        } else {
            const cat = row.public_category ?? "Khác"
            if (!categoryMap.has(cat)) {
                categoryMap.set(cat, { notebooks: [], order: catOrder++ })
            }
            categoryMap.get(cat)?.notebooks.push(publicNb)
        }
    }

    const groupSections: ExploreSection[] = [...groupMap.values()].map(g => ({
        type: "group",
        id: g.id,
        name: g.name,
        description: g.description,
        display_order: g.display_order,
        notebooks: sortNotebooks(g.notebooks),
    }))

    const categorySections: ExploreSection[] = [...categoryMap.entries()].map(([cat, { notebooks, order }]) => ({
        type: "category",
        id: `cat:${cat}`,
        name: cat,
        description: null,
        display_order: 1000 + order,
        notebooks: sortNotebooks(notebooks),
    }))

    const sections = [...groupSections, ...categorySections].sort(
        (a, b) => a.display_order - b.display_order
    )

    return { data: sections, error: null }
}

export async function getPublicNotebook(
    supabase: SupabaseClient<Database>,
    notebookId: string
): Promise<{ data: PublicNotebook | null; error: unknown }> {
    const { data: nb, error } = await supabase
        .from("notebooks")
        .select("id, name, description, public_category, public_description, display_order, is_public, group_id, notebook_items(count)")
        .eq("id", notebookId)
        .maybeSingle()

    if (error) return { data: null, error }
    if (!nb) return { data: null, error: "not found" }
    if (!nb.is_public) return { data: null, error: "not accessible" }

    type NbRow = typeof nb & { notebook_items?: { count: number }[] }
    const row = nb as NbRow

    return {
        data: {
            id: nb.id,
            name: nb.name,
            description: nb.description,
            public_category: nb.public_category ?? null,
            public_description: nb.public_description ?? null,
            display_order: nb.display_order,
            item_count: row.notebook_items?.[0]?.count ?? 0,
        },
        error: null,
    }
}
