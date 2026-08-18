import AppLayout from "@/shared/components/layout/AppLayout"

const pulse: React.CSSProperties = {
    background: "var(--color-border)",
    borderRadius: 8,
    animation: "pulse 1.4s ease-in-out infinite",
}

export default function GrammarDetailLoading() {
    return (
        <AppLayout title="Ngữ pháp">
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
            <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ ...pulse, width: 220, height: 36 }} />
                <div style={{ ...pulse, width: 80, height: 22, borderRadius: 999 }} />
                <div style={{ ...pulse, width: "100%", height: 100, marginTop: 8 }} />
                <div style={{ ...pulse, width: "100%", height: 80 }} />
                <div style={{ ...pulse, width: "100%", height: 160 }} />
                <div style={{ ...pulse, width: "100%", height: 120 }} />
            </div>
        </AppLayout>
    )
}
