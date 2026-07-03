"use client"

import { useRouter } from "next/navigation"

import useSearchHistory from "@/features/user/search-history/hooks/useSearchHistory"
import { getSearchTargetUrl } from "@/features/dictionary/search/utils/getSearchTargetUrl"

import styles from "./SearchHistorySection.module.css"

function getHistoryLabel(text: string) {
    return text.length > 18 ? `${text.slice(0, 18)}…` : text
}

export default function SearchHistorySection() {
    const router = useRouter()
    const { histories } = useSearchHistory()

    async function handleHistoryClick(keyword: string) {
        const url = await getSearchTargetUrl("vocabulary", keyword, "vi")
        if (url) router.push(url)
    }

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2>Lịch sử</h2>
                <button type="button" className={styles.viewMore}>
                    Xem thêm
                </button>
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
    )
}
