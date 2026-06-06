import { createClient } from "@supabase/supabase-js"

import { Database } from "@/shared/types/database.generated"

export const supabaseAdmin =
    createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )