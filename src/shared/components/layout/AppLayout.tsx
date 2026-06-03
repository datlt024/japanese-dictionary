import styles from "./AppLayout.module.css"

import Sidebar from "./Sidebar"
import Header from "./Header"
import Footer from "./Footer"
import TopSearchBar from "./TopSearchBar"

type AppLayoutProps = {
    children: React.ReactNode
    title?: string
    searchKeyword?: string
    activeSearchTab?:
    | "vocabulary"
    | "kanji"
    | "grammar"
    | "example"
    | "jpjp"
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
                <Header title={title} />

                <div className={styles.appContent}>
                    <section className={styles.appSearchArea}>
                        <TopSearchBar
                            searchKeyword={searchKeyword}
                            activeSearchTab={activeSearchTab}
                        />
                    </section>

                    <main className={styles.appPageContent}>
                        {children}
                    </main>
                </div>

                <Footer />
            </div>
        </div>
    )
}