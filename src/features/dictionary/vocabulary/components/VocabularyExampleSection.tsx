import styles from "./VocabularyExampleSection.module.css"

const EXAMPLES = [
    {
        jp: "日本語を勉強し始めて、もう半年になります。",
        vi: "Tôi đã bắt đầu học tiếng Nhật và đã được nửa năm rồi.",
    },
    {
        jp: "もっと勉強して、試験に合格したいです。",
        vi: "Tôi muốn học nhiều hơn để vượt qua kỳ thi.",
    },
    {
        jp: "彼は図書館で一生懸命勉強しています。",
        vi: "Anh ấy đang học rất chăm chỉ ở thư viện.",
    },
]

export default function VocabularyExampleSection() {
    return (
        <div className={styles.detailSection}>
            <div className={styles.sectionHeaderRow}>
                <h2>Ví dụ</h2>

                <label className={styles.translationToggle}>
                    <span>Hiện dịch nghĩa</span>
                    <input type="checkbox" defaultChecked />
                    <i />
                </label>
            </div>

            <div className={styles.exampleList}>
                {EXAMPLES.map((example, index) => (
                    <div
                        key={example.jp}
                        className={styles.exampleRow}
                    >
                        <span className={styles.exampleIndex}>
                            {String(index + 1).padStart(2, "0")}
                        </span>

                        <div className={styles.exampleContent}>
                            <p className={styles.exampleJp}>
                                {example.jp}
                            </p>
                            <p className={styles.exampleVi}>
                                {example.vi}
                            </p>
                        </div>

                        <div className={styles.exampleActions}>
                            <button type="button">🔊</button>
                            <button type="button">☆</button>
                            <button type="button">⋯</button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                className={styles.moreExampleButton}
            >
                Xem thêm 12 ví dụ⌄
            </button>
        </div>
    )
}
