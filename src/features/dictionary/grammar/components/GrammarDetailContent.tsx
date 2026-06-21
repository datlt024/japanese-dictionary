"use client"

import type { GrammarPoint } from "@/domain/grammar"

import DictionaryCommunityCard from "@/shared/components/DictionaryCommunityCard/DictionaryCommunityCard"
import ExampleSection from "@/shared/components/ExampleSection/ExampleSection"

import ConfusableGrammarSection from "./ConfusableGrammarSection/ConfusableGrammarSection"
import GrammarExplanationSection from "./GrammarExplanationSection/GrammarExplanationSection"
import GrammarHeroCard from "./GrammarHeroCard/GrammarHeroCard"
import GrammarMeaningSection from "./GrammarMeaningSection/GrammarMeaningSection"
import GrammarMemoryTipCard from "./GrammarMemoryTipCard/GrammarMemoryTipCard"
import GrammarNoteSection from "./GrammarNoteSection/GrammarNoteSection"
import GrammarStructureSection from "./GrammarStructureSection/GrammarStructureSection"
import RelatedGrammarSection from "./RelatedGrammarSection/RelatedGrammarSection"

import styles from "./GrammarDetailContent.module.css"

type Props = {
    grammar: GrammarPoint | null
    relatedGrammars: GrammarPoint[]
    loading: boolean
    keyword: string
}

export default function GrammarDetailContent({
    grammar,
    relatedGrammars,
    loading,
    keyword,
}: Props) {
    if (loading) {
        return (
            <main className={styles.grammarDetailPage}>
                <div className={styles.stateCard}>
                    Đang tải ngữ pháp...
                </div>
            </main>
        )
    }

    if (!grammar) {
        return (
            <main className={styles.grammarDetailPage}>
                <div className={styles.stateCard}>
                    Không tìm thấy ngữ pháp
                </div>
            </main>
        )
    }

    return (
        <main className={styles.grammarDetailPage}>
            <div className={styles.grammarDetailLayout}>
                <div className={styles.mainColumn}>
                    <GrammarHeroCard grammar={grammar} />
                    <GrammarStructureSection grammar={grammar} />
                    <GrammarMeaningSection grammar={grammar} />
                    <GrammarExplanationSection grammar={grammar} />

                    <ExampleSection />

                    <ConfusableGrammarSection grammar={grammar} />
                    <GrammarNoteSection grammar={grammar} />

                    <RelatedGrammarSection
                        grammar={grammar}
                        relatedGrammars={relatedGrammars}
                        keyword={keyword}
                    />
                </div>

                <aside className={styles.sideColumn}>
                    <GrammarMemoryTipCard grammar={grammar} />
                    <DictionaryCommunityCard />
                </aside>
            </div>
        </main>
    )
}