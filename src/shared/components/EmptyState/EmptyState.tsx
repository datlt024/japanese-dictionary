import Link from "next/link"

import styles from "./EmptyState.module.css"

type EmptyStateProps = {
    title: string
    description?: string
    keyword?: string
    backHref?: string
    backLabel?: string
    googleTranslateKeyword?: string
}

export default function EmptyState({
    title,
    description,
    keyword,
    backHref = "/",
    backLabel = "Quay lại trang chủ",
    googleTranslateKeyword,
}: EmptyStateProps) {
    const googleTranslateUrl = googleTranslateKeyword
        ? `https://translate.google.com/?sl=ja&tl=vi&text=${encodeURIComponent(googleTranslateKeyword)}&op=translate`
        : null

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

            <div className={styles.emptyStateActions}>
                <Link
                    href={backHref}
                    className={styles.emptyStateButton}
                >
                    {backLabel}
                </Link>

                {googleTranslateUrl && (
                    <a
                        href={googleTranslateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.googleTranslateButton}
                    >
                        Tra trên Google Dịch
                    </a>
                )}
            </div>
        </div>
    )
}