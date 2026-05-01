// =============================================================
// Server-side Supabase client (anon key, for auth/session)
// =============================================================
// Use this in Server Components and Route Handlers where you
// need a Supabase client that respects RLS but runs on the
// server (e.g. reading session cookies for admin auth).
//
// Unlike supabaseAdmin.ts, this uses the public anon key and
// does NOT bypass Row Level Security.
// =============================================================

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createServerClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
