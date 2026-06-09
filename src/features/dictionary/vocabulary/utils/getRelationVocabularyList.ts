import type {
    VocabularyRelation,
} from "@/domain/vocabulary/vocabulary-relation.type"

export type RelationVocabulary = NonNullable<
    VocabularyRelation["related_vocabulary"]
>

export function getRelationVocabularyList(
    relations: VocabularyRelation[]
): RelationVocabulary[] {
    return relations
        .map((item) => item.related_vocabulary)
        .filter(
            (item): item is RelationVocabulary =>
                item !== null && item !== undefined
        )
}