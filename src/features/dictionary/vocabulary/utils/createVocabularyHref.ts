export function createVocabularyHref(
    id: number,
    language: "vi" | "en",
    embedded: boolean
) {
    const params = new URLSearchParams({
        lang: language,
    })

    if (embedded) {
        params.set("embedded", "1")
    }

    return `/vocabulary/${id}?${params.toString()}`
}