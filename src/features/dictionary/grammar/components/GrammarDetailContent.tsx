import type { GrammarPoint } from "@/domain/grammar"
import type { GrammarSearchItem } from "@/domain/search"

import DictionaryCommunityCard from "@/shared/components/DictionaryCommunityCard/DictionaryCommunityCard"

import ConfusableGrammarSection from "./ConfusableGrammarSection/ConfusableGrammarSection"
import ExampleSection from "@/shared/components/ExampleSection/ExampleSection"
import GrammarExplanationSection from "./GrammarExplanationSection/GrammarExplanationSection"
import GrammarHeroCard from "./GrammarHeroCard/GrammarHeroCard"
import GrammarMeaningSection from "./GrammarMeaningSection/GrammarMeaningSection"
import GrammarMemoryTipCard from "./GrammarMemoryTipCard/GrammarMemoryTipCard"
import GrammarNoteSection from "./GrammarNoteSection/GrammarNoteSection"
import GrammarStructureSection from "./GrammarStructureSection/GrammarStructureSection"
import RelatedGrammarSection from "./RelatedGrammarSection/RelatedGrammarSection"

import styles from "./GrammarDetailContent.module.css"

type Props = {
    grammar: GrammarPoint
    relatedGrammars: GrammarSearchItem[]
    keyword: string
}

export default function GrammarDetailContent({
    grammar,
    relatedGrammars,
    keyword,
}: Props) {
    return (
        <main className={styles.grammarDetailPage}>
            <div className={styles.grammarDetailLayout}>
                <div className={styles.mainColumn}>
                    <GrammarHeroCard grammar={grammar} />
                    <GrammarStructureSection grammar={grammar} />
                    <GrammarMeaningSection grammar={grammar} />
                    <GrammarExplanationSection grammar={grammar} />

                    <ExampleSection examples={grammar.examples} />

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
