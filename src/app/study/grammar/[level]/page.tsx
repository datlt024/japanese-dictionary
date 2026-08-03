import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import AppLayout from "@/shared/components/layout/AppLayout"
import { isValidJlptLevel } from "@/server/services/study/jlpt-study.service"
import { searchGrammarsByKeyword } from "@/server/repositories/grammar/search-grammar.repository"
import type { GrammarSearchItem } from "@/domain/search"

import styles from "./page.module.css"

type Props = { params: Promise<{ level: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { level } = await params
    const upper = level.toUpperCase()
    return {
        title: `Ngữ pháp ${upper} | Yomi`,
        description: `Danh sách ngữ pháp tiếng Nhật cấp độ ${upper} cho người học Việt Nam`,
    }
}

function JlptBadge({ level }: { level: string | null | undefined }) {
    if (!level) return null
    return <span className={styles.jlptBadge} data-level={level}>{level}</span>
}

export default async function StudyGrammarLevelPage({ params }: Props) {
    const { level } = await params
    const upper = level.toUpperCase()

    if (!isValidJlptLevel(upper)) notFound()

    const { data, error } = await searchGrammarsByKeyword(upper)
    const items = (error ? [] : (data ?? [])) as GrammarSearchItem[]

    return (
        <AppLayout title={`Ngữ pháp ${upper}`} hideSearch>
            <main className={styles.page}>
                <div className={styles.header}>
                    <Link href="/study?tab=thu-vien" className={styles.backBtn}>
                        <ArrowLeft size={15} />
                        Thư viện
                    </Link>
                    <div className={styles.headerTitle}>
                        <span className={styles.levelBadge} data-level={upper}>{upper}</span>
                        <h1 className={styles.title}>Ngữ pháp</h1>
                        <span className={styles.count}>{items.length} mẫu</span>
                    </div>
                </div>

                {items.length === 0 ? (
                    <p className={styles.empty}>Chưa có dữ liệu ngữ pháp cho cấp độ này.</p>
                ) : (
                    <div className={styles.list}>
                        {items.map((item) => {
                            const display = item.short_meaning_vi || item.meaning_vi || item.meaning_en || "Đang cập nhật"
                            return (
                                <Link
                                    key={item.id}
                                    href={`/grammar/${item.id}?q=${encodeURIComponent(upper)}&lang=vi`}
                                    className={styles.card}
                                >
                                    <div className={styles.cardTop}>
                                        <span className={styles.pattern}>
                                            {item.display_pattern ?? item.pattern}
                                        </span>
                                        <JlptBadge level={item.jlpt_level} />
                                    </div>
                                    <p className={styles.meaning}>{display}</p>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </main>
        </AppLayout>
    )
}
