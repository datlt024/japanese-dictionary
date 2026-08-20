import "server-only"
import { createClient } from "@supabase/supabase-js"

import { Database } from "@/shared/types/database.generated"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")

export const supabaseServer = createClient<Database>(url, key)

// Alias kept for backward compatibility — prefer supabaseServer in new code
export const supabaseAdmin = supabaseServer