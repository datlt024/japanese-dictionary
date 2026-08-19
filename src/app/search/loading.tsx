import AppLayout from "@/shared/components/layout/AppLayout"

const pulse: React.CSSProperties = {
    background: "var(--color-border)",
    borderRadius: 8,
    animation: "pulse 1.4s ease-in-out infinite",
}

const row: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12 }

export default function SearchLoading() {
    return (
        <AppLayout title="Tìm kiếm">
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
            <div style={{ padding: "24px 0 48px", display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ ...pulse, width: 200, height: 20 }} />
                {/* Section 1 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ ...pulse, width: 100, height: 16, borderRadius: 6 }} />
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{ ...row }}>
                            <div style={{ ...pulse, width: 52, height: 52, borderRadius: 12, flexShrink: 0 }} />
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                                <div style={{ ...pulse, width: "55%", height: 18 }} />
                                <div style={{ ...pulse, width: "80%", height: 14 }} />
                            </div>
                        </div>
                    ))}
                </div>
                {/* Section 2 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ ...pulse, width: 80, height: 16, borderRadius: 6 }} />
                    {[1, 2].map((i) => (
                        <div key={i} style={{ ...row }}>
                            <div style={{ ...pulse, width: 52, height: 52, borderRadius: 12, flexShrink: 0 }} />
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                                <div style={{ ...pulse, width: "40%", height: 18 }} />
                                <div style={{ ...pulse, width: "65%", height: 14 }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    )
}
