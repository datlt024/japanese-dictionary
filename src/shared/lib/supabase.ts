import { createClient } from "@supabase/supabase-js"

import { Database } from "@/shared/types/database.generated"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createClient<Database>(
    supabaseUrl,
    supabaseKey
)