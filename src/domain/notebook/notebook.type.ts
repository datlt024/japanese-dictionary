export type NotebookItemType = "vocabulary" | "kanji" | "grammar"

export type PublicNotebook = {
    id: string
    name: string
    description: string | null
    public_category: string | null
    public_description: string | null
    display_order: number
    item_count: number
}

// A section in the Khám phá tab: either a public group or a category of standalone notebooks
export type ExploreSection = {
    type: "group" | "category"
    id: string        // group uuid or category name
    name: string
    description: string | null
    display_order: number
    notebooks: PublicNotebook[]
}

export type NotebookGroup = {
    id: string
    user_id: string
    name: string
    description: string | null
    created_at: string
    updated_at: string
}

export type Notebook = {
    id: string
    user_id: string
    name: string
    description: string | null
    group_id: string | null
    created_at: string
    updated_at: string
}

export type NotebookWithCount = Notebook & {
    item_count: number
}

export type NotebookItem = {
    id: string
    notebook_id: string
    user_id: string
    item_type: NotebookItemType
    item_id: string
    added_at: string
}

export type NotebookItemDisplay = {
    title: string
    subtitle: string | null
    han_viet: string | null
    meaning: string | null
    href: string
}

export type EnrichedNotebookItem = NotebookItem & {
    display: NotebookItemDisplay
}
