import type { Metadata } from "next"
import Link from "next/link"

import AppLayout from "@/shared/components/layout/AppLayout"
import EmptyState from "@/shared/components/EmptyState/EmptyState"

import { searchDictionary } from "@/features/dictionary/search/services/search.service"

import {
    normalizeSearchTab,
    normalizeAppSearchTab,
} from "@/shared/constants/search-tabs"

import { normalizeDictionaryLanguage } from "@/shared/types/dictionaryLanguage"
import type { DictionaryLanguage } from "@/shared/types/dictionaryLanguage"

import type { VocabularyResult, KanjiSearchItem, GrammarSearchItem } from "@/domain/search"

import styles from "./page.module.css"

type Props = {
    searchParams: Promise<{
        q?: string
        tab?: string
        lang?: string
    }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const resolved = await searchParams
    const keyword = resolved.q?.trim() || ""
    return {
        title: keyword ? `"${keyword}" — Tra cứu | Yomi` : "Tra cứu | Yomi",
        description: keyword
            ? `Kết quả tra cứu tiếng Nhật cho "${keyword}" — từ vựng, Hán tự, ngữ pháp`
            : "Tra cứu từ vựng, Hán tự và ngữ pháp tiếng Nhật cho người học Việt Nam",
    }
}

// ── Sub-components ─────────────────────────────────────────────────────────

function JlptBadge({ level }: { level: string | null | undefined }) {
    if (!level) return null
    return <span className={styles.jlptBadge} data-level={level}>{level}</span>
}

