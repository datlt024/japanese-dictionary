import { notFound } from "next/navigation"
import type { Metadata } from "next"

import AppLayout from "@/shared/components/layout/AppLayout"
import JlptFlashcardClient from "@/features/dictionary/study/components/JlptFlashcardClient/JlptFlashcardClient"
import {
    getJlptStudyBatch,
    isValidJlptLevel,
    shuffleItems,
} from "@/server/services/study/jlpt-study.service"

type Props = { params: Promise<{ level: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { level } = await params
    const upperLevel = level.toUpperCase()
    if (!isValidJlptLevel(upperLevel)) return { title: "Học tập | Yomi" }
    return {
        title: `Flashcard ${upperLevel} | Yomi`,
        description: `Ôn luyện từ vựng tiếng Nhật cấp độ ${upperLevel} với flashcard.`,
    }
}

export default async function StudyLevelPage({ params }: Props) {
    const { level } = await params
    const upperLevel = level.toUpperCase()

    if (!isValidJlptLevel(upperLevel)) notFound()

    const items = shuffleItems(await getJlptStudyBatch(upperLevel, 50))

    return (
        <AppLayout title={`Flashcard ${upperLevel}`} hideSearchTabs>
            <JlptFlashcardClient
                level={upperLevel}
                initialItems={items}
            />
        </AppLayout>
    )
}
