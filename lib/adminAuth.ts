import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { StaffRole } from "@/types/database";

/* ------------------------------------------------------------------ */
/*  Shared admin API authentication helper                             */
/*  Phase 14A: Admin API Authentication Lockdown                       */
/* ------------------------------------------------------------------ */

export interface AdminAuthResult {
  userId: string;
  profile: {
    id: string;
    auth_user_id: string;
    full_name: string;
    email: string;
    role: StaffRole;
    phone: string | null;
    is_active: boolean;
  };
}

/**
 * Verify the incoming request is from an authenticated, active staff member.
 *
 * Usage in API routes:
 *   const auth = await verifyAdmin(request);
 *   if (auth instanceof NextResponse) return auth;
 *   // auth.userId, auth.profile available
 *
 * @param request  — the incoming Request object
 * @param options  — optional config
 *   allowedRoles: restrict to specific roles (owner always implied unless excluded)
 */
export async function verifyAdmin(
  request: Request,
  options?: { allowedRoles?: StaffRole[] }
): Promise<AdminAuthResult | NextResponse> {
  try {
    // 1. Extract Bearer token
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    // 2. Verify token with Supabase Auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    // 3. Load staff profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("staff_profiles")
      .select("id, auth_user_id, full_name, email, role, phone, is_active")
      .eq("auth_user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Access denied." },
        { status: 403 }
      );
    }

    // 4. Check active status
    if (!profile.is_active) {
      return NextResponse.json(
        { success: false, error: "Account is inactive." },
        { status: 403 }
      );
    }

    // 5. Check allowed roles if specified
    if (options?.allowedRoles && options.allowedRoles.length > 0) {
      if (!options.allowedRoles.includes(profile.role as StaffRole)) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions." },
          { status: 403 }
        );
      }
    }

    // 6. Return authenticated result
    return {
      userId: user.id,
      profile: profile as AdminAuthResult["profile"],
    };
  } catch {
    return NextResponse.json(
      { success: false, error: "Authentication failed." },
      { status: 401 }
    );
  }
}
