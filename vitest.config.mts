import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

const root = import.meta.dirname

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        environmentOptions: {
            jsdom: {
                url: "http://localhost:3000",
            },
        },
        globals: true,
        setupFiles: ["./src/test-setup.ts"],
        css: {
            modules: {
                classNameStrategy: "non-scoped",
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(root, "./src"),
            // Allow testing server-only modules in vitest (no browser runtime guard needed)
            "server-only": path.resolve(root, "./src/test-server-only.ts"),
        },
    },
})
