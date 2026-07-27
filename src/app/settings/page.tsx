import type { Metadata } from "next"

import AppLayout from "@/shared/components/layout/AppLayout"
import SettingsClient from "@/features/settings/components/SettingsClient/SettingsClient"

import styles from "./page.module.css"

export const metadata: Metadata = {
    title: "Cài đặt | Yomi",
    description: "Tùy chỉnh cài đặt ứng dụng Yomi.",
}

export default function SettingsPage() {
    return (
        <AppLayout title="Cài đặt" hideSearch>
            <main className={styles.page}>
                <SettingsClient />
            </main>
        </AppLayout>
    )
}
