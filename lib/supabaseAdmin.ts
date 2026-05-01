// =============================================================
// Server-side Supabase Admin client (service role)
// =============================================================
// ⚠️  This file must ONLY be used in server-side code:
//     - API routes (/app/api/*)
//     - Server Components
//     - Server Actions
//
// The service role key bypasses RLS and has full database access.
// NEVER import this file in client components or browser code.
// =============================================================

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
