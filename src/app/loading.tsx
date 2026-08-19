import AppLayout from "@/shared/components/layout/AppLayout"

const pulse: React.CSSProperties = {
    background: "var(--color-border)",
    borderRadius: 8,
    animation: "pulse 1.4s ease-in-out infinite",
}

export default function HomeLoading() {
    return (
        <AppLayout title="Tra cứu">
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
            <div style={{ padding: "24px 0 64px", display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Daily vocabulary skeleton */}
                <div style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 14,
                    padding: "20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ ...pulse, width: 180, height: 22 }} />
                        <div style={{ ...pulse, width: 80, height: 30, borderRadius: 10 }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} style={{
                                background: "var(--color-surface-muted)",
                                borderRadius: 10,
                                padding: "16px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                            }}>
                                <div style={{ ...pulse, width: 80, height: 28 }} />
                                <div style={{ ...pulse, width: "100%", height: 16 }} />
                                <div style={{ ...pulse, width: "70%", height: 16 }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* JLPT levels skeleton */}
                <div style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 14,
                    padding: "20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}>
                    <div style={{ ...pulse, width: 160, height: 22 }} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} style={{ ...pulse, height: 64, borderRadius: 10 }} />
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
