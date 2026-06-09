export type SenseGloss = {
    index: number
    meaning: string
}

export function getSenseGlosses(value: unknown): SenseGloss[] {
    if (!Array.isArray(value)) {
        return []
    }

    return value.filter((item): item is SenseGloss => {
        return (
            typeof item === "object" &&
            item !== null &&
            "index" in item &&
            "meaning" in item &&
            typeof item.index === "number" &&
            typeof item.meaning === "string"
        )
    })
}