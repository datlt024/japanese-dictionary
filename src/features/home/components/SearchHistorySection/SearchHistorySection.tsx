"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import useSearchHistory from "@/features/user/search-history/hooks/useSearchHistory"
import { getSearchTargetUrl } from "@/features/dictionary/search/utils/getSearchTargetUrl"
import { Button } from "antd"

import styles from "./SearchHistorySection.module.css"

const MAX_VISIBLE = 5

function getHistoryLabel(text: string) {
    return text.length > 18 ? `${text.slice(0, 18)}…` : text
}

export default function SearchHistorySection() {
    const router = useRouter()
    const { histories } = useSearchHistory()
    const [expanded, setExpanded] = useState(false)

    async function handleHistoryClick(keyword: string) {
        const url = await getSearchTargetUrl("vocabulary", keyword, "vi")
        if (url) router.push(url)
    }

    const visible = expanded ? histories : histories.slice(0, MAX_VISIBLE)

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2>Lịch sử</h2>
                {histories.length > MAX_VISIBLE && (
                    <Button
                        type="link"
                        className={styles.viewMore}
                        onClick={() => setExpanded((v) => !v)}
                    >
                        {expanded ? "Thu gọn" : "Xem thêm"}
                    </Button>
                )}
            </div>

            <div className={styles.historyTags}>
                {histories.length > 0 ? (
                    visible.map((item) => (
                        <Button
                            key={item}
                            type="default"
                            title={item}
                            className={styles.historyTag}
                            onClick={() => handleHistoryClick(item)}
                        >
                            {getHistoryLabel(item)}
                        </Button>
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
