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

    // 3. Fetch ALL notebooks for public groups in one query (avoids N queries per group)
    const groupIds = (groups ?? []).map((g) => g.id)
    type GroupNotebook = { id: string; name: string; description: string | null; public_category: string | null; public_description: string | null; display_order: number; item_count: number }
    let groupNotebooksResults: { groupId: string; notebooks: GroupNotebook[] }[] = (groups ?? []).map((g) => ({ groupId: g.id, notebooks: [] }))

    if (groupIds.length > 0) {
        // Only public notebooks within public groups — is_public=false notebooks are hidden from explore
        const { data: allGroupNbs } = await supabase
            .from("notebooks")
            .select("id, name, description, public_category, public_description, display_order, group_id, notebook_items(count)")
            .in("group_id", groupIds)
            .eq("is_public", true)
            .order("display_order", { ascending: true })
            .order("name", { ascending: true })

        const byGroup = new Map<string, GroupNotebook[]>()
        for (const nb of allGroupNbs ?? []) {
            const counts = (nb as typeof nb & { notebook_items?: { count: number }[] }).notebook_items
            const row: GroupNotebook = {
                id: nb.id,
                name: nb.name,
                description: nb.description,
                public_category: nb.public_category ?? null,
                public_description: nb.public_description ?? null,
                display_order: nb.display_order,
                item_count: counts?.[0]?.count ?? 0,
            }
            if (!byGroup.has(nb.group_id!)) byGroup.set(nb.group_id!, [])
            byGroup.get(nb.group_id!)!.push(row)
        }
        groupNotebooksResults = (groups ?? []).map((g) => ({ groupId: g.id, notebooks: byGroup.get(g.id) ?? [] }))
    }

    // 4. Fetch item counts for standalone notebooks in one aggregate query
    const standaloneList = standaloneNbs ?? []
    const standaloneCountMap = new Map<string, number>()
    if (standaloneList.length > 0) {
        const standaloneIds = standaloneList.map((nb) => nb.id)
        const { data: nbsWithCount } = await supabase
            .from("notebooks")
            .select("id, notebook_items(count)")
            .in("id", standaloneIds)
        for (const nb of nbsWithCount ?? []) {
            const nbAny = nb as typeof nb & { notebook_items: { count: number }[] }
            standaloneCountMap.set(nb.id, nbAny.notebook_items?.[0]?.count ?? 0)
        }
    }

    // 5. Build group sections — notebooks already have item_count from the aggregate query
    const groupSections: ExploreSection[] = (groups ?? []).map((g, i) => {
        const result = groupNotebooksResults.find((r) => r.groupId === g.id)
        const nbs: PublicNotebook[] = (result?.notebooks ?? []).map((nb) => ({
            id: nb.id,
            name: nb.name,
            description: nb.description,
            public_category: nb.public_category ?? null,
            public_description: nb.public_description ?? null,
            display_order: nb.display_order,
            item_count: nb.item_count,
        }))
        return {
            type: "group",
            id: g.id,
            name: g.name,
            description: g.public_description,
            display_order: g.display_order ?? i,
            notebooks: sortNotebooks(nbs),
        }
    })

    // 6. Group standalone notebooks by public_category
    const categoryMap = new Map<string, PublicNotebook[]>()
    let categoryOrder = 0
    for (const nb of standaloneList) {
        const cat = nb.public_category ?? "Khác"
        if (!categoryMap.has(cat)) categoryMap.set(cat, [])
        categoryMap.get(cat)!.push({
            id: nb.id,
            name: nb.name,
            description: nb.description,
            public_category: nb.public_category ?? null,
            public_description: nb.public_description ?? null,
            display_order: nb.display_order,
            item_count: standaloneCountMap.get(nb.id) ?? 0,
        })
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
    // Single query: fetch notebook + its group's public status + item count
    const { data: nb, error } = await supabase
        .from("notebooks")
        .select("id, name, description, public_category, public_description, display_order, is_public, group_id, notebook_groups(is_public), notebook_items(count)")
        .eq("id", notebookId)
        .maybeSingle()

    if (error) return { data: null, error }
    if (!nb) return { data: null, error: "not found" }

    type NbRow = typeof nb & { notebook_groups?: { is_public: boolean } | null; notebook_items?: { count: number }[] }
    const row = nb as NbRow

    // Visible if individually public OR belongs to a public group
    const groupIsPublic = row.notebook_groups?.is_public === true
    if (!nb.is_public && !groupIsPublic) return { data: null, error: "not accessible" }

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
