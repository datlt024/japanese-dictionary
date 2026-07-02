"use client"

import { useRouter } from "next/navigation"

import styles from "./page.module.css"

import useSearchHistory
  from "@/features/user/search-history/hooks/useSearchHistory"

import { getSearchTargetUrl } from "@/features/dictionary/search/utils/getSearchTargetUrl"

import AppLayout from "@/shared/components/layout/AppLayout"

function getHistoryLabel(text: string) {
  return text.length > 18 ? `${text.slice(0, 18)}…` : text
}

export default function HomePage() {
  const router = useRouter()
  const { histories } = useSearchHistory()

  async function handleHistoryClick(keyword: string) {
    const url = await getSearchTargetUrl("vocabulary", keyword, "vi")
    if (url) router.push(url)
  }

  return (
    <AppLayout title="Tra cứu">
      <main className={styles.homePage}>
        <div className={styles.homeGrid}>
          <div className={styles.mainColumn}>
            <section className={styles.cardSection}>
              <div className={styles.sectionHeader}>
                <h2>Từ vựng trong ngày</h2>
                <button type="button">Xem thêm</button>
              </div>

              <div className={styles.dailyWords}>
                <div>
                  情報
                  <br />
                  <span>じょうほう - thông tin</span>
                </div>

                <div>
                  経験
                  <br />
                  <span>けいけん - kinh nghiệm</span>
                </div>

                <div>
                  母
                  <br />
                  <span>はは - mẹ</span>
                </div>

                <div>
                  父
                  <br />
                  <span>ちち - bố</span>
                </div>
              </div>
            </section>

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
            <section className={styles.cardSection}>
              <div className={styles.sectionHeader}>
                <h2>Lịch sử</h2>
                <button type="button">Xem thêm</button>
              </div>

              <div className={styles.historyTags}>
                {histories.length > 0 ? (
                  histories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      title={item}
                      className={styles.historyTag}
                      onClick={() => handleHistoryClick(item)}
                    >
                      {getHistoryLabel(item)}
                    </button>
                  ))
                ) : (
                  <span className={styles.historyEmpty}>
                    Chưa có lịch sử tìm kiếm
                  </span>
                )}
              </div>
            </section>

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