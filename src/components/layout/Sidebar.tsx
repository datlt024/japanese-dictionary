import "./Sidebar.css"

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <h2 className="sidebar-logo">
                日本語
            </h2>

            <nav className="sidebar-menu">
                <button className="sidebar-item active">
                    🏠 Home
                </button>

                <button className="sidebar-item">
                    📖 Từ vựng
                </button>

                <button className="sidebar-item">
                    🈶 Kanji
                </button>

                <button className="sidebar-item">
                    📚 Ngữ pháp
                </button>

                <button className="sidebar-item">
                    ⭐ Sổ tay
                </button>
            </nav>
        </aside>
    )
}