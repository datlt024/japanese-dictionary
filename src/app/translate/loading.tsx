import AppLayout from "@/shared/components/layout/AppLayout"

const pulse: React.CSSProperties = {
    background: "var(--color-border)",
    borderRadius: 8,
    animation: "pulse 1.4s ease-in-out infinite",
}

export default function TranslateLoading() {
    return (
        <AppLayout title="Dịch" hideSearchTabs>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
            <div style={{ padding: "32px 0 64px", display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ ...pulse, width: 220, height: 32 }} />
                <div style={{ ...pulse, width: 280, height: 18 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
                    <div style={{ ...pulse, height: 180, borderRadius: 14 }} />
                    <div style={{ ...pulse, height: 180, borderRadius: 14 }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{ ...pulse, width: 90, height: 36, borderRadius: 10 }} />
                    ))}
                </div>
            </div>
        </AppLayout>
    )
}
