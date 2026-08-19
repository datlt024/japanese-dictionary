"use client"

import { useEffect, useMemo, useState } from "react"
import { RotateCcw } from "lucide-react"

import styles from "./KanjiStrokeOrder.module.css"

import ActionButtons from "@/shared/components/ActionButtons/ActionButtons"

type Props = {
    kanji: string
    className?: string
}

type Point = {
    x: number
    y: number
}

type StrokePath = {
    id: string
    d: string
    numberX: string
    numberY: string
}

const STROKE_COLORS = [
    "#2563eb",
    "#ef4444",
    "#111827",
    "#22c55e",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#2563eb",
    "#ef4444",
    "#111827",
    "#22c55e",
    "#ef4444",
    "#8b5cf6",
    "#22c55e",
    "#f59e0b",
]

const CENTER = {
    x: 54.5,
    y: 54.5,
}

function getKanjiSvgFileName(kanji: string) {
    const codePoint = kanji.codePointAt(0)

    if (!codePoint) {
        return null
    }

    return `${codePoint.toString(16).padStart(5, "0")}.svg`
}

function roundCoordinate(value: number) {
    return String(Math.round(value * 10) / 10)
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}

function parseFirstMovePoint(d: string): Point | null {
    const match = d.match(
        /[Mm]\s*(-?\d+(?:\.\d+)?)\s*,?\s*(-?\d+(?:\.\d+)?)/
    )

    if (!match) {
        return null
    }

    return {
        x: Number(match[1]),
        y: Number(match[2]),
    }
}

function parsePathPoints(d: string): Point[] {
    const pointMatches = d.matchAll(
        /[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi
    )

    const values = Array.from(pointMatches)
        .map((match) => Number(match[0]))
        .filter((value) => !Number.isNaN(value))

    const points: Point[] = []

    for (let index = 0; index < values.length - 1; index += 2) {
        points.push({
            x: values[index],
            y: values[index + 1],
        })
    }

    return points.filter(
        (point) =>
            point.x >= -20 &&
            point.x <= 129 &&
            point.y >= -20 &&
            point.y <= 129
    )
}

function getNumberPosition(pathD: string) {
    const startPoint =
        parseFirstMovePoint(pathD) ||
        parsePathPoints(pathD)[0] ||
        CENTER

    return {
        x: clamp(startPoint.x - 3, 6, 103),
        y: clamp(startPoint.y - 3, 8, 103),
    }
}

function extractStrokePaths(svgText: string): StrokePath[] {
    const parser = new DOMParser()
    const document = parser.parseFromString(svgText, "image/svg+xml")

    const strokePaths = Array.from(
        document.querySelectorAll('g[id*="StrokePaths"] path')
    )

    const paths =
        strokePaths.length > 0
            ? strokePaths
            : Array.from(document.querySelectorAll("path"))

    const pathDataList = paths
        .map((path, index) => ({
            id: path.getAttribute("id") || `stroke-${index}`,
            d: path.getAttribute("d") || "",
        }))
        .filter((path) => path.d)

    return pathDataList.map((path) => {
        const numberPosition = getNumberPosition(path.d)

        return {
            id: path.id,
            d: path.d,
            numberX: roundCoordinate(numberPosition.x),
            numberY: roundCoordinate(numberPosition.y),
        }
    })
}

function getRootClassName(className?: string) {
    return className
        ? `${styles.strokeOrder} ${className}`
        : styles.strokeOrder
}

export default function KanjiStrokeOrder({
    kanji,
    className,
}: Props) {
    const [paths, setPaths] = useState<StrokePath[]>([])
    const [loading, setLoading] = useState(true)
    const [replayKey, setReplayKey] = useState(0)

    useEffect(() => {
        let cancelled = false

        async function loadSvg() {
            const fileName = getKanjiSvgFileName(kanji)

            if (!fileName) {
                setPaths([])
                setLoading(false)
                return
            }

            setLoading(true)

            try {
                const response = await fetch(`/kanjivg/${fileName}`)

                if (!response.ok) {
                    throw new Error("SVG not found")
                }

                const svgText = await response.text()
                const strokePaths = extractStrokePaths(svgText)

                if (!cancelled) {
                    setPaths(strokePaths)
                    setReplayKey((value) => value + 1)
                }
            } catch (error) {
                if (process.env.NODE_ENV !== "production") console.error(error)

                if (!cancelled) {
                    setPaths([])
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadSvg()

        return () => {
            cancelled = true
        }
    }, [kanji])

    const totalDuration = useMemo(() => {
        return paths.length * 0.45 + 1
    }, [paths.length])

    function replay() {
        setReplayKey((value) => value + 1)
    }

    if (loading) {
        return (
            <div className={getRootClassName(className)}>
                <span className={styles.loading}>
                    Đang tải...
                </span>
            </div>
        )
    }

    if (paths.length === 0) {
        return (
            <div className={getRootClassName(className)}>
                <span className={styles.fallback}>{kanji}</span>
            </div>
        )
    }

    return (
        <div className={getRootClassName(className)}>
            <div className={styles.replayAction}>
                <ActionButtons
                    items={[
                        {
                            key: "replay",
                            label: "Phát lại thứ tự nét",
                            icon: <RotateCcw />,
                            onClick: replay,
                        },
                    ]}
                />
            </div>

            <svg
                className={styles.svg}
                viewBox="0 0 109 109"
                role="img"
                aria-label={`Thứ tự nét chữ ${kanji}`}
                style={{
                    ["--total-duration" as string]: `${totalDuration}s`,
                }}
            >
                <line
                    x1="54.5"
                    y1="0"
                    x2="54.5"
                    y2="109"
                    className={styles.guide}
                />

                <line
                    x1="0"
                    y1="54.5"
                    x2="109"
                    y2="54.5"
                    className={styles.guide}
                />

                <g key={replayKey}>
                    {paths.map((path, index) => (
                        <path
                            key={path.id}
                            d={path.d}
                            className={styles.path}
                            style={{
                                stroke:
                                    STROKE_COLORS[
                                    index %
                                    STROKE_COLORS.length
                                    ],
                                animationDelay: `${index * 0.45}s`,
                            }}
                        />
                    ))}

                    {paths.map((path, index) => (
                        <text
                            key={`${path.id}-number`}
                            x={path.numberX}
                            y={path.numberY}
                            className={styles.number}
                            style={{
                                fill:
                                    STROKE_COLORS[
                                    index %
                                    STROKE_COLORS.length
                                    ],
                                animationDelay: `${index * 0.45}s`,
                            }}
                        >
                            {index + 1}
                        </text>
                    ))}
                </g>
            </svg>
        </div>
    )
}