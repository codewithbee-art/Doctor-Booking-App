import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * GET /api/admin/staff/me
 *
 * Returns the staff profile for the currently authenticated user.
 * Requires Authorization header with Bearer token from Supabase Auth.
 *
 * Response:
 *   { success: true, profile: StaffProfile } — found
 *   { success: true, profile: null }          — authenticated but no staff profile
 *   { success: false, error: "..." }          — not authenticated
 */
export async function GET(request: Request) {
  try {
    // Extract the access token from the Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 }
      );
    }

    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    // Fetch staff profile by auth_user_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("staff_profiles")
      .select("id, auth_user_id, full_name, email, role, phone, is_active, created_at, updated_at")
      .eq("auth_user_id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 = no rows found — that's okay, just means no profile yet
      return NextResponse.json(
        { success: false, error: "Failed to fetch staff profile." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, profile: profile ?? null });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
