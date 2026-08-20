import { describe, it, expect } from "vitest"
import { getRelationsByType } from "./getRelationsByType"
import type { VocabularyRelation } from "@/domain/vocabulary/vocabulary-relation.type"

function makeRelation(id: number, type: VocabularyRelation["relation_type"]): VocabularyRelation {
    return {
        id,
        vocabulary_id: 1,
        related_vocabulary_id: id * 10,
        relation_type: type,
        note_vi: null,
        source: null,
        status: null,
        confidence: null,
        related_vocabulary: null,
    }
}

describe("getRelationsByType", () => {
    const relations: VocabularyRelation[] = [
        makeRelation(1, "synonym"),
        makeRelation(2, "antonym"),
        makeRelation(3, "synonym"),
        makeRelation(4, "related"),
    ]

    it("returns only synonyms", () => {
        const result = getRelationsByType(relations, "synonym")
        expect(result).toHaveLength(2)
        expect(result.every((r) => r.relation_type === "synonym")).toBe(true)
    })

    it("returns only antonyms", () => {
        const result = getRelationsByType(relations, "antonym")
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe(2)
    })

    it("returns only related", () => {
        const result = getRelationsByType(relations, "related")
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe(4)
    })

    it("returns empty array when no matches", () => {
        const result = getRelationsByType([], "synonym")
        expect(result).toEqual([])
    })

    it("returns empty array for empty relations", () => {
        const result = getRelationsByType([], "related")
        expect(result).toEqual([])
    })
})
