import AppLayout from "@/shared/components/layout/AppLayout"

const pulse: React.CSSProperties = {
    background: "var(--color-border)",
    borderRadius: 8,
    animation: "pulse 1.4s ease-in-out infinite",
}

export default function KanjiDetailLoading() {
    return (
        <AppLayout title="Hán tự">
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
            <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ ...pulse, width: 100, height: 100, borderRadius: 16 }} />
                <div style={{ ...pulse, width: 200, height: 28, marginTop: 4 }} />
                <div style={{ ...pulse, width: 140, height: 20 }} />
                <div style={{ ...pulse, width: "100%", height: 120, marginTop: 8 }} />
                <div style={{ ...pulse, width: "100%", height: 90 }} />
                <div style={{ ...pulse, width: "100%", height: 90 }} />
            </div>
        </AppLayout>
    )
}
