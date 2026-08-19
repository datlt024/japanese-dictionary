import "server-only"
type Level = "error" | "warn" | "info"

interface LogMeta {
    [key: string]: unknown
}

function log(level: Level, context: string, message: string, meta?: LogMeta) {
    const entry = meta
        ? `[${level.toUpperCase()}] [${context}] ${message} ${JSON.stringify(meta)}`
        : `[${level.toUpperCase()}] [${context}] ${message}`
    if (level === "error") console.error(entry)
    else if (level === "warn") console.warn(entry)
    else console.log(entry)
}

export const logger = {
    error: (context: string, message: string, meta?: LogMeta) => log("error", context, message, meta),
    warn:  (context: string, message: string, meta?: LogMeta) => log("warn",  context, message, meta),
    info:  (context: string, message: string, meta?: LogMeta) => log("info",  context, message, meta),
}
