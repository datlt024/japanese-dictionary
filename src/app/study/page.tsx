import type { Metadata } from "next"

import AppLayout from "@/shared/components/layout/AppLayout"

import styles from "./page.module.css"

export const metadata: Metadata = {
    title: "Học tập | Mazii",
    description: "Tính năng học tập tiếng Nhật đang được phát triển.",
}

export default function StudyPage() {
    return (
        <AppLayout title="Học tập" hideSearchTabs>
            <main className={styles.page}>
                <div className={styles.inner}>
                    <div className={styles.icon}>📘</div>
                    <h1 className={styles.title}>Tính năng đang phát triển</h1>
                    <p className={styles.desc}>
                        Chúng tôi đang xây dựng công cụ học tập toàn diện cho người học tiếng Nhật.
                        Hãy quay lại sớm nhé!
                    </p>
                </div>
            </main>
        </AppLayout>
    )
}
