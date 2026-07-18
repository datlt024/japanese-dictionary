import type { Metadata } from "next"

import AppLayout from "@/shared/components/layout/AppLayout"

import styles from "./page.module.css"

export const metadata: Metadata = {
    title: "Cài đặt | Yomi",
    description: "Tùy chỉnh cài đặt ứng dụng Yomi.",
}

export default function SettingsPage() {
    return (
        <AppLayout title="Cài đặt" hideSearchTabs>
            <main className={styles.page}>
                <div className={styles.inner}>
                    <div className={styles.icon}>⚙️</div>
                    <h1 className={styles.title}>Tính năng đang phát triển</h1>
                    <p className={styles.desc}>
                        Trang cài đặt sẽ cho phép bạn tùy chỉnh giao diện, ngôn ngữ và thông báo.
                        Hãy quay lại sớm nhé!
                    </p>
                </div>
            </main>
        </AppLayout>
    )
}
