import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import AppLayout from "@/shared/components/layout/AppLayout"
import {
    isValidJlptLevel,
    getJlptKanjiCount,
    getJlptKanjiItems,
    JLPT_LEVELS,
    type JlptLevel,
} from "@/server/services/study/jlpt-study.service"
import { kanjiJlptToLabel } from "@/features/dictionary/kanji/utils"

import styles from "./page.module.css"

export const revalidate = 86400

export async function generateStaticParams() {
    return JLPT_LEVELS.map((level) => ({ level: level.toLowerCase() }))
}

const PAGE_SIZE = 100

type Props = {
    params: Promise<{ level: string }>
    searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { level } = await params
    const upper = level.toUpperCase()
    return {
        title: `Hán tự ${upper} | Yomi`,
        description: `Danh sách Hán tự tiếng Nhật cấp độ ${upper} cho người học Việt Nam`,
    }
}

function JlptBadge({ level }: { level: string | null | undefined }) {
    if (!level) return null
    return <span className={styles.jlptBadge} data-level={level}>{level}</span>
}

function Pagination({ current, total, base }: { current: number; total: number; base: string }) {
    if (total <= 1) return null
    return (
        <div className={styles.pagination}>
            {current > 1 ? (
                <Link href={`${base}?page=${current - 1}`} className={styles.pageBtn}>← Trang trước</Link>
            ) : (
                <span className={styles.pageBtnDisabled}>← Trang trước</span>
            )}
            <span className={styles.pageInfo}>Trang {current} / {total}</span>
            {current < total ? (
                <Link href={`${base}?page=${current + 1}`} className={styles.pageBtn}>Trang tiếp →</Link>
            ) : (
                <span className={styles.pageBtnDisabled}>Trang tiếp →</span>
            )}
        </div>
    )
}

function KanjiSkeleton() {
    return (
        <div className={styles.grid}>
            {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className={styles.cardSkeleton} />
            ))}
        </div>
    )
}

async function KanjiGrid({
    level, from, to, page, totalPages, base,
}: {
    level: string; from: number; to: number; page: number; totalPages: number; base: string
}) {
    const items = await getJlptKanjiItems(level, from, to)

    if (items.length === 0) {
        return <p className={styles.empty}>Chưa có dữ liệu Hán tự cho cấp độ này.</p>
    }

    return (
        <>
            <div className={styles.grid}>
                {items.map((item) => {
                    const meaning = item.meaning_vi || item.meaning_en
                    const jlptLabel = kanjiJlptToLabel(item.jlpt)
                    return (
                        <Link
                            key={item.kanji}
                            href={`/kanji/${encodeURIComponent(item.kanji)}?q=${encodeURIComponent(level)}&lang=vi`}
                            className={styles.card}
                        >
                            <div className={styles.kanjiChar}>{item.kanji}</div>
                            <div className={styles.kanjiInfo}>
                                {item.han_viet && <p className={styles.hanViet}>{item.han_viet}</p>}
                                <p className={styles.meaning}>{meaning || "Đang cập nhật"}</p>
                                <div className={styles.meta}>
                                    <JlptBadge level={jlptLabel} />
                                    {item.stroke_count != null && (
                                        <span className={styles.stroke}>{item.stroke_count} nét</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
            <Pagination current={page} total={totalPages} base={base} />
        </>
    )
}

export default async function StudyKanjiLevelPage({ params, searchParams }: Props) {
    const { level } = await params
    const { page: pageParam } = await searchParams
    const upper = level.toUpperCase()

    if (!isValidJlptLevel(upper)) notFound()

    const page = Math.max(1, parseInt(pageParam ?? "1", 10))
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const base = `/study/kanji/${level}`

    const total = await getJlptKanjiCount(upper as JlptLevel)
    const totalPages = Math.ceil(total / PAGE_SIZE)
    const safePage = Math.min(page, Math.max(1, totalPages))

    return (
        <AppLayout title={`Hán tự ${upper}`} hideSearch>
            <main className={styles.page}>
                <div className={styles.header}>
                    <Link href="/study?tab=thu-vien" className={styles.backBtn}>
                        <ArrowLeft size={15} />
                        Thư viện
                    </Link>
                    <div className={styles.headerRow}>
                        <div className={styles.headerTitle}>
                            <span className={styles.levelBadge} data-level={upper}>{upper}</span>
                            <h1 className={styles.title}>Hán tự</h1>
                            <span className={styles.count}>{total.toLocaleString("vi-VN")} chữ</span>
                        </div>
                    </div>
                </div>

                <Suspense fallback={<KanjiSkeleton />}>
                    <KanjiGrid
                        level={upper}
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
