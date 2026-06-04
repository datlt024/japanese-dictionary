import { DictionaryLanguage } from "@/shared/types/dictionaryLanguage"

export function getDictionaryLanguage(
    searchParams: URLSearchParams
): DictionaryLanguage {
    const lang = searchParams.get("lang")

    return lang === "en"
        ? "en"
        : "vi"
}