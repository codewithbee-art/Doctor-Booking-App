import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/specialists
 *
 * Returns all visiting specialists (active and inactive), ordered by visit_date_ad desc.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("visiting_specialists")
      .select("*")
      .order("visit_date_ad", { ascending: false });

    if (error) {
      console.error("[admin/specialists GET]", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch specialists.", detail: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, specialists: data ?? [] });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/specialists
 *
 * Create a new specialist visit.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      specialist_name,
      specialization,
      treatment_type,
      visit_date_bs,
      visit_date_ad,
      available_from,
      available_to,
      consultation_fee,
    } = body;

    if (!specialist_name || typeof specialist_name !== "string" || specialist_name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Specialist name is required (at least 2 characters)." },
        { status: 400 }
      );
    }
    if (!specialization || typeof specialization !== "string") {
      return NextResponse.json(
        { success: false, error: "Specialization is required." },
        { status: 400 }
      );
    }
    if (!treatment_type || typeof treatment_type !== "string") {
      return NextResponse.json(
        { success: false, error: "Treatment type is required." },
        { status: 400 }
      );
    }
    if (!visit_date_ad || !/^\d{4}-\d{2}-\d{2}$/.test(visit_date_ad)) {
      return NextResponse.json(
        { success: false, error: "Valid visit date (AD) is required (YYYY-MM-DD)." },
        { status: 400 }
      );
    }
    if (!available_from || !available_to) {
      return NextResponse.json(
        { success: false, error: "Available from/to times are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("visiting_specialists")
      .insert({
        specialist_name: specialist_name.trim(),
        specialization: specialization.trim(),
        treatment_type: treatment_type.trim(),
        visit_date_bs: visit_date_bs || "",
        visit_date_ad,
        available_from,
        available_to,
        consultation_fee: consultation_fee != null ? Number(consultation_fee) : null,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) {
      console.error("[admin/specialists POST]", error);
      return NextResponse.json(
        { success: false, error: "Failed to create specialist visit.", detail: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, specialist: data });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/specialists
 *
 * Update an existing specialist visit.
 * Body must include { id, ...fields_to_update }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Specialist visit id is required." },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};

    if ("specialist_name" in body && body.specialist_name) {
      updates.specialist_name = String(body.specialist_name).trim();
    }
    if ("specialization" in body && body.specialization) {
      updates.specialization = String(body.specialization).trim();
    }
    if ("treatment_type" in body && body.treatment_type) {
      updates.treatment_type = String(body.treatment_type).trim();
    }
    if ("visit_date_ad" in body && body.visit_date_ad) {
      updates.visit_date_ad = body.visit_date_ad;
    }
    if ("visit_date_bs" in body) {
      updates.visit_date_bs = body.visit_date_bs || "";
    }
    if ("available_from" in body && body.available_from) {
      updates.available_from = body.available_from;
    }
    if ("available_to" in body && body.available_to) {
      updates.available_to = body.available_to;
    }
    if ("consultation_fee" in body) {
      updates.consultation_fee = body.consultation_fee != null ? Number(body.consultation_fee) : null;
    }
    if ("is_active" in body && typeof body.is_active === "boolean") {
      updates.is_active = body.is_active;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("visiting_specialists")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("[admin/specialists PATCH]", error);
      return NextResponse.json(
        { success: false, error: "Failed to update specialist visit.", detail: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, specialist: data });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/specialists
 *
 * Delete a specialist visit. Only deletes if there are no linked bookings.
 * Body: { id }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Specialist visit id is required." },
        { status: 400 }
      );
    }

    // Check if any bookings reference this specialist
    const { data: linkedBookings } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("specialist_id", id)
      .limit(1);

    if (linkedBookings && linkedBookings.length > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete: this specialist visit has linked bookings. Deactivate instead." },
        { status: 409 }
      );
    }

    const { error } = await supabaseAdmin
      .from("visiting_specialists")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[admin/specialists DELETE]", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete specialist visit.", detail: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
