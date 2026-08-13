export function uniqueById<T extends { id: number }>(
    items: T[]
) {
    return Array.from(
        new Map(
            items.map((item) => [item.id, item])
        ).values()
    )
}

export function uniqueArray<T>(items: T[]): T[] {
    return Array.from(new Set(items))
}