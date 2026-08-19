import AppLayout from "@/shared/components/layout/AppLayout"

const pulse: React.CSSProperties = {
    background: "var(--color-border)",
    borderRadius: 8,
    animation: "pulse 1.4s ease-in-out infinite",
}

export default function KanjiLoading() {
    return (
        <AppLayout title="Hán tự" activeSearchTab="kanji">
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
            <div style={{ padding: "32px 0 64px", display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ ...pulse, width: 220, height: 36 }} />
                <div style={{ ...pulse, width: "70%", height: 18 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                    <div style={{ ...pulse, width: 160, height: 20 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} style={{ ...pulse, width: "100%", height: 68, borderRadius: 14 }} />
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
