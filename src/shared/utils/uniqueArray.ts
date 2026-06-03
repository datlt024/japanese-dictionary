export function uniqueArray<T>(items: T[]) {
    return Array.from(new Set(items))
}