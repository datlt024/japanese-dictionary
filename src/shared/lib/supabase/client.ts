import { createClient } from "@supabase/supabase-js"

import { Database } from "@/shared/types/database.generated"
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/shared/utils/publicEnv"

export const supabaseClient =
    createClient<Database>(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    )