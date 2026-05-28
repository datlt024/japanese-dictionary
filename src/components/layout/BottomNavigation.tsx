import "./BottomNavigation.css"

export default function BottomNavigation() {
    return (
        <nav className="bottom-nav">
            <button className="bottom-item active">
                🏠
                <span>Home</span>
            </button>

            <button className="bottom-item">
                📖
                <span>Từ vựng</span>
            </button>

            <button className="bottom-item">
                🈶
                <span>Kanji</span>
            </button>

            <button className="bottom-item">
                ⭐
                <span>Sổ tay</span>
            </button>
        </nav>
    )
}