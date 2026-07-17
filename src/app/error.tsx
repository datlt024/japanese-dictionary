"use client"

import Link from "next/link"

import styles from "./error.module.css"

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                <div className={styles.icon}>⚠️</div>
                <h2 className={styles.title}>Đã xảy ra lỗi</h2>
                <p className={styles.desc}>
                    Có lỗi không mong muốn xảy ra. Vui lòng thử lại hoặc quay về trang chủ.
                </p>
                <div className={styles.actions}>
                    <button type="button" className={styles.retryBtn} onClick={() => reset()}>
                        Thử lại
                    </button>
                    <Link href="/" className={styles.homeBtn}>
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    )
}
