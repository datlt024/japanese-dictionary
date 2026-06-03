import Link from "next/link"

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
        <div className="empty-state">
            <div className="empty-state-illustration">
                <div className="empty-state-cat">🐱</div>
                <div className="empty-state-box">📦</div>
            </div>

            <h2>{title}</h2>

            <p>
                {description ||
                    `Không có dữ liệu${keyword ? ` cho "${keyword}"` : ""}.`}
            </p>

            <Link href={backHref} className="empty-state-button">
                {backLabel}
            </Link>
        </div>
    )
}