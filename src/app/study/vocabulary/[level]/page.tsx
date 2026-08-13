import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Layers } from "lucide-react"

import AppLayout from "@/shared/components/layout/AppLayout"
import {
    isValidJlptLevel,
    getJlptVocabCount,
    getJlptVocabItems,
    JLPT_LEVELS,
    type JlptLevel,
} from "@/server/services/study/jlpt-study.service"

import styles from "./page.module.css"

export const revalidate = 86400

export async function generateStaticParams() {
    return JLPT_LEVELS.map((level) => ({ level: level.toLowerCase() }))
}

const PAGE_SIZE = 50

type Props = {
    params: Promise<{ level: string }>
    searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { level } = await params
    const upper = level.toUpperCase()
    return {
        title: `Từ vựng ${upper} | Yomi`,
        description: `Danh sách từ vựng tiếng Nhật cấp độ ${upper} cho người học Việt Nam`,
    }
}

function Pagination({ current, total, base }: { current: number; total: number; base: string }) {
    if (total <= 1) return null
    return (
        <div className={styles.pagination}>
            {current > 1 ? (
                <Link href={`${base}?page=${current - 1}`} className={styles.pageBtn}>
                    ← Trang trước
                </Link>
            ) : (
                <span className={styles.pageBtnDisabled}>← Trang trước</span>
            )}
            <span className={styles.pageInfo}>Trang {current} / {total}</span>
            {current < total ? (
                <Link href={`${base}?page=${current + 1}`} className={styles.pageBtn}>
                    Trang tiếp →
                </Link>
            ) : (
                <span className={styles.pageBtnDisabled}>Trang tiếp →</span>
            )}
        </div>
    )
}

function GridSkeleton() {
    return (
        <div className={styles.grid}>
            {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className={styles.cardSkeleton} />
            ))}
        </div>
    )
}

async function VocabGrid({
    level,
    from,
    to,
    page,
    totalPages,
    base,
}: {
    level: JlptLevel
    from: number
    to: number
    page: number
    totalPages: number
    base: string
}) {
    const items = await getJlptVocabItems(level, from, to)

    if (items.length === 0) {
        return <p className={styles.empty}>Chưa có dữ liệu từ vựng cho cấp độ này.</p>
    }

    return (
        <>
            <div className={styles.grid}>
                {items.map((item) => (
                    <Link key={item.id} href={`/vocabulary/${item.id}`} className={styles.card}>
                        <div className={styles.wordBlock}>
                            <span className={styles.word}>{item.word}</span>
                            {item.kana && <span className={styles.kana}>{item.kana}</span>}
                        </div>
                        <p className={styles.meaning}>{item.meaning ?? "Đang cập nhật"}</p>
                    </Link>
                ))}
            </div>
            <Pagination current={page} total={totalPages} base={base} />
        </>
    )
}

export default async function StudyVocabularyLevelPage({ params, searchParams }: Props) {
    const { level } = await params
    const { page: pageParam } = await searchParams
    const upper = level.toUpperCase()

    if (!isValidJlptLevel(upper)) notFound()

    const page = Math.max(1, parseInt(pageParam ?? "1", 10))
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const base = `/study/vocabulary/${level}`

    // Count is fast (cached) — resolve before rendering so the header shows immediately.
    const total = await getJlptVocabCount(upper as JlptLevel)
    const totalPages = Math.ceil(total / PAGE_SIZE)
    const safePage = Math.min(page, Math.max(1, totalPages))

    return (
        <AppLayout title={`Từ vựng ${upper}`} hideSearch>
            <main className={styles.page}>
                <div className={styles.header}>
                    <Link href="/study?tab=thu-vien" className={styles.backBtn}>
                        <ArrowLeft size={15} />
                        Thư viện
                    </Link>
                    <div className={styles.headerRow}>
                        <div className={styles.headerTitle}>
                            <span className={styles.levelBadge} data-level={upper}>{upper}</span>
                            <h1 className={styles.title}>Từ vựng</h1>
                            <span className={styles.count}>{total.toLocaleString("vi-VN")} từ</span>
                        </div>
                        <Link href={`/study/${level}`} className={styles.flashcardBtn}>
                            <Layers size={14} />
                            Học flashcard
                        </Link>
                    </div>
                </div>

                {/* Grid suspends independently — header above is always shown immediately */}
                <Suspense fallback={<GridSkeleton />}>
                    <VocabGrid
                        level={upper as JlptLevel}
                        from={from}
                        to={to}
                        page={safePage}
                        totalPages={totalPages}
                        base={base}
                    />
                </Suspense>
            </main>
        </AppLayout>
    )
}
