export function normalizeKeyword(keyword: string) {
    return keyword.trim()
}

export function escapeLikePattern(keyword: string) {
    return keyword.replace(/[%_]/g, "\\$&")
}

export function katakanaToHiragana(text: string) {
    return text.replace(
        /[\u30a1-\u30f6]/g,
        (char) =>
            String.fromCharCode(
                char.charCodeAt(0) - 0x60
            )
    )
}