export function formatMeaningEn(
    text: string | null
) {
    if (!text) {
        return ""
    }

    return text
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
        .map(
            (item) =>
                item.charAt(0).toUpperCase() +
                item.slice(1)
        )
        .join("; ")
}

export function capitalizeFirstLetter(
    text: string
) {
    if (!text) {
        return ""
    }

    const trimmed = text.trim()

    return (
        trimmed.charAt(0).toUpperCase() +
        trimmed.slice(1)
    )
}