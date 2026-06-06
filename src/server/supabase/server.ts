import { createClient } from "@supabase/supabase-js"

import { Database } from "@/shared/types/database.generated"

export const supabaseServer =
    createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )