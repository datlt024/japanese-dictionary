"use client"

import { useEffect, useMemo, useState } from "react"

import styles from "./KanjiStrokeOrder.module.css"

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

const STROKE_SAFE_DISTANCE = 8
const NUMBER_SAFE_DISTANCE = 11

const NUMBER_OFFSET_CANDIDATES = [
    { x: -12, y: -10 },
    { x: 12, y: -10 },
    { x: -12, y: 12 },
    { x: 12, y: 12 },
    { x: -18, y: 0 },
    { x: 18, y: 0 },
    { x: 0, y: -18 },
    { x: 0, y: 18 },
    { x: -22, y: -12 },
    { x: 22, y: -12 },
    { x: -22, y: 14 },
    { x: 22, y: 14 },
    { x: -28, y: 0 },
    { x: 28, y: 0 },
    { x: 0, y: -28 },
    { x: 0, y: 28 },
]

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

function getDistance(a: Point, b: Point) {
    const dx = a.x - b.x
    const dy = a.y - b.y

    return Math.sqrt(dx * dx + dy * dy)
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

function normalizeNumberPoint(point: Point): Point {
    return {
        x: clamp(point.x, 8, 101),
        y: clamp(point.y, 12, 101),
    }
}

function getOutwardOffset(startPoint: Point) {
    const dx = startPoint.x - CENTER.x
    const dy = startPoint.y - CENTER.y
    const distance = Math.sqrt(dx * dx + dy * dy) || 1

    return {
        x: (dx / distance) * 16,
        y: (dy / distance) * 16,
    }
}

function isTooCloseToStroke(
    candidate: Point,
    allStrokePoints: Point[]
) {
    return allStrokePoints.some(
        (point) => getDistance(candidate, point) < STROKE_SAFE_DISTANCE
    )
}

function isTooCloseToPlacedNumber(
    candidate: Point,
    placedNumbers: Point[]
) {
    return placedNumbers.some(
        (point) => getDistance(candidate, point) < NUMBER_SAFE_DISTANCE
    )
}

function getCandidateScore(
    candidate: Point,
    startPoint: Point,
    allStrokePoints: Point[],
    placedNumbers: Point[]
) {
    const nearestStrokeDistance = Math.min(
        ...allStrokePoints.map((point) => getDistance(candidate, point))
    )

    const nearestNumberDistance =
        placedNumbers.length > 0
            ? Math.min(
                ...placedNumbers.map((point) =>
                    getDistance(candidate, point)
                )
            )
            : 32

    const distanceFromStart = getDistance(candidate, startPoint)

    return (
        nearestStrokeDistance * 2 +
        nearestNumberDistance * 3 -
        distanceFromStart * 0.5
    )
}

function getNumberCandidates(startPoint: Point) {
    const outwardOffset = getOutwardOffset(startPoint)

    return [
        {
            x: startPoint.x + outwardOffset.x,
            y: startPoint.y + outwardOffset.y,
        },
        ...NUMBER_OFFSET_CANDIDATES.map((offset) => ({
            x: startPoint.x + offset.x,
            y: startPoint.y + offset.y,
        })),
    ].map(normalizeNumberPoint)
}

function getNumberPosition(
    pathD: string,
    allStrokePoints: Point[],
    placedNumbers: Point[]
) {
    const startPoint =
        parseFirstMovePoint(pathD) ||
        parsePathPoints(pathD)[0] ||
        CENTER

    const candidates = getNumberCandidates(startPoint)

    const safeCandidate = candidates.find(
        (candidate) =>
            !isTooCloseToStroke(candidate, allStrokePoints) &&
            !isTooCloseToPlacedNumber(candidate, placedNumbers)
    )

    if (safeCandidate) {
        return safeCandidate
    }

    const sortedCandidates = [...candidates].sort((a, b) => {
        return (
            getCandidateScore(
                b,
                startPoint,
                allStrokePoints,
                placedNumbers
            ) -
            getCandidateScore(
                a,
                startPoint,
                allStrokePoints,
                placedNumbers
            )
        )
    })

    return sortedCandidates[0]
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

    const allStrokePoints = pathDataList.flatMap((path) =>
        parsePathPoints(path.d)
    )

    const placedNumbers: Point[] = []

    return pathDataList.map((path) => {
        const numberPosition = getNumberPosition(
            path.d,
            allStrokePoints,
            placedNumbers
        )

        placedNumbers.push(numberPosition)

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
                console.error(error)

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
            <button
                type="button"
                className={styles.replayButton}
                onClick={replay}
                aria-label="Phát lại thứ tự nét"
                title="Phát lại"
            >
                ↻
            </button>

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