import AppLayout from "@/shared/components/layout/AppLayout"

const pulse: React.CSSProperties = {
    background: "var(--color-border)",
    borderRadius: 8,
    animation: "pulse 1.4s ease-in-out infinite",
}

export default function PracticeLoading() {
    return (
        <AppLayout title="Luyện tập" hideSearchTabs>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
            <div style={{ padding: "32px 0 64px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                {/* Mode selector */}
                <div style={{ display: "flex", gap: 8 }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{ ...pulse, width: 100, height: 40, borderRadius: 10 }} />
                    ))}
                </div>
                {/* Flashcard */}
                <div style={{ ...pulse, width: "100%", maxWidth: 480, height: 260, borderRadius: 20, marginTop: 12 }} />
                {/* Buttons */}
                <div style={{ display: "flex", gap: 12 }}>
                    {[1, 2].map((i) => (
                        <div key={i} style={{ ...pulse, width: 120, height: 44, borderRadius: 12 }} />
                    ))}
                </div>
                {/* Progress bar */}
                <div style={{ ...pulse, width: "100%", maxWidth: 480, height: 6, borderRadius: 999 }} />
            </div>
        </AppLayout>
    )
}
