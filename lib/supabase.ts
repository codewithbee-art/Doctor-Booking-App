// =============================================================
// Browser / Client-side Supabase client
// =============================================================
// Safe for use in client components and browser code.
// Uses the public anon key (NEXT_PUBLIC_*) which respects RLS.
// =============================================================

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
