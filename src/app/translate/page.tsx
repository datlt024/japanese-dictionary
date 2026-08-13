import type { Metadata } from "next"

import AppLayout from "@/shared/components/layout/AppLayout"
import TranslatorClient from "@/features/dictionary/translator/components/TranslatorClient/TranslatorClient"

import styles from "./page.module.css"

type Props = {
    searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const { q } = await searchParams
    return {
        title: q ? `Dịch "${q}" | Yomi` : "Dịch Nhật – Việt | Yomi",
        description: "Công cụ dịch tiếng Nhật sang tiếng Việt với AI, hỗ trợ từ đơn, cụm từ và câu hoàn chỉnh.",
    }
}

export default async function TranslatePage({ searchParams }: Props) {
    const { q } = await searchParams
    const initialText = q?.trim() ?? ""

    return (
        <AppLayout title="Dịch" hideSearchTabs>
            <main className={styles.page}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Dịch Nhật – Việt</h1>
                    <p className={styles.subtitle}>Dịch từ đơn, cụm từ hoặc câu hoàn chỉnh</p>
                </header>

                <TranslatorClient initialText={initialText} />
            </main>
        </AppLayout>
    )
}
