import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import AppLayout from "@/shared/components/layout/AppLayout"
import { isValidJlptLevel } from "@/server/services/study/jlpt-study.service"
import { getKanjisByJlptLevel } from "@/server/repositories/kanji/search-kanji.repository"
import type { KanjiSearchItem } from "@/domain/search"

import styles from "./page.module.css"

type Props = { params: Promise<{ level: string }> }

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

export default async function StudyKanjiLevelPage({ params }: Props) {
    const { level } = await params
    const upper = level.toUpperCase()

    if (!isValidJlptLevel(upper)) notFound()

    const { data, error } = await getKanjisByJlptLevel(upper)
    const items = (error ? [] : (data ?? [])) as KanjiSearchItem[]

    return (
        <AppLayout title={`Hán tự ${upper}`} hideSearch>
            <main className={styles.page}>
                <div className={styles.header}>
                    <Link href="/study?tab=thu-vien" className={styles.backBtn}>
                        <ArrowLeft size={15} />
                        Thư viện
                    </Link>
                    <div className={styles.headerTitle}>
                        <span className={styles.levelBadge} data-level={upper}>{upper}</span>
                        <h1 className={styles.title}>Hán tự</h1>
                        <span className={styles.count}>{items.length} chữ</span>
                    </div>
                </div>

                {items.length === 0 ? (
                    <p className={styles.empty}>Chưa có dữ liệu Hán tự cho cấp độ này.</p>
                ) : (
                    <div className={styles.grid}>
                        {items.map((item) => {
                            const meaning = item.meaning_vi || item.meaning_en
                            const jlptLabel = item.jlpt != null ? `N${item.jlpt}` : null
                            return (
                                <Link
                                    key={item.kanji}
                                    href={`/kanji/${encodeURIComponent(item.kanji)}?q=${encodeURIComponent(upper)}&lang=vi`}
                                    className={styles.card}
                                >
                                    <div className={styles.kanjiChar}>{item.kanji}</div>
                                    <div className={styles.kanjiInfo}>
                                        {item.han_viet && (
                                            <p className={styles.hanViet}>{item.han_viet}</p>
                                        )}
                                        <p className={styles.meaning}>
                                            {meaning || "Đang cập nhật"}
                                        </p>
                                        <div className={styles.meta}>
                                            <JlptBadge level={jlptLabel} />
                                            {item.stroke_count != null && (
                                                <span className={styles.stroke}>
                                                    {item.stroke_count} nét
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </main>
        </AppLayout>
    )
}
