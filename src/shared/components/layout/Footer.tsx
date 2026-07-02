import styles from "./Footer.module.css"

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContainer}>

                <div className={styles.footerTop}>
                    <div>
                        <h2 className={styles.footerLogo}>
                            Japanese Dictionary
                        </h2>

                        <p className={styles.footerDescription}>
                            Từ điển tiếng Nhật đa nền tảng,
                            hỗ trợ tra cứu từ vựng, kanji,
                            ngữ pháp, mẫu câu và học tập.
                        </p>
                    </div>
                </div>

                <div className={styles.footerGrid}>

                    <div>
                        <h3>Giới thiệu</h3>

                        <ul>
                            <li>Về chúng tôi</li>
                            <li>Liên hệ</li>
                            <li>Điều khoản sử dụng</li>
                            <li>Chính sách bảo mật</li>
                        </ul>
                    </div>

                    <div>
                        <h3>Tính năng</h3>

                        <ul>
                            <li>Tra cứu từ vựng</li>
                            <li>Kanji</li>
                            <li>Ngữ pháp</li>
                            <li>Mẫu câu</li>
                        </ul>
                    </div>

                    <div>
                        <h3>Học tập</h3>

                        <ul>
                            <li>Flashcard</li>
                            <li>JLPT</li>
                            <li>Sổ tay</li>
                            <li>Luyện đọc</li>
                        </ul>
                    </div>

                    <div>
                        <h3>Kết nối</h3>

                        <ul>
                            <li>Facebook</li>
                            <li>Discord</li>
                            <li>Github</li>
                        </ul>
                    </div>

                </div>

                <div className={styles.footerBottom}>
                    © 2026 Japanese Dictionary
                </div>

            </div>
        </footer>
    )
}
