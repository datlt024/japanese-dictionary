import AppLayout from "@/shared/components/layout/AppLayout"

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

export default function SettingsLoading() {
    return (
        <AppLayout title="Cài đặt" hideSearch>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
            <div style={{ padding: "32px 0 64px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 760 }}>
                <div style={{ ...pulse, width: 200, height: 32 }} />
                <div style={{ ...pulse, width: 300, height: 18 }} />
                {[1, 2, 3].map((i) => (
                    <div key={i} style={card}>
                        <div style={{ ...pulse, width: 160, height: 20 }} />
                        <div style={{ ...pulse, width: "100%", height: 48, borderRadius: 10 }} />
                        <div style={{ ...pulse, width: "100%", height: 48, borderRadius: 10 }} />
                        <div style={{ ...pulse, width: 120, height: 38, borderRadius: 10, alignSelf: "flex-end" }} />
                    </div>
                ))}
            </div>
        </AppLayout>
    )
}
