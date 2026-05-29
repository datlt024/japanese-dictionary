import "./AppLayout.css"

import Sidebar from "./Sidebar"
import Header from "./Header"
import Footer from "./Footer"

type AppLayoutProps = {
    children: React.ReactNode
    title?: string
}

export default function AppLayout({
    children,
    title,
}: AppLayoutProps) {
    return (
        <div className="app-layout">
            <Sidebar />

            <div className="app-main">
                <Header title={title} />

                <div className="app-content">
                    {children}
                </div>

                <Footer />
            </div>
        </div>
    )
}