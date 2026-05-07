import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * PATCH /api/admin/bookings/[id]/link
 *
 * Manually link a booking to an existing patient.
 *
 * Body:
 *   patient_id  (required, uuid)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: bookingId } = params;

  try {
    const body = await request.json();
    const { patient_id } = body;

    if (!patient_id || typeof patient_id !== "string") {
      return NextResponse.json(
        { success: false, error: "patient_id is required." },
        { status: 400 }
      );
    }

    // Verify booking exists
    const { data: booking, error: bErr } = await supabaseAdmin
      .from("bookings")
      .select("id, patient_id")
      .eq("id", bookingId)
      .single();

    if (bErr || !booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found." },
        { status: 404 }
      );
    }

    // Verify patient exists
    const { data: patient, error: pErr } = await supabaseAdmin
      .from("patients")
      .select("id, name")
      .eq("id", patient_id)
      .single();

    if (pErr || !patient) {
      return NextResponse.json(
        { success: false, error: "Patient not found." },
        { status: 404 }
      );
    }

    // Update booking
    const { error: updateErr } = await supabaseAdmin
      .from("bookings")
      .update({ patient_id })
      .eq("id", bookingId);

    if (updateErr) {
      return NextResponse.json(
        { success: false, error: "Failed to link booking." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Booking linked to ${patient.name}.`,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
