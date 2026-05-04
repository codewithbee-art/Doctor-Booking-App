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
