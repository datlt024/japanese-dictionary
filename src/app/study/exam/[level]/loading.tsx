const pulse: React.CSSProperties = {
    background: "var(--color-border)",
    borderRadius: 8,
    animation: "pulse 1.4s ease-in-out infinite",
}

export default function ExamLoading() {
    return (
        <div style={{
            minHeight: "100vh",
            background: "var(--color-bg)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            padding: 24,
        }}>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
            {/* Exam info card */}
            <div style={{
                background: "var(--color-surface)",
                border: "1.5px solid var(--color-border)",
                borderRadius: 20,
                padding: 32,
                width: "100%",
                maxWidth: 480,
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}>
                <div style={{ ...pulse, width: 160, height: 28 }} />
                <div style={{ ...pulse, width: 220, height: 18 }} />
                <div style={{ ...pulse, width: "100%", height: 60, borderRadius: 12 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{ ...pulse, height: 52, borderRadius: 10 }} />
                    ))}
                </div>
                <div style={{ ...pulse, width: "100%", height: 44, borderRadius: 12 }} />
            </div>
        </div>
    )
}
