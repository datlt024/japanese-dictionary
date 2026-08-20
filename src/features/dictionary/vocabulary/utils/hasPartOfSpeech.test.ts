import { describe, it, expect } from "vitest"
import { hasPartOfSpeech } from "./hasPartOfSpeech"

function makeSense(parts: string[] | null) {
    return {
        id: 1,
        sense_index: 0,
        meaning_vi: null,
        meaning_en: null,
        part_of_speech: parts,
        meaning_vi_glosses: null,
    }
}

describe("hasPartOfSpeech", () => {
    it("returns true when part of speech is present", () => {
        const sense = makeSense(["noun", "verb"])
        expect(hasPartOfSpeech(sense, "noun")).toBe(true)
    })

    it("returns false when part of speech is not present", () => {
        const sense = makeSense(["noun"])
        expect(hasPartOfSpeech(sense, "verb")).toBe(false)
    })

    it("returns false when part_of_speech is null", () => {
        const sense = makeSense(null)
        expect(hasPartOfSpeech(sense, "noun")).toBeFalsy()
    })

    it("returns false for empty part_of_speech array", () => {
        const sense = makeSense([])
        expect(hasPartOfSpeech(sense, "noun")).toBe(false)
    })

    it("is case-sensitive", () => {
        const sense = makeSense(["Noun"])
        expect(hasPartOfSpeech(sense, "noun")).toBe(false)
        expect(hasPartOfSpeech(sense, "Noun")).toBe(true)
    })

    it("matches exact strings", () => {
        const sense = makeSense(["transitive verb"])
        expect(hasPartOfSpeech(sense, "transitive verb")).toBe(true)
        expect(hasPartOfSpeech(sense, "verb")).toBe(false)
    })
})
