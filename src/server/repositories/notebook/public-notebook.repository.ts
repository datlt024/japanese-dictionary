import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { ExploreSection, PublicNotebook } from "@/domain/notebook/notebook.type"
import type { Database } from "@/shared/types/database.generated"

const KANJI_MAP: Record<string, number> = {
    "〇": 0, "一": 1, "二": 2, "三": 3, "四": 4,
    "五": 5, "六": 6, "七": 7, "八": 8, "九": 9,
    "十": 10, "百": 100, "千": 1000,
}

function normalizeForSort(name: string): string {
    return name.replace(/[〇一二三四五六七八九十百千]+/g, (match) => {
        let value = 0
        let current = 0
        for (const ch of match) {
            const v = KANJI_MAP[ch]
            if (v === undefined) break
            if (v >= 10) { value += (current === 0 ? 1 : current) * v; current = 0 }
            else { current = v }
        }
        return String(value + current)
    })
}

function sortNotebooks(nbs: PublicNotebook[]): PublicNotebook[] {
    return [...nbs].sort((a, b) => {
        if (a.display_order !== b.display_order) return a.display_order - b.display_order
        return normalizeForSort(a.name).localeCompare(normalizeForSort(b.name), ["vi", "ja", "en"], { numeric: true })
    })
}

async function fetchItemCount(
    supabase: SupabaseClient<Database>,
    notebookId: string
): Promise<number> {
    const { count } = await supabase
        .from("notebook_items")
        .select("*", { count: "exact", head: true })
        .eq("notebook_id", notebookId)
    return count ?? 0
}

export async function listExploreSections(
    supabase: SupabaseClient<Database>
): Promise<{ data: ExploreSection[] | null; error: unknown }> {
    // 1. Public groups with their notebooks
    const { data: groups, error: groupErr } = await supabase
        .from("notebook_groups")
        .select("id, name, public_description, display_order")
        .eq("is_public", true)
        .order("display_order", { ascending: true })
        .order("name", { ascending: true })

    if (groupErr) return { data: null, error: groupErr }

    // 2. Standalone public notebooks (not in a public group)
    const publicGroupIds = (groups ?? []).map((g) => g.id)

    let standaloneQuery = supabase
        .from("notebooks")
        .select("id, name, description, public_category, public_description, display_order, group_id")
        .eq("is_public", true)
        .order("display_order", { ascending: true })
        .order("name", { ascending: true })

    // exclude notebooks that belong to a public group (already shown under the group)
    if (publicGroupIds.length > 0) {
        standaloneQuery = standaloneQuery.not("group_id", "in", `(${publicGroupIds.join(",")})`)
    }

    const { data: standaloneNbs, error: nbErr } = await standaloneQuery
    if (nbErr) return { data: null, error: nbErr }

    // 3. Fetch notebooks for each public group
    const groupNotebooksResults = await Promise.all(
        (groups ?? []).map(async (g) => {
            const { data: nbs } = await supabase
                .from("notebooks")
                .select("id, name, description, public_category, public_description, display_order")
                .eq("group_id", g.id)
                .order("display_order", { ascending: true })
                .order("name", { ascending: true })
            return { groupId: g.id, notebooks: nbs ?? [] }
        })
    )

    // 4. Fetch item counts per notebook using aggregate COUNT queries (avoids transferring all rows)
    const allNbIds = [
        ...groupNotebooksResults.flatMap((r) => r.notebooks.map((nb) => nb.id)),
        ...(standaloneNbs ?? []).map((nb) => nb.id),
    ]
    const countMap = new Map<string, number>()
    if (allNbIds.length > 0) {
        const counts = await Promise.all(
            allNbIds.map(async (id) => {
                const { count } = await supabase
                    .from("notebook_items")
                    .select("*", { count: "exact", head: true })
                    .eq("notebook_id", id)
                return { id, count: count ?? 0 }
            })
        )
        for (const { id, count } of counts) {
            countMap.set(id, count)
        }
    }

    const toPublicNotebook = (nb: {
        id: string
        name: string
        description: string | null
        public_category?: string | null
        public_description?: string | null
        display_order: number
    }): PublicNotebook => ({
        id: nb.id,
        name: nb.name,
        description: nb.description,
        public_category: nb.public_category ?? null,
        public_description: nb.public_description ?? null,
        display_order: nb.display_order,
        item_count: countMap.get(nb.id) ?? 0,
    })

    // 5. Build group sections
    const groupSections: ExploreSection[] = (groups ?? []).map((g, i) => {
        const result = groupNotebooksResults.find((r) => r.groupId === g.id)
        return {
            type: "group",
            id: g.id,
            name: g.name,
            description: g.public_description,
            display_order: g.display_order ?? i,
            notebooks: sortNotebooks((result?.notebooks ?? []).map(toPublicNotebook)),
        }
    })

    // 6. Group standalone notebooks by public_category
    const categoryMap = new Map<string, PublicNotebook[]>()
    let categoryOrder = 0
    for (const nb of standaloneNbs ?? []) {
        const cat = nb.public_category ?? "Khác"
        if (!categoryMap.has(cat)) categoryMap.set(cat, [])
        categoryMap.get(cat)!.push(toPublicNotebook(nb))
        categoryOrder++
    }
    const categorySections: ExploreSection[] = [...categoryMap.entries()].map(([cat, nbs]) => ({
        type: "category",
        id: `cat:${cat}`,
        name: cat,
        description: null,
        display_order: 1000 + categoryOrder,
        notebooks: sortNotebooks(nbs),
    }))

    // 7. Merge and sort
    const sections = [...groupSections, ...categorySections].sort(
        (a, b) => a.display_order - b.display_order
    )

    return { data: sections, error: null }
}

export async function getPublicNotebook(
    supabase: SupabaseClient<Database>,
    notebookId: string
): Promise<{ data: PublicNotebook | null; error: unknown }> {
    // Only return notebooks that are individually public OR belong to a public group
    const { data, error } = await supabase
        .from("notebooks")
        .select("id, name, description, public_category, public_description, display_order, group_id")
        .eq("id", notebookId)
        .eq("is_public", true)
        .maybeSingle()

    if (error || !data) {
        // If not individually public, check if it belongs to a public group
        if (!error) {
            const { data: nb } = await supabase
                .from("notebooks")
                .select("id, name, description, public_category, public_description, display_order, group_id")
                .eq("id", notebookId)
                .maybeSingle()

            if (!nb || !nb.group_id) return { data: null, error: "not found" }

            const { data: group } = await supabase
                .from("notebook_groups")
                .select("id")
                .eq("id", nb.group_id)
                .eq("is_public", true)
                .maybeSingle()

            if (!group) return { data: null, error: "not accessible" }

            const count = await fetchItemCount(supabase, notebookId)
            return {
                data: {
                    id: nb.id,
                    name: nb.name,
                    description: nb.description,
                    public_category: nb.public_category ?? null,
                    public_description: nb.public_description ?? null,
                    display_order: nb.display_order,
                    item_count: count,
                },
                error: null,
            }
        }
        return { data: null, error: error ?? "not found" }
    }

    const count = await fetchItemCount(supabase, notebookId)

    return {
        data: {
            id: data.id,
            name: data.name,
            description: data.description,
            public_category: data.public_category ?? null,
            public_description: data.public_description ?? null,
            display_order: data.display_order,
            item_count: count,
        },
        error: null,
    }
}
