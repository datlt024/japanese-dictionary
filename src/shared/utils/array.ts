export function uniqueById<T extends { id: number }>(
    items: T[]
) {
    return Array.from(
        new Map(
            items.map((item) => [item.id, item])
        ).values()
    )
}