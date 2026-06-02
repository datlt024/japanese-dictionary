"use client"

import "@/styles/home.css"

import AppLayout from "@/shared/components/layout/AppLayout"

import useSearchHistory from "@/features/history/hooks/useSearchHistory"

export default function HomePage() {
  const { histories } = useSearchHistory()

  return (
    <AppLayout title="Tra cứu">
      <main className="home-page">
        <div className="home-grid">
          <div className="main-column">
            <section className="card-section">
              <div className="section-header">
                <h2>Từ vựng trong ngày</h2>
                <button>Xem thêm</button>
              </div>

              <div className="daily-words">
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

            <section className="card-section banner">
              Mazii AI+ — Học tiếng Nhật thông minh hơn
            </section>

            <section className="card-section">
              <div className="section-header">
                <h2>Bài học đề xuất</h2>
                <button>Xem thêm</button>
              </div>

              <div className="community-grid">
                <div className="community-card">
                  <h3>JLPT N5</h3>
                  <p>Từ vựng cơ bản cho người mới bắt đầu.</p>
                </div>

                <div className="community-card">
                  <h3>Kanji cơ bản</h3>
                  <p>Học các chữ Hán thường gặp nhất.</p>
                </div>
              </div>
            </section>
          </div>

          <aside className="right-column">
            <section className="card-section">
              <div className="section-header">
                <h2>Lịch sử</h2>
                <button>Xem thêm</button>
              </div>

              <div className="history-tags">
                {histories.map((item) => (
                  <button key={item}>
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className="card-section">
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