import { describe, it, expect } from "vitest"
import { getVocabularyMeaning } from "./getVocabularyMeaning"
import type { Vocabulary } from "@/domain/vocabulary/vocabulary.type"

function makeVocab(senses: Vocabulary["senses"]): Vocabulary {
    return {
        id: 1,
        jmdict_id: null,
        word: "犬",
        kana: "いぬ",
        ruby: [],
        jlpt: "N5",
        verb_group: null,
        is_common: true,
        senses,
        writings: [],
        readings: [],
        collocations: [],
        relations: [],
        examples: [],
    }
}

function makeSense(meaning_vi: string | null, meaning_en: string | null) {
    return { id: 1, sense_index: 0, meaning_vi, meaning_en, part_of_speech: null, meaning_vi_glosses: null }
}

describe("getVocabularyMeaning", () => {
    it("returns meaning_vi from first sense when available", () => {
        const vocab = makeVocab([makeSense("con chó", "dog")])
        expect(getVocabularyMeaning(vocab)).toBe("con chó")
    })

    it("falls back to meaning_en when meaning_vi is null", () => {
        const vocab = makeVocab([makeSense(null, "dog")])
        expect(getVocabularyMeaning(vocab)).toBe("dog")
    })

    it("returns empty string when senses is empty", () => {
        const vocab = makeVocab([])
        expect(getVocabularyMeaning(vocab)).toBe("")
    })

    it("returns empty string when both meanings are null", () => {
        const vocab = makeVocab([makeSense(null, null)])
        expect(getVocabularyMeaning(vocab)).toBe("")
    })

    it("uses only the first sense", () => {
        const vocab = makeVocab([
            makeSense("con chó", "dog"),
            makeSense("thú cưng", "pet"),
        ])
        expect(getVocabularyMeaning(vocab)).toBe("con chó")
    })
})
