export type DictionaryLanguage = "vi" | "en"

export const DEFAULT_DICTIONARY_LANGUAGE: DictionaryLanguage =
    "vi"

export function normalizeDictionaryLanguage(
    value: string | null
): DictionaryLanguage {
    if (value === "en" || value === "vi") {
        return value
    }

    return DEFAULT_DICTIONARY_LANGUAGE
}

export function getDictionaryLanguageLabel(
    language: DictionaryLanguage
) {
    if (language === "en") {
        return "Nhật - Anh"
    }

    return "Nhật - Việt"
}