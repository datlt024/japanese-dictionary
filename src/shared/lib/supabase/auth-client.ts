import { createBrowserClient } from "@supabase/ssr"

import type { Database } from "@/shared/types/database.generated"
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/shared/utils/publicEnv"

export function createSupabaseBrowserClient() {
    return createBrowserClient<Database>(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    )
}
