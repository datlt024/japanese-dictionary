import AppLayout from "@/shared/components/layout/AppLayout"

const pulse: React.CSSProperties = {
    background: "var(--color-border)",
    borderRadius: 8,
    animation: "pulse 1.4s ease-in-out infinite",
}

export default function VocabularyDetailLoading() {
    return (
        <AppLayout title="Từ vựng">
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
            <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ ...pulse, width: 180, height: 40 }} />
                <div style={{ ...pulse, width: 120, height: 22 }} />
                <div style={{ ...pulse, width: "100%", height: 130, marginTop: 8 }} />
                <div style={{ ...pulse, width: "100%", height: 90 }} />
                <div style={{ ...pulse, width: "100%", height: 90 }} />
                <div style={{ ...pulse, width: "100%", height: 160, marginTop: 4 }} />
            </div>
        </AppLayout>
    )
}
