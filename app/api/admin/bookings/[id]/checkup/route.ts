import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * GET /api/admin/bookings/[id]/checkup
 *
 * Returns the existing visit linked to this booking, or null.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: bookingId } = params;

  try {
    const { data: visit } = await supabaseAdmin
      .from("patient_visits")
      .select("id, visit_date_ad, visit_date_bs, chief_complaint, visit_notes, prescribed_medicines, follow_up_instructions, condition_summary, created_at, updated_at")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({ success: true, visit: visit || null });
  } catch {
    return NextResponse.json({ success: true, visit: null });
  }
}

/**
 * POST /api/admin/bookings/[id]/checkup
 *
 * Creates or updates the visit record linked to this booking.
 * If a visit already exists for this booking_id, it is updated.
 * Optionally marks the booking as "completed".
 *
 * Body:
 *   visit_date_ad          (required, YYYY-MM-DD)
 *   chief_complaint        (optional)
 *   visit_notes            (optional)
 *   prescribed_medicines   (optional)
 *   follow_up_instructions (optional)
 *   condition_summary      (optional)
 *   complete_booking       (optional, boolean — if true, marks booking as completed)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: bookingId } = params;

  try {
    const body = await request.json();
    const {
      visit_date_ad,
      chief_complaint = null,
      visit_notes = null,
      prescribed_medicines = null,
      follow_up_instructions = null,
      condition_summary = null,
      complete_booking = false,
    } = body;

    if (!visit_date_ad || typeof visit_date_ad !== "string") {
      return NextResponse.json(
        { success: false, error: "visit_date_ad is required." },
        { status: 400 }
      );
    }

    // Fetch booking
    const { data: booking, error: bookingErr } = await supabaseAdmin
      .from("bookings")
      .select("id, patient_id, status")
      .eq("id", bookingId)
      .single();

    if (bookingErr || !booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found." },
        { status: 404 }
      );
    }

    if (!booking.patient_id) {
      return NextResponse.json(
        { success: false, error: "No patient linked to this booking. Cannot create visit." },
        { status: 400 }
      );
    }

    // Check if visit already exists for this booking
    const { data: existingVisit } = await supabaseAdmin
      .from("patient_visits")
      .select("id")
      .eq("booking_id", bookingId)
      .limit(1)
      .single();

    let visitId: string;

    if (existingVisit) {
      // Update existing visit
      const { error: updateErr } = await supabaseAdmin
        .from("patient_visits")
        .update({
          visit_date_ad,
          chief_complaint: chief_complaint || null,
          visit_notes: visit_notes || null,
          prescribed_medicines: prescribed_medicines || null,
          follow_up_instructions: follow_up_instructions || null,
          condition_summary: condition_summary || null,
        })
        .eq("id", existingVisit.id);

      if (updateErr) {
        return NextResponse.json(
          { success: false, error: "Failed to update visit record." },
          { status: 500 }
        );
      }
      visitId = existingVisit.id;
    } else {
      // Insert new visit
      const { data: newVisit, error: insertErr } = await supabaseAdmin
        .from("patient_visits")
        .insert({
          patient_id: booking.patient_id,
          booking_id: bookingId,
          visit_date_ad,
          visit_date_bs: "",
          chief_complaint: chief_complaint || null,
          visit_notes: visit_notes || null,
          prescribed_medicines: prescribed_medicines || null,
          follow_up_instructions: follow_up_instructions || null,
          condition_summary: condition_summary || null,
        })
        .select("id")
        .single();

      if (insertErr || !newVisit) {
        return NextResponse.json(
          { success: false, error: "Failed to create visit record." },
          { status: 500 }
        );
      }
      visitId = newVisit.id;
    }

    // Optionally mark booking as completed
    if (complete_booking && booking.status !== "completed") {
      await supabaseAdmin
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", bookingId);
    }

    return NextResponse.json({
      success: true,
      visit_id: visitId,
      booking_completed: !!complete_booking,
      updated: !!existingVisit,
    }, { status: existingVisit ? 200 : 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
