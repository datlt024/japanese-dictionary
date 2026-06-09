import type {
    VocabularyRelation,
    VocabularyRelationType,
} from "@/domain/vocabulary/vocabulary-relation.type"

export function getRelationsByType(
    relations: VocabularyRelation[],
    type: VocabularyRelationType
) {
    return relations.filter((item) => item.relation_type === type)
}