export function createKanjiHref(
    kanji: string,
    keyword: string,
    language: "vi" | "en",
    embedded: boolean
) {
    const params = new URLSearchParams({
        q: keyword,
        lang: language,
    })

    if (embedded) {
        params.set("embedded", "1")
    }

    return `/kanji/${encodeURIComponent(kanji)}?${params.toString()}`
}