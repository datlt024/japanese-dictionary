import type { SupabaseClient } from "@supabase/supabase-js"
import type { PublicNotebook } from "@/domain/notebook/notebook.type"
import type { Database } from "@/shared/types/database.generated"

export async function listPublicNotebooks(
    supabase: SupabaseClient<Database>
): Promise<{ data: PublicNotebook[] | null; error: unknown }> {
    const { data, error } = await supabase
        .from("notebooks")
        .select("id, name, description, public_category, public_description, display_order")
        .eq("is_public", true)
        .order("display_order", { ascending: true })
        .order("name", { ascending: true })

    if (error || !data) return { data: null, error }

    // Fetch item counts in parallel
    const counts = await Promise.all(
        data.map((nb) =>
            supabase
                .from("notebook_items")
                .select("*", { count: "exact", head: true })
                .eq("notebook_id", nb.id)
                .then(({ count }) => ({ id: nb.id, count: count ?? 0 }))
        )
    )
    const countMap = new Map(counts.map((c) => [c.id, c.count]))

    const notebooks: PublicNotebook[] = data.map((nb) => ({
        id: nb.id,
        name: nb.name,
        description: nb.description,
        public_category: nb.public_category,
        public_description: nb.public_description,
        display_order: nb.display_order,
        item_count: countMap.get(nb.id) ?? 0,
    }))

    return { data: notebooks, error: null }
}

export async function getPublicNotebook(
    supabase: SupabaseClient<Database>,
    notebookId: string
): Promise<{ data: PublicNotebook | null; error: unknown }> {
    const { data, error } = await supabase
        .from("notebooks")
        .select("id, name, description, public_category, public_description, display_order")
        .eq("id", notebookId)
        .eq("is_public", true)
        .maybeSingle()

    if (error || !data) return { data: null, error }

    const { count } = await supabase
        .from("notebook_items")
        .select("*", { count: "exact", head: true })
        .eq("notebook_id", notebookId)

    return {
        data: {
            id: data.id,
            name: data.name,
            description: data.description,
            public_category: data.public_category,
            public_description: data.public_description,
            display_order: data.display_order,
            item_count: count ?? 0,
        },
        error: null,
    }
}
