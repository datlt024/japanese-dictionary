import styles from "./KanjiCommunitySection.module.css"

export default function KanjiCommunitySection() {
    return (
        <section className={styles.card}>
            <p className={styles.label}>
                Ý KIẾN CỘNG ĐỒNG
            </p>

            <div className={styles.empty}>
                <p>Chưa có ý kiến nào.</p>

                <button type="button">
                    Viết ý kiến đầu tiên
                </button>
            </div>
        </section>
    )
}