"use client"

import { useState } from "react"
import { Check, ChevronRight, Zap } from "lucide-react"
import styles from "./ExploreTab.module.css"

const EXAM_TIPS = [
    {
        title: "Chiến lược làm bài Văn pháp (文法)",
        tips: [
            "Đọc toàn bộ câu trước khi chọn đáp án — ngữ pháp phụ thuộc vào ngữ cảnh.",
            "Chú ý từ nối trước và sau chỗ trống: て-form thường nối với động từ tiếp theo.",
            "Loại trừ các đáp án sai trước: tìm những lựa chọn không phù hợp về mặt ngữ pháp.",
            "Phân biệt các cặp dễ nhầm: ように vs ために, によって vs に対して.",
        ],
    },
    {
        title: "Chiến lược làm bài Từ vựng (語彙)",
        tips: [
            "Học từ theo nhóm nghĩa và đồng nghĩa/trái nghĩa để nhớ lâu hơn.",
            "Chú ý cách dùng của từ trong câu — nghĩa từ điển không đủ để làm bài.",
            "Từ Hán (漢語) thường xuất hiện trong văn viết; từ Yamato (和語) hay gặp trong hội thoại.",
            "Phân biệt 〜的 (tính chất) và 〜性 (khả năng/bản chất) trong từ ghép.",
        ],
    },
    {
        title: "Chiến lược làm bài Đọc hiểu (読解)",
        tips: [
            "Đọc câu hỏi TRƯỚC khi đọc bài — biết mình tìm gì giúp đọc có mục tiêu.",
            "Văn bản JLPT thường có cấu trúc: mở đề → phát triển → kết luận/quan điểm.",
            "Chú ý các từ đảo ngữ: しかし、ところが、それでも thường đánh dấu điểm quan trọng.",
            "Đáp án sai thường chứa thông tin đúng nhưng bị biến tấu — đối chiếu kỹ với bài gốc.",
        ],
    },
    {
        title: "Chiến lược làm bài Nghe (聴解)",
        tips: [
            "Trong lúc chờ bài nghe, đọc nhanh câu hỏi và các đáp án để chuẩn bị.",
            "Tập trung vào phần cuối hội thoại — câu trả lời thường nằm ở đây.",
            "Chú ý các cụm: じゃあ、それじゃ、では thường dẫn vào quyết định/kết luận.",
            "Luyện nghe phân biệt số, ngày tháng, địa điểm — loại thông tin phổ biến nhất.",
        ],
    },
]

export default function ExamTipsSection() {
    const [open, setOpen] = useState<number | null>(null)
    return (
        <section className={styles.tipsSection}>
            <h2 className={styles.sectionTitle}>
                <Zap size={16} />
                Mẹo làm bài thi JLPT
            </h2>
            <p className={styles.sectionDesc}>
                Chiến lược làm bài hiệu quả cho từng phần thi — được tổng hợp cho người học tiếng Nhật.
            </p>
            <div className={styles.accordionList}>
                {EXAM_TIPS.map((tip, i) => (
                    <div key={i} className={styles.accordionItem} data-open={open === i || undefined}>
                        <button
                            type="button"
                            className={styles.accordionHeader}
                            onClick={() => setOpen(open === i ? null : i)}
                        >
                            <span>{tip.title}</span>
                            <ChevronRight size={15} className={styles.accordionChevron} />
                        </button>
                        {open === i && (
                            <ul className={styles.accordionBody}>
                                {tip.tips.map((t, j) => (
                                    <li key={j} className={styles.tipItem}>
                                        <Check size={13} className={styles.tipCheck} />
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}
