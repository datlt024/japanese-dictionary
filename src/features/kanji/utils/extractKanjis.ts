export function extractKanjis(text: string) {
    return Array.from(text.matchAll(/[\u4e00-\u9faf]/g)).map(
        (match) => match[0]
    )
}