import Link from "next/link"

import styles from "./EmptyState.module.css"

type EmptyStateProps = {
    title: string
    description?: string
    keyword?: string
    backHref?: string
    backLabel?: string
}

export default function EmptyState({
    title,
    description,
    keyword,
    backHref = "/",
    backLabel = "Quay lại trang chủ",
}: EmptyStateProps) {
    return (
        <div className={styles.emptyState}>
            <div className={styles.emptyStateIllustration}>
                <div className={styles.emptyStateCat}>
                    🐱
                </div>

                <div className={styles.emptyStateBox}>
                    📦
                </div>
            </div>

            <h2>{title}</h2>

            <p>
                {description ||
                    `Không có dữ liệu${keyword
                        ? ` cho "${keyword}"`
                        : ""
                    }.`}
            </p>

            <Link
                href={backHref}
                className={styles.emptyStateButton}
            >
                {backLabel}
            </Link>
        </div>
    )
}