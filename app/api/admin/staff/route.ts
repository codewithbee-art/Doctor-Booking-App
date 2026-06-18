import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "@/lib/adminAuth";
import { defaultPermissionsForRole, normalizePermissions, enforceOwnerOnly } from "@/lib/permissions";
import type { StaffRole } from "@/types/database";

const VALID_ROLES: StaffRole[] = ["owner", "doctor", "receptionist", "inventory_manager", "content_editor"];

/* ------------------------------------------------------------------ */
/*  GET /api/admin/staff — list all staff profiles                    */
/* ------------------------------------------------------------------ */
export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin(request, { allowedRoles: ["owner"] });
    if (auth instanceof NextResponse) return auth;

    const { data: staff, error } = await supabaseAdmin
      .from("staff_profiles")
      .select("id, auth_user_id, full_name, email, role, phone, is_active, permissions, created_at, updated_at")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: "Failed to fetch staff list." }, { status: 500 });
    }

    return NextResponse.json({ success: true, staff: staff ?? [] });
  } catch {
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/admin/staff — create a new staff user + profile         */
/*  Creates a Supabase Auth user and then a staff_profiles row.       */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request, { allowedRoles: ["owner"] });
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { full_name, email, phone, role, password, permissions } = body;

    if (!full_name || typeof full_name !== "string" || full_name.trim().length < 2) {
      return NextResponse.json({ success: false, error: "Full name is required (at least 2 characters)." }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "A valid email address is required." }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ success: false, error: "Password is required (at least 8 characters)." }, { status: 400 });
    }
    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: `Role must be one of: ${VALID_ROLES.join(", ")}.` }, { status: 400 });
    }

    // Determine permissions: use submitted if provided, otherwise default from role template
    // Then enforce owner-only keys based on role
    const rawPermissions = permissions
      ? normalizePermissions(permissions)
      : defaultPermissionsForRole(role as StaffRole);
    const finalPermissions = enforceOwnerOnly(rawPermissions, role as StaffRole);

    // 1. Create Supabase Auth user using admin API (service role)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true, // auto-confirm so the user can log in immediately
    });

    if (authError) {
      // Check for duplicate email
      if (authError.message?.includes("already been registered") || authError.message?.includes("already exists")) {
        return NextResponse.json({ success: false, error: "A user with this email already exists." }, { status: 409 });
      }
      return NextResponse.json({ success: false, error: authError.message || "Failed to create auth user." }, { status: 500 });
    }

    if (!authData.user) {
      return NextResponse.json({ success: false, error: "Failed to create auth user." }, { status: 500 });
    }

    // 2. Create staff_profiles row
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("staff_profiles")
      .insert({
        auth_user_id: authData.user.id,
        full_name: full_name.trim(),
        email: email.trim(),
        phone: phone && typeof phone === "string" ? phone.trim() || null : null,
        role,
        is_active: true,
        permissions: finalPermissions,
      })
      .select("*")
      .single();

    if (profileError) {
      // Cleanup: delete the auth user we just created
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ success: false, error: "Failed to create staff profile." }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/admin/staff — update an existing staff profile         */
/* ------------------------------------------------------------------ */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request, { allowedRoles: ["owner"] });
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { staff_id, full_name, phone, role, is_active, permissions } = body;

    if (!staff_id || typeof staff_id !== "string") {
      return NextResponse.json({ success: false, error: "staff_id is required." }, { status: 400 });
    }

    // Fetch the target profile to check constraints
    const { data: target } = await supabaseAdmin
      .from("staff_profiles")
      .select("id, auth_user_id, role, is_active")
      .eq("id", staff_id)
      .single();

    if (!target) {
      return NextResponse.json({ success: false, error: "Staff member not found." }, { status: 404 });
    }

    // Prevent owner from deactivating themselves
    if (target.auth_user_id === auth.profile.auth_user_id && is_active === false) {
      return NextResponse.json({ success: false, error: "You cannot deactivate your own account." }, { status: 400 });
    }

    // Prevent owner from changing their own role away from owner
    if (target.auth_user_id === auth.profile.auth_user_id && role && role !== "owner") {
      return NextResponse.json({ success: false, error: "You cannot change your own role away from owner." }, { status: 400 });
    }

    // Prevent owner from editing their own permissions
    if (target.auth_user_id === auth.profile.auth_user_id && permissions !== undefined) {
      return NextResponse.json({ success: false, error: "You cannot edit your own permissions." }, { status: 400 });
    }

    // Last-active-owner protection
    if (target.role === "owner" && target.is_active) {
      const isDeactivating = is_active === false;
      const isDemoting = role !== undefined && role !== "owner";

      if (isDeactivating || isDemoting) {
        // Count other active owners
        const { count } = await supabaseAdmin
          .from("staff_profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "owner")
          .eq("is_active", true)
          .neq("id", staff_id);

        if ((count ?? 0) < 1) {
          return NextResponse.json(
            { success: false, error: "Cannot deactivate or demote the last active owner." },
            { status: 400 }
          );
        }
      }
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = {};
    if (full_name !== undefined && typeof full_name === "string" && full_name.trim().length >= 2) {
      updatePayload.full_name = full_name.trim();
    }
    if (phone !== undefined) {
      updatePayload.phone = phone && typeof phone === "string" ? phone.trim() || null : null;
    }
    if (role !== undefined) {
      if (!VALID_ROLES.includes(role)) {
        return NextResponse.json({ success: false, error: `Role must be one of: ${VALID_ROLES.join(", ")}.` }, { status: 400 });
      }
      updatePayload.role = role;
    }
    if (is_active !== undefined && typeof is_active === "boolean") {
      updatePayload.is_active = is_active;
    }
    if (permissions !== undefined) {
      const targetRole = (role ?? target.role) as StaffRole;
      updatePayload.permissions = enforceOwnerOnly(normalizePermissions(permissions), targetRole);
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ success: false, error: "No valid fields to update." }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("staff_profiles")
      .update(updatePayload)
      .eq("id", staff_id)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: "Failed to update staff profile." }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: updated });
  } catch {
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}
