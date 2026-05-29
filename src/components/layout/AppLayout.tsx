import "./AppLayout.css"

import Sidebar from "./Sidebar"
import Footer from "./Footer"

type AppLayoutProps = {
    children: React.ReactNode
}

export default function AppLayout({
    children,
}: AppLayoutProps) {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="app-main">
                {children}
                <Footer />
            </div>
        </div>
    )
}