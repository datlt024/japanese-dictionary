import "./AppLayout.css"

import Sidebar from "./Sidebar"
import Header from "./Header"
import Footer from "./Footer"
import TopSearchBar from "./TopSearchBar"

type AppLayoutProps = {
    children: React.ReactNode
    title?: string
    searchKeyword?: string
    activeSearchTab?: "vocabulary" | "kanji" | "grammar" | "example" | "jpjp"
}

export default function AppLayout({
    children,
    title,
    searchKeyword,
    activeSearchTab,
}: AppLayoutProps) {
    return (
        <div className="app-layout">
            <Sidebar />

            <div className="app-main">
                <Header title={title} />

                <div className="app-content">
                    <section className="app-search-area">
                        <TopSearchBar
                            searchKeyword={searchKeyword}
                            activeSearchTab={activeSearchTab}
                        />
                    </section>

                    <main className="app-page-content">
                        {children}
                    </main>
                </div>

                <Footer />
            </div>
        </div>
    )
}