import AppLayout from "@/shared/components/layout/AppLayout"

const pulse: React.CSSProperties = {
    background: "var(--color-border)",
    borderRadius: 8,
    animation: "pulse 1.4s ease-in-out infinite",
}

export default function StudyLoading() {
    return (
        <AppLayout title="Học tập">
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
            <div style={{ padding: "32px 0 64px", display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Tab bar skeleton */}
                <div style={{ display: "flex", gap: 8, borderBottom: "1.5px solid var(--color-border)", paddingBottom: 0 }}>
                    {[120, 90, 100, 80].map((w, i) => (
                        <div key={i} style={{ ...pulse, width: w, height: 36, borderRadius: "8px 8px 0 0" }} />
                    ))}
                </div>
                {/* Level cards grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} style={{ ...pulse, height: 80, borderRadius: 14 }} />
                    ))}
                </div>
                {/* Category rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ ...pulse, width: 140, height: 18 }} />
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} style={{ ...pulse, width: "100%", height: 48, borderRadius: 10 }} />
                    ))}
                </div>
            </div>
        </AppLayout>
    )
}
