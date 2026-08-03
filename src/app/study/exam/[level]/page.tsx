import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isValidJlptLevel, JLPT_LEVELS } from "@/server/services/study/jlpt-study.service"
import MockExamClient from "@/features/dictionary/study/components/MockExamClient/MockExamClient"

type Props = { params: Promise<{ level: string }> }

export async function generateStaticParams() {
    return JLPT_LEVELS.map(level => ({ level: level.toLowerCase() }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { level } = await params
    const upper = level.toUpperCase()
    return {
        title: `Thi thử ${upper} | Yomi`,
        description: `Bài thi thử trắc nghiệm từ vựng tiếng Nhật cấp độ ${upper} dành cho người học Việt Nam`,
    }
}

export default async function ExamPage({ params }: Props) {
    const { level } = await params
    const upper = level.toUpperCase()
    if (!isValidJlptLevel(upper)) notFound()
    return <MockExamClient level={upper} />
}
