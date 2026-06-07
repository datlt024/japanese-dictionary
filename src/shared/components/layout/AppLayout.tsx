import { Suspense } from "react"

import styles from "./AppLayout.module.css"

import Sidebar from "./Sidebar"
import Header from "./Header"
import Footer from "./Footer"
import TopSearchBar from "./TopSearchBar"

import QuickLookupLayer from "@/features/dictionary/quick-lookup/components/QuickLookupLayer"

import type { ReactNode } from "react"

type ActiveSearchTab =
    | "vocabulary"
    | "kanji"
    | "grammar"
    | "example"
    | "jpjp"

type AppLayoutProps = {
    children: ReactNode
    title?: string
    searchKeyword?: string
    activeSearchTab?: ActiveSearchTab
}

export default function AppLayout({
    children,
    title,
    searchKeyword,
    activeSearchTab,
}: AppLayoutProps) {
    return (
        <div className={styles.appLayout}>
            <Sidebar />

            <div className={styles.appMain}>
                <Suspense fallback={null}>
                    <Header title={title} />
                </Suspense>

                <div className={styles.appContent}>
                    <section className={styles.appSearchArea}>
                        <Suspense fallback={null}>
                            <TopSearchBar
                                searchKeyword={searchKeyword}
                                activeSearchTab={activeSearchTab}
                            />
                        </Suspense>
                    </section>

                    <main className={styles.appPageContent}>
                        {children}
                    </main>
                </div>

                <Footer />
            </div>

            <QuickLookupLayer />
        </div>
    )
}