function VocabularyList({ items, language }: { items: VocabularyResult[]; language: DictionaryLanguage }) {
    if (items.length === 0) return null
    return (
        <section className={styles.resultSection}>
            <h2 className={styles.sectionTitle}>
                Từ vựng
                <span className={styles.resultCount}>{items.length} kết quả</span>
            </h2>
            <div className={styles.vocabList}>
                {items.map((item) => {
                    const kana = Array.isArray(item.kana) ? item.kana[0] : item.kana
                    return (
                        <Link
                            key={item.id}
                            href={`/vocabulary/${item.id}?lang=${language}`}
                            className={styles.vocabCard}
                        >
                            <div className={styles.vocabWordCol}>
                                <span className={styles.vocabWord}>{item.word}</span>
                                {kana && kana !== item.word && (
                                    <span className={styles.vocabKana}>{kana}</span>
                                )}
                            </div>
                            <div className={styles.vocabDivider} />
                            <p className={styles.vocabMeaning}>
                                {item.meaning || "Đang cập nhật"}
                            </p>
                            <div className={styles.vocabBadges}>
                                <JlptBadge level={item.jlpt} />
                                {item.is_common && (
                                    <span className={styles.commonBadge}>Thông dụng</span>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}

function KanjiList({
    items,
    keyword,
    language,
}: {
    items: KanjiSearchItem[]
    keyword: string
    language: DictionaryLanguage
}) {
    if (items.length === 0) return null
    return (
        <section className={styles.resultSection}>
            <h2 className={styles.sectionTitle}>
                Hán tự
                <span className={styles.resultCount}>{items.length} kết quả</span>
            </h2>
            <div className={styles.kanjiGrid}>
                {items.map((item) => {
                    const meaning =
                        language === "en"
                            ? item.meaning_en || item.meaning_vi
                            : item.meaning_vi || item.meaning_en
                    return (
                        <Link
                            key={item.kanji}
                            href={`/kanji/${encodeURIComponent(item.kanji)}?q=${encodeURIComponent(keyword)}&lang=${language}`}
                            className={styles.kanjiCard}
                        >
                            <div className={styles.kanjiChar}>{item.kanji}</div>
                            <div className={styles.kanjiInfo}>
                                {item.han_viet && (
                                    <p className={styles.kanjiHanViet}>{item.han_viet}</p>
                                )}
                                <p className={styles.kanjiMeaning}>
                                    {meaning || "Đang cập nhật"}
                                </p>
                                <div className={styles.kanjiMeta}>
                                    <JlptBadge level={item.jlpt != null ? `N${item.jlpt}` : null} />
                                    {item.stroke_count != null && (
                                        <span className={styles.strokeBadge}>
                                            {item.stroke_count} nét
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}

function GrammarList({
    items,
    keyword,
    language,
}: {
    items: GrammarSearchItem[]
    keyword: string
    language: DictionaryLanguage
}) {
    if (items.length === 0) return null
    return (
        <section className={styles.resultSection}>
            <h2 className={styles.sectionTitle}>
                Ngữ pháp
                <span className={styles.resultCount}>{items.length} kết quả</span>
            </h2>
            <div className={styles.grammarList}>
                {items.map((item) => {
                    const meaning =
                        language === "en"
                            ? item.meaning_en || item.meaning_vi
                            : item.meaning_vi || item.meaning_en
                    const display = item.short_meaning_vi || meaning || "Đang cập nhật"
                    return (
                        <Link
                            key={item.id}
                            href={`/grammar/${item.id}?q=${encodeURIComponent(keyword)}&lang=${language}`}
                            className={styles.grammarCard}
                        >
                            <div className={styles.grammarTop}>
                                <span className={styles.grammarPattern}>
                                    {item.display_pattern ?? item.pattern}
                                </span>
                                <JlptBadge level={item.jlpt_level} />
                            </div>
                            <p className={styles.grammarMeaning}>{display}</p>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}

function ComingSoonState({ tab }: { tab: string }) {
    const labels: Record<string, string> = {
        example: "Mẫu câu",
        jpjp: "Từ điển Nhật — Nhật",
    }
    return (
        <EmptyState
            title={`${labels[tab] ?? "Tính năng"} đang phát triển`}
            description="Chức năng này sẽ sớm được ra mắt. Hãy thử tìm kiếm từ vựng, Hán tự hoặc ngữ pháp nhé!"
            backHref="/"
            backLabel="Về trang chủ"
        />
    )
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function SearchPage({ searchParams }: Props) {
    const resolved = await searchParams
    const keyword = resolved.q?.trim() || ""
    const tab = normalizeSearchTab(resolved.tab ?? null)
    const language = normalizeDictionaryLanguage(resolved.lang ?? null)
    const activeTab = normalizeAppSearchTab(resolved.tab ?? null)

    // tabs with no backend yet
    if (tab === "example" || tab === "jpjp") {
        return (
            <AppLayout title="Tra cứu" searchKeyword={keyword} activeSearchTab={activeTab}>
                <main className={styles.searchPage}>
                    <ComingSoonState tab={tab} />
                </main>
            </AppLayout>
        )
    }

    const result = keyword
        ? await searchDictionary(keyword, tab, language)
        : null

    const hasResults = result && (
        result.vocabularies.length > 0 ||
        result.kanjis.length > 0 ||
        result.grammars.length > 0
    )

    return (
        <AppLayout title="Tra cứu" searchKeyword={keyword} activeSearchTab={activeTab}>
            <main className={styles.searchPage}>
                {!keyword ? (
                    <EmptyState
                        title="Nhập từ khóa để tra cứu"
                        description="Vui lòng nhập từ khóa vào thanh tìm kiếm phía trên."
                        backHref="/"
                        backLabel="Về trang chủ"
                    />
                ) : !hasResults ? (
                    <EmptyState
                        title="Không tìm thấy kết quả"
                        keyword={keyword}
                        description={`Không tìm thấy "${keyword}" trong từ điển. Thử dịch toàn câu hoặc tra ngữ cảnh khác.`}
                        backHref={`/translate?q=${encodeURIComponent(keyword)}`}
                        backLabel="Dịch bằng AI"
                    />
                ) : (
                    <>
                        <p className={styles.resultSummary}>
                            Kết quả cho <strong>&ldquo;{keyword}&rdquo;</strong>
                        </p>
                        <VocabularyList items={result.vocabularies} language={language} />
                        <KanjiList items={result.kanjis} keyword={keyword} language={language} />
                        <GrammarList items={result.grammars} keyword={keyword} language={language} />
                    </>
                )}
            </main>
        </AppLayout>
    )
}
