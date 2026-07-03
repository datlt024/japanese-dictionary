import { Suspense } from "react"

import styles from "./page.module.css"

import AppLayout from "@/shared/components/layout/AppLayout"
import DailyVocabularySection from "@/features/home/components/DailyVocabularySection/DailyVocabularySection"
import SearchHistorySection from "@/features/home/components/SearchHistorySection/SearchHistorySection"

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
              <DailyVocabularySection />
            </Suspense>

            <section className={`${styles.cardSection} ${styles.banner}`}>
              Mazii AI+ — Học tiếng Nhật thông minh hơn
            </section>

            <section className={styles.cardSection}>
              <div className={styles.sectionHeader}>
                <h2>Bài học đề xuất</h2>
                <button type="button">Xem thêm</button>
              </div>

              <div className={styles.communityGrid}>
                <div className={styles.communityCard}>
                  <h3>JLPT N5</h3>
                  <p>Từ vựng cơ bản cho người mới bắt đầu.</p>
                </div>

                <div className={styles.communityCard}>
                  <h3>Kanji cơ bản</h3>
                  <p>Học các chữ Hán thường gặp nhất.</p>
                </div>
              </div>
            </section>
          </div>

          <aside className={styles.rightColumn}>
            <SearchHistorySection />

            <section className={styles.cardSection}>
              <h2>Góp ý</h2>
              <p>若しも：giả sử</p>
              <p>果たして：quả nhiên là</p>
              <p>ポケット：túi</p>
            </section>
          </aside>
        </div>
      </main>
    </AppLayout>
  )
}
