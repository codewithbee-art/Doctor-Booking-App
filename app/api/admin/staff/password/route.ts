import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "@/lib/adminAuth";

/* ------------------------------------------------------------------ */
/*  POST /api/admin/staff/password — owner-only staff password reset  */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request, { allowedRoles: ["owner"] });
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { staff_id, new_password } = body;

    if (!staff_id || typeof staff_id !== "string") {
      return NextResponse.json({ success: false, error: "staff_id is required." }, { status: 400 });
    }

    if (!new_password || typeof new_password !== "string" || new_password.length < 8) {
      return NextResponse.json({ success: false, error: "New password is required (at least 8 characters)." }, { status: 400 });
    }

    // Fetch target staff profile to get auth_user_id
    const { data: target } = await supabaseAdmin
      .from("staff_profiles")
      .select("id, auth_user_id, full_name")
      .eq("id", staff_id)
      .single();

    if (!target) {
      return NextResponse.json({ success: false, error: "Staff member not found." }, { status: 404 });
    }

    // Update the password via Supabase Admin Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      target.auth_user_id,
      { password: new_password }
    );

    if (updateError) {
      return NextResponse.json({ success: false, error: "Failed to update password." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch {
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}
