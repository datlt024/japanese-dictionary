import type { Metadata } from "next"
import Link from "next/link"

import AppLayout from "@/shared/components/layout/AppLayout"

import styles from "./not-found.module.css"

export const metadata: Metadata = {
    title: "Không tìm thấy trang | Mazii",
}

export default function NotFound() {
    return (
        <AppLayout title="Mazii" hideSearchTabs>
            <main className={styles.page}>
                <div className={styles.inner}>
                    <div className={styles.code}>404</div>
                    <h1 className={styles.title}>Không tìm thấy trang</h1>
                    <p className={styles.desc}>
                        Trang bạn đang tìm không tồn tại hoặc đã bị di chuyển.
                    </p>
                    <Link href="/" className={styles.homeBtn}>
                        Về trang chủ
                    </Link>
                </div>
            </main>
        </AppLayout>
    )
}
