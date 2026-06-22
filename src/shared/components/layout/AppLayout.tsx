import { Suspense } from "react"

import styles from "./AppLayout.module.css"

import Header from "./Header"
import Footer from "./Footer"
import TopSearchBar from "./TopSearchBar"

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
        <>
            <div className={styles.appShell}>
                <Suspense fallback={null}>
                    <Header title={title} />
                </Suspense>

                <section className={styles.appSearchArea}>
                    <Suspense fallback={null}>
                        <TopSearchBar
                            searchKeyword={searchKeyword}
                            activeSearchTab={activeSearchTab}
                        />
                    </Suspense>
                </section>

                <main
                    className={styles.appPageContent}
                    data-quick-lookup-root="true"
                >
                    {children}
                </main>
            </div>

            <Footer />
        </>
    )
}