"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"

import styles from "@/features/dictionary/kanji/styles/KanjiDetail.module.css"

import AppLayout from "@/shared/components/layout/AppLayout"
import KanjiDetailContent from "@/features/dictionary/kanji/components/KanjiDetailContent"

import { uniqueArray } from "@/shared/utils/uniqueArray"

import type {
    Kanji,
    KanjiReadingGroup,
} from "@/domain/kanji"

import {
    getKanjiByCharacter,
    getWordsByReadingGroups,
} from "@/features/dictionary/kanji/services/kanji.service"

import {
    extractKanjis,
} from "@/features/dictionary/kanji/utils"

export default function KanjiDetailPage() {
    const params = useParams<{ id: string }>()
    const searchParams = useSearchParams()

    const [kanji, setKanji] = useState<Kanji | null>(null)

    const [kunyomiGroups, setKunyomiGroups] =
        useState<KanjiReadingGroup[]>([])

    const [onyomiGroups, setOnyomiGroups] =
        useState<KanjiReadingGroup[]>([])

    const [loading, setLoading] = useState(true)
    const [examplesLoading, setExamplesLoading] = useState(false)

    const currentKanji = useMemo(() => {
        return decodeURIComponent(params.id).replace(/\0/g, "")
    }, [params.id])

    const searchKeyword = searchParams.get("q") || currentKanji

    const kanjiOptions = useMemo(() => {
        const kanjis = extractKanjis(searchKeyword)

        if (kanjis.length === 0) {
            return currentKanji ? [currentKanji] : []
        }

        return uniqueArray(kanjis)
    }, [searchKeyword, currentKanji])

    useEffect(() => {
        let cancelled = false

        async function fetchKanji() {
            setLoading(true)
            setExamplesLoading(false)
            setKanji(null)
            setKunyomiGroups([])
            setOnyomiGroups([])

            const kanjiData =
                await getKanjiByCharacter(currentKanji)

            if (cancelled) {
                return
            }

            if (!kanjiData) {
                setKanji(null)
                setLoading(false)
                return
            }

            setKanji(kanjiData)
            setLoading(false)
            setExamplesLoading(true)

            const [kunyomiData, onyomiData] =
                await Promise.all([
                    getWordsByReadingGroups(
                        currentKanji,
                        kanjiData.kunyomi
                    ),
                    getWordsByReadingGroups(
                        currentKanji,
                        kanjiData.onyomi
                    ),
                ])

            if (cancelled) {
                return
            }

            setKunyomiGroups(kunyomiData)
            setOnyomiGroups(onyomiData)
            setExamplesLoading(false)
        }

        fetchKanji()

        return () => {
            cancelled = true
        }
    }, [currentKanji])

    return (
        <AppLayout
            title="Hán tự"
            searchKeyword={searchKeyword}
            activeSearchTab="kanji"
        >
            <main
                className={styles.kanjiDetailPage}
                data-quick-lookup-root="true"
            >
                <KanjiDetailContent
                    kanji={kanji}
                    loading={loading}
                    examplesLoading={examplesLoading}
                    kunyomiGroups={kunyomiGroups}
                    onyomiGroups={onyomiGroups}
                    currentKanji={currentKanji}
                    kanjiOptions={kanjiOptions}
                    searchKeyword={searchKeyword}
                />
            </main>
        </AppLayout>
    )
}