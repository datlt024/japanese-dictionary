import { capitalizeFirstLetter } from "./formatMeaning"

export function formatMeaningVi(text: string) {
    const normalized = text.trim()

    const dictionaryPairs: Record<string, string> = {
        "sặc sỡ lòe loẹt": "sặc sỡ; lòe loẹt",
        "công khai trắng trợn": "công khai; trắng trợn",
    }

    return capitalizeFirstLetter(dictionaryPairs[normalized] || normalized)
}