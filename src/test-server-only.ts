// Vitest shim for "server-only" — the real package throws at runtime to prevent
// client-side usage, but in tests we're running server code directly, so this
// is intentionally a no-op.
export {}
