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
    hideSearchTabs?: boolean
    hideSearch?: boolean
    disableQuickLookup?: boolean
}

export default function AppLayout({
    children,
    title,
    searchKeyword,
    activeSearchTab,
    hideSearchTabs = false,
    hideSearch = false,
    disableQuickLookup = false,
}: AppLayoutProps) {
    return (
        <>
            <div className={styles.appShell}>
                <Suspense fallback={null}>
                    <Header title={title} />
                </Suspense>

                {!hideSearch && (
                    <section className={styles.appSearchArea}>
                        <Suspense fallback={null}>
                            <TopSearchBar
                                searchKeyword={searchKeyword}
                                activeSearchTab={activeSearchTab}
                                hideTabs={hideSearchTabs}
                            />
                        </Suspense>
                    </section>
                )}

                <main
                    className={styles.appPageContent}
                    {...(!disableQuickLookup && { "data-quick-lookup-root": "true" })}
                >
                    {children}
                </main>
            </div>

            <Footer />
        </>
    )
}