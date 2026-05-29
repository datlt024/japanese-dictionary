import "./Header.css"

type HeaderProps = {
    title?: string
}

export default function Header({
    title = "Tra cứu",
}: HeaderProps) {
    return (
        <header className="app-header">
            <div className="app-header-left">
                <span className="header-logo">
                    m<span>あ</span>zii
                </span>

                <h1>{title}</h1>
            </div>

            <div className="app-header-actions">
                <button className="login-button">
                    Đăng nhập
                </button>

                <button className="register-button">
                    Đăng ký
                </button>

                <button className="icon-button">
                    🔔
                </button>

                <button className="icon-button">
                    🔥
                </button>
            </div>
        </header>
    )
}