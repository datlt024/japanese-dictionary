import Header from "@/shared/components/layout/Header"
import layoutStyles from "@/shared/components/layout/AppLayout.module.css"

const pulse: React.CSSProperties = {
    background: "var(--color-border)",
    borderRadius: 8,
    animation: "pulse 1.4s ease-in-out infinite",
}

const card: React.CSSProperties = {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: 14,
    padding: "28px 32px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
}

export default function AccountLoading() {
    return (
        <>
            <Header title="Tài khoản" />
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
            <div className={layoutStyles.appShell}>
                <div style={{ padding: "32px 0 64px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 760 }}>
                    <div style={{ ...pulse, width: 260, height: 32 }} />
                    <div style={{ ...pulse, width: 340, height: 18 }} />
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={card}>
                            <div style={{ ...pulse, width: 180, height: 20 }} />
                            <div style={{ ...pulse, width: "100%", height: 52, borderRadius: 10 }} />
                            <div style={{ ...pulse, width: "100%", height: 52, borderRadius: 10 }} />
                            <div style={{ ...pulse, width: 120, height: 40, borderRadius: 10, alignSelf: "flex-end" }} />
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
