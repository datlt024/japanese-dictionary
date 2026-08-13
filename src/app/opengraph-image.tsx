import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Yomi — Từ điển Nhật Việt"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#F7F8FA",
                    fontFamily: "sans-serif",
                }}
            >
                {/* Logo box */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 96,
                        height: 96,
                        borderRadius: 24,
                        background: "#2563EB",
                        marginBottom: 32,
                    }}
                >
                    <span style={{ fontSize: 52, fontWeight: 900, color: "#ffffff" }}>M</span>
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: 56,
                        fontWeight: 800,
                        color: "#1F2937",
                        letterSpacing: "-1px",
                        marginBottom: 16,
                    }}
                >
                    Yomi
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: 28,
                        fontWeight: 400,
                        color: "#6B7280",
                    }}
                >
                    Từ điển Nhật — Việt dành cho người học
                </div>

                {/* Tags */}
                <div
                    style={{
                        display: "flex",
                        gap: 12,
                        marginTop: 40,
                    }}
                >
                    {["Từ vựng", "Hán tự", "Ngữ pháp"].map((tag) => (
                        <div
                            key={tag}
                            style={{
                                padding: "8px 20px",
                                borderRadius: 999,
                                background: "#EFF6FF",
                                color: "#2563EB",
                                fontSize: 20,
                                fontWeight: 600,
                            }}
                        >
                            {tag}
                        </div>
                    ))}
                </div>
            </div>
        ),
        { ...size }
    )
}
