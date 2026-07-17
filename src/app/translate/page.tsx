import type { Metadata } from "next"

import AppLayout from "@/shared/components/layout/AppLayout"

import styles from "./page.module.css"

export const metadata: Metadata = {
    title: "Dịch thuật | Mazii",
    description: "Tính năng dịch thuật tiếng Nhật đang được phát triển.",
}

export default function TranslatePage() {
    return (
        <AppLayout title="Dịch thuật" hideSearchTabs>
            <main className={styles.page}>
                <div className={styles.inner}>
                    <div className={styles.icon}>🌐</div>
                    <h1 className={styles.title}>Tính năng đang phát triển</h1>
                    <p className={styles.desc}>
                        Công cụ dịch thuật Nhật — Việt đang được xây dựng và sẽ sớm ra mắt.
                    </p>
                </div>
            </main>
        </AppLayout>
    )
}
