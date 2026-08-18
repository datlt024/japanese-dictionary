import type { Metadata } from "next"

import styles from "./page.module.css"

import AppLayout from "@/shared/components/layout/AppLayout"
import EmptyState from "@/shared/components/EmptyState/EmptyState"
import VocabularyDetailContent from "@/features/dictionary/vocabulary/components/VocabularyDetailContent"

import {
    getVocabularyById,
    getVocabularyKanjis,
} from "@/server/services/vocabulary/vocabulary.service"
import { supabaseServer } from "@/server/supabase/server"

export const revalidate = 86400

export async function generateStaticParams() {
    const { data } = await supabaseServer
        .from("vocabularies")
        .select("id")
        .in("jlpt", ["N5", "N4", "N3"])
        .limit(5000)
    return (data ?? []).map((v) => ({ id: String(v.id) }))
}

type Props = {
    params: Promise<{
        id: string
    }>
    searchParams?: Promise<{
        lang?: string
        embedded?: string
        q?: string
    }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { id } = await params
    const lang = searchParams ? (await searchParams).lang : undefined
    const language = lang === "en" ? "en" : "vi"
    const vocabularyId = Number(id)
    const vocabulary = Number.isFinite(vocabularyId) ? await getVocabularyById(vocabularyId) : null
    if (!vocabulary) return { title: "Từ vựng | Yomi" }
    const sense = vocabulary.senses?.[0]
    const meaning = language === "en"
        ? (sense?.meaning_en || sense?.meaning_vi || "")
        : (sense?.meaning_vi || sense?.meaning_en || "")
    const kana = vocabulary.readings?.[0]?.reading ?? ""
    return {
        title: `${vocabulary.word} ${kana ? `(${kana})` : ""} — Từ vựng | Yomi`.trim(),
        description: meaning
            ? `${vocabulary.word}: ${meaning}. Tra cứu từ vựng tiếng Nhật với ví dụ và phiên âm đầy đủ.`
            : `Tra cứu từ vựng ${vocabulary.word} trong từ điển Nhật Việt Yomi.`,
    }
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
    const searchKeyword = resolvedSearchParams.q?.trim() || ""

    const vocabularyId = Number(resolvedParams.id)
    const vocabulary = Number.isFinite(vocabularyId)
        ? await getVocabularyById(vocabularyId)
        : null

    const kanjiDetails = vocabulary
        ? await getVocabularyKanjis(vocabulary.word)
        : []

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
                    <EmptyState
                        title="Không tìm thấy từ vựng"
                        description={
                            searchKeyword
                                ? `Không tìm thấy "${searchKeyword}" trong từ điển. Thử dịch bằng AI để xem ngữ nghĩa đầy đủ.`
                                : "Từ vựng này không có trong từ điển."
                        }
                        backHref={
                            searchKeyword
                                ? `/translate?q=${encodeURIComponent(searchKeyword)}`
                                : (isEmbedded ? undefined : "/")
                        }
                        backLabel={searchKeyword ? "Dịch bằng AI" : "Về trang chủ"}
                    />
                </div>
            ) : (
                <VocabularyDetailContent
                    vocabulary={vocabulary}
                    language={language}
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