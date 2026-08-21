import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { isAdminUser } from "./admin"

function makeUser(id: string, role?: string) {
    return {
        id,
        app_metadata: role ? { role } : {},
    }
}

describe("isAdminUser", () => {
    const originalEnv = process.env.ADMIN_USER_IDS

    beforeEach(() => {
        delete process.env.ADMIN_USER_IDS
    })

    afterEach(() => {
        if (originalEnv !== undefined) {
            process.env.ADMIN_USER_IDS = originalEnv
        } else {
            delete process.env.ADMIN_USER_IDS
        }
    })

    describe("via ADMIN_USER_IDS env var", () => {
        it("grants access when userId is in the env var", () => {
            process.env.ADMIN_USER_IDS = "user-abc,user-def"
            expect(isAdminUser(makeUser("user-abc"))).toBe(true)
        })

        it("grants access to the second id in a comma-separated list", () => {
            process.env.ADMIN_USER_IDS = "user-abc,user-def"
            expect(isAdminUser(makeUser("user-def"))).toBe(true)
        })

        it("denies access when userId is NOT in the env var", () => {
            process.env.ADMIN_USER_IDS = "user-abc,user-def"
            expect(isAdminUser(makeUser("user-xyz"))).toBe(false)
        })

        it("handles whitespace around ids in the env var", () => {
            process.env.ADMIN_USER_IDS = "  user-abc , user-def  "
            expect(isAdminUser(makeUser("user-abc"))).toBe(true)
            expect(isAdminUser(makeUser("user-def"))).toBe(true)
        })

        it("denies access when env var is empty", () => {
            process.env.ADMIN_USER_IDS = ""
            expect(isAdminUser(makeUser("user-abc"))).toBe(false)
        })

        it("denies access when env var is not set", () => {
            delete process.env.ADMIN_USER_IDS
            expect(isAdminUser(makeUser("user-abc"))).toBe(false)
        })
    })

    describe("via app_metadata.role", () => {
        it("grants access when app_metadata.role is 'admin'", () => {
            expect(isAdminUser(makeUser("user-xyz", "admin"))).toBe(true)
        })

        it("denies access when role is something other than 'admin'", () => {
            expect(isAdminUser(makeUser("user-xyz", "moderator"))).toBe(false)
        })

        it("denies access when app_metadata has no role field", () => {
            expect(isAdminUser(makeUser("user-xyz"))).toBe(false)
        })
    })

    describe("combined checks", () => {
        it("grants access if user matches ADMIN_USER_IDS even without admin role", () => {
            process.env.ADMIN_USER_IDS = "user-abc"
            expect(isAdminUser(makeUser("user-abc"))).toBe(true)
        })

        it("grants access if user has admin role even when not in ADMIN_USER_IDS", () => {
            process.env.ADMIN_USER_IDS = "other-user"
            expect(isAdminUser(makeUser("user-xyz", "admin"))).toBe(true)
        })

        it("denies access when neither condition is met", () => {
            process.env.ADMIN_USER_IDS = "other-user"
            expect(isAdminUser(makeUser("user-xyz", "guest"))).toBe(false)
        })
    })
})
