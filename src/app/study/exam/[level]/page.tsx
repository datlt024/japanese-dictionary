import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isValidJlptLevel, JLPT_LEVELS } from "@/server/services/study/jlpt-study.service"
import MockExamClient from "@/features/dictionary/study/components/MockExamClient/MockExamClient"

type Props = {
    params: Promise<{ level: string }>
    searchParams: Promise<{ year?: string }>
}

export async function generateStaticParams() {
    return JLPT_LEVELS.map(level => ({ level: level.toLowerCase() }))
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { level } = await params
    const { year } = await searchParams
    const upper = level.toUpperCase()
    const suffix = year ? ` ${year}` : ""
    return {
        title: `Thi thử ${upper}${suffix} | Yomi`,
        description: `Bài thi thử trắc nghiệm từ vựng tiếng Nhật cấp độ ${upper} dành cho người học Việt Nam`,
    }
}

export default async function ExamPage({ params, searchParams }: Props) {
    const { level } = await params
    const { year } = await searchParams
    const upper = level.toUpperCase()
    if (!isValidJlptLevel(upper)) notFound()
    return <MockExamClient level={upper} year={year} />
}
