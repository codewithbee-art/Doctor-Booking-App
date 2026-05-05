import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * POST /api/admin/patients/visits
 *
 * Creates a new patient visit / treatment record.
 *
 * Body:
 *   patient_id             (required, uuid)
 *   visit_date_ad          (required, YYYY-MM-DD)
 *   visit_date_bs          (optional, text — default "")
 *   booking_id             (optional, uuid)
 *   chief_complaint        (optional, text)
 *   visit_notes            (optional, text)
 *   prescribed_medicines   (optional, text)
 *   follow_up_instructions (optional, text)
 *   condition_summary      (optional, text)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      patient_id,
      visit_date_ad,
      visit_date_bs = "",
      booking_id = null,
      chief_complaint = null,
      visit_notes = null,
      prescribed_medicines = null,
      follow_up_instructions = null,
      condition_summary = null,
    } = body;

    // Validate required fields
    if (!patient_id || typeof patient_id !== "string") {
      return NextResponse.json(
        { success: false, error: "patient_id is required." },
        { status: 400 }
      );
    }
    if (!visit_date_ad || typeof visit_date_ad !== "string") {
      return NextResponse.json(
        { success: false, error: "visit_date_ad is required." },
        { status: 400 }
      );
    }

    // Verify patient exists
    const { data: patient, error: patientErr } = await supabaseAdmin
      .from("patients")
      .select("id")
      .eq("id", patient_id)
      .single();

    if (patientErr || !patient) {
      return NextResponse.json(
        { success: false, error: "Patient not found." },
        { status: 404 }
      );
    }

    // If booking_id is provided, verify it exists
    if (booking_id) {
      const { data: booking, error: bookingErr } = await supabaseAdmin
        .from("bookings")
        .select("id")
        .eq("id", booking_id)
        .single();

      if (bookingErr || !booking) {
        return NextResponse.json(
          { success: false, error: "Linked booking not found." },
          { status: 404 }
        );
      }
    }

    // Insert visit
    const { data: visit, error: insertErr } = await supabaseAdmin
      .from("patient_visits")
      .insert({
        patient_id,
        visit_date_ad,
        visit_date_bs,
        booking_id: booking_id || null,
        chief_complaint: chief_complaint || null,
        visit_notes: visit_notes || null,
        prescribed_medicines: prescribed_medicines || null,
        follow_up_instructions: follow_up_instructions || null,
        condition_summary: condition_summary || null,
      })
      .select("id, visit_date_ad, visit_date_bs, chief_complaint, visit_notes, prescribed_medicines, follow_up_instructions, condition_summary, created_at")
      .single();

    if (insertErr) {
      return NextResponse.json(
        { success: false, error: "Failed to create visit record." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, visit }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/patients/visits
 *
 * Updates an existing visit record.
 *
 * Body:
 *   visit_id               (required, uuid)
 *   visit_date_ad          (optional)
 *   chief_complaint        (optional)
 *   visit_notes            (optional)
 *   prescribed_medicines   (optional)
 *   follow_up_instructions (optional)
 *   condition_summary      (optional)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { visit_id } = body;

    if (!visit_id || typeof visit_id !== "string") {
      return NextResponse.json(
        { success: false, error: "visit_id is required." },
        { status: 400 }
      );
    }

    // Verify visit exists
    const { data: existing, error: findErr } = await supabaseAdmin
      .from("patient_visits")
      .select("id")
      .eq("id", visit_id)
      .single();

    if (findErr || !existing) {
      return NextResponse.json(
        { success: false, error: "Visit not found." },
        { status: 404 }
      );
    }

    // Build update payload (only include fields that are present in the body)
    const updates: Record<string, unknown> = {};
    if ("visit_date_ad" in body && body.visit_date_ad) updates.visit_date_ad = body.visit_date_ad;
    if ("chief_complaint" in body) updates.chief_complaint = body.chief_complaint || null;
    if ("visit_notes" in body) updates.visit_notes = body.visit_notes || null;
    if ("prescribed_medicines" in body) updates.prescribed_medicines = body.prescribed_medicines || null;
    if ("follow_up_instructions" in body) updates.follow_up_instructions = body.follow_up_instructions || null;
    if ("condition_summary" in body) updates.condition_summary = body.condition_summary || null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update." },
        { status: 400 }
      );
    }

    const { data: visit, error: updateErr } = await supabaseAdmin
      .from("patient_visits")
      .update(updates)
      .eq("id", visit_id)
      .select("id, visit_date_ad, visit_date_bs, booking_id, chief_complaint, visit_notes, prescribed_medicines, follow_up_instructions, condition_summary, created_at, updated_at")
      .single();

    if (updateErr) {
      return NextResponse.json(
        { success: false, error: "Failed to update visit record." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, visit });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
