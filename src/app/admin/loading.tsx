import AppLayout from "@/shared/components/layout/AppLayout"

const pulse: React.CSSProperties = {
    background: "var(--color-border)",
    borderRadius: 8,
    animation: "pulse 1.4s ease-in-out infinite",
}

export default function AdminLoading() {
    return (
        <AppLayout title="Quản trị" hideSearch>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
            <div style={{ padding: "24px 0 64px", display: "flex", flexDirection: "column", gap: 20 }}>
                {/* KPI grid skeleton */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} style={{
                            background: "var(--color-surface)",
                            border: "1px solid var(--color-border)",
                            borderRadius: 14,
                            padding: "20px 24px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                        }}>
                            <div style={{ ...pulse, width: 36, height: 36, borderRadius: 10 }} />
                            <div style={{ ...pulse, width: 80, height: 28 }} />
                            <div style={{ ...pulse, width: 60, height: 16 }} />
                        </div>
                    ))}
                </div>
                {/* Chart skeleton */}
                <div style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 14,
                    padding: "20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}>
                    <div style={{ ...pulse, width: 180, height: 20 }} />
                    <div style={{ ...pulse, width: "100%", height: 120, borderRadius: 10 }} />
                </div>
            </div>
        </AppLayout>
    )
}
