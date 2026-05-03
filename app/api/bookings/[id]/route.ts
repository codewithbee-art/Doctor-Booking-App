import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ALLOWED_STATUSES = ["pending", "confirmed", "cancelled", "completed"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { success: false, error: "Booking ID is required." },
      { status: 400 }
    );
  }

  let body: { status?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { status } = body;

  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json(
      { success: false, error: `Status must be one of: ${ALLOWED_STATUSES.join(", ")}.` },
      { status: 400 }
    );
  }

  try {
    // Fetch full booking to get date/time for slot management
    const { data: existing, error: findError } = await supabaseAdmin
      .from("bookings")
      .select("id, status, appointment_date_ad, appointment_time")
      .eq("id", id)
      .single();

    if (findError || !existing) {
      return NextResponse.json(
        { success: false, error: "Booking not found." },
        { status: 404 }
      );
    }

    const prevStatus = existing.status;

    // ---- Slot management: cancelling releases the slot ----
    if (status === "cancelled" && prevStatus !== "cancelled") {
      await supabaseAdmin
        .from("available_slots")
        .update({ is_booked: false })
        .eq("slot_date_ad", existing.appointment_date_ad)
        .eq("slot_time", existing.appointment_time);
    }

    // ---- Slot management: restoring from cancelled re-books the slot ----
    if (prevStatus === "cancelled" && status === "pending") {
      const { data: slot } = await supabaseAdmin
        .from("available_slots")
        .select("id, is_booked")
        .eq("slot_date_ad", existing.appointment_date_ad)
        .eq("slot_time", existing.appointment_time)
        .single();

      if (!slot) {
        return NextResponse.json(
          { success: false, error: "The original time slot no longer exists." },
          { status: 409 }
        );
      }

      if (slot.is_booked) {
        return NextResponse.json(
          { success: false, error: "The original time slot has already been booked by another patient." },
          { status: 409 }
        );
      }

      const { error: rebookError } = await supabaseAdmin
        .from("available_slots")
        .update({ is_booked: true })
        .eq("id", slot.id)
        .eq("is_booked", false);

      if (rebookError) {
        return NextResponse.json(
          { success: false, error: "Failed to re-reserve the time slot." },
          { status: 500 }
        );
      }
    }

    // ---- Update booking status ----
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select(
        "id, patient_name, patient_phone, patient_email, problem, appointment_date_bs, appointment_date_ad, appointment_time, booking_type, specialist_id, status, created_at"
      )
      .single();

    if (updateError || !updated) {
      // Rollback slot if we just re-booked it
      if (prevStatus === "cancelled" && status === "pending") {
        await supabaseAdmin
          .from("available_slots")
          .update({ is_booked: false })
          .eq("slot_date_ad", existing.appointment_date_ad)
          .eq("slot_time", existing.appointment_time);
      }
      return NextResponse.json(
        { success: false, error: "Failed to update booking status." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
