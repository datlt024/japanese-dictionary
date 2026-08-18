import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"

import styles from "./page.module.css"

import AppLayout from "@/shared/components/layout/AppLayout"
import DailyVocabularySection, {
    buildDailyItems,
    getDailyWordList,
} from "@/features/home/components/DailyVocabularySection/DailyVocabularySection"
import SearchHistorySection from "@/features/home/components/SearchHistorySection/SearchHistorySection"
import { getDailyVocabularyIds } from "@/server/services/vocabulary/vocabulary.service"

export const metadata: Metadata = {
  title: "Yomi — Từ điển Nhật Việt",
  description:
    "Tra cứu từ vựng, Hán tự và ngữ pháp tiếng Nhật dành cho người học Việt Nam. Đầy đủ ví dụ, phiên âm và giải thích bằng tiếng Việt.",
}

const JLPT_QUICK_LINKS = [
  { level: "N5", href: "/study/n5", color: "#16a34a", desc: "Cơ bản" },
  { level: "N4", href: "/study/n4", color: "#2563eb", desc: "Sơ trung cấp" },
  { level: "N3", href: "/study/n3", color: "#7c3aed", desc: "Trung cấp" },
  { level: "N2", href: "/study/n2", color: "#ea580c", desc: "Nâng cao" },
  { level: "N1", href: "/study/n1", color: "#dc2626", desc: "Thành thạo" },
]

async function DailyVocabularySectionAsync() {
    const words = getDailyWordList()
    const rows = await getDailyVocabularyIds(words)
    const items = buildDailyItems(rows)
    return <DailyVocabularySection items={items} />
}

function DailyVocabularySkeleton() {
  return (
    <div className={styles.dailySkeleton}>
      <div className={styles.dailySkeletonHeader}>
        <div className={styles.dailySkeletonTitle} />
        <div className={styles.dailySkeletonBtn} />
      </div>
      <div className={styles.dailySkeletonGrid}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={styles.dailySkeletonCard}>
            <div className={styles.dailySkeletonWord} />
            <div className={styles.dailySkeletonLine} />
            <div className={`${styles.dailySkeletonLine} ${styles.dailySkeletonMeaning}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <AppLayout title="Tra cứu">
      <main className={styles.homePage}>
        <div className={styles.homeGrid}>
          <div className={styles.mainColumn}>
            <Suspense fallback={<DailyVocabularySkeleton />}>
              <DailyVocabularySectionAsync />
            </Suspense>

            <section className={styles.cardSection}>
              <div className={styles.sectionHeader}>
                <h2>Học theo cấp độ</h2>
                <Link href="/kanji" className={styles.sectionLink}>
                  Xem Hán tự →
                </Link>
              </div>

              <div className={styles.jlptGrid}>
                {JLPT_QUICK_LINKS.map(({ level, href, color, desc }) => (
                  <Link
                    key={level}
                    href={href}
                    className={styles.jlptCard}
                    style={{ "--accent": color } as React.CSSProperties}
                  >
                    <span className={styles.jlptBadge}>{level}</span>
                    <span className={styles.jlptDesc}>{desc}</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className={styles.rightColumn}>
            <SearchHistorySection />
          </aside>
        </div>
      </main>
    </AppLayout>
  )
}
