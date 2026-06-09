import { capitalizeFirstLetter } from "./formatMeaning"

export function formatGlossMeaning(text: string) {
    return capitalizeFirstLetter(text.trim())
}