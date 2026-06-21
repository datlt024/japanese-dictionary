import Link from "next/link"

import styles from "./page.module.css"

import AppLayout from "@/shared/components/layout/AppLayout"
import VocabularyDetailContent from "@/features/dictionary/vocabulary/components/VocabularyDetailContent"

import {
    getVocabularyById,
    getVocabularyKanjis,
} from "@/server/services/vocabulary/vocabulary.service"

import { getRelatedVocabulariesFromDatabase } from "@/server/services/vocabulary/related-vocabulary.service"

type Props = {
    params: Promise<{
        id: string
    }>
    searchParams?: Promise<{
        lang?: string
        embedded?: string
    }>
}

export default async function VocabularyDetailPage({
    params,
    searchParams,
}: Props) {
    const resolvedParams = await params
    const resolvedSearchParams = searchParams
        ? await searchParams
        : {}

    const language: "vi" | "en" =
        resolvedSearchParams.lang === "en" ? "en" : "vi"

    const isEmbedded = resolvedSearchParams.embedded === "1"

    const vocabularyId = Number(resolvedParams.id)
    const vocabulary = Number.isFinite(vocabularyId)
        ? await getVocabularyById(vocabularyId)
        : null

    const relatedResult = vocabulary
        ? await getRelatedVocabulariesFromDatabase(vocabulary.word)
        : {
            results: [],
            error: null,
        }

    const kanjiDetails = vocabulary
        ? await getVocabularyKanjis(vocabulary.word)
        : []

    const relatedVocabularies = relatedResult.results

    const content = (
        <main
            className={
                isEmbedded
                    ? `${styles.vocabularyDetail} ${styles.embeddedVocabularyDetail}`
                    : styles.vocabularyDetail
            }
            data-quick-lookup-root="true"
        >
            {!vocabulary ? (
                <div className={styles.detailMain}>
                    <h1>Không tìm thấy từ vựng</h1>

                    {!isEmbedded && (
                        <Link href="/" className={styles.backButton}>
                            ← Quay lại
                        </Link>
                    )}
                </div>
            ) : (
                <VocabularyDetailContent
                    vocabulary={vocabulary}
                    language={language}
                    relatedVocabularies={relatedVocabularies}
                    kanjiDetails={kanjiDetails}
                    embedded={isEmbedded}
                />
            )}
        </main>
    )

    if (isEmbedded) {
        return content
    }

    return (
        <AppLayout
            title="Chi tiết từ vựng"
            searchKeyword={vocabulary?.word || ""}
            activeSearchTab="vocabulary"
        >
            {content}
        </AppLayout>
    )
}