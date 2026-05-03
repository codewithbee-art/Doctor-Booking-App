import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ALLOWED_STATUSES = ["pending", "confirmed", "cancelled", "completed"];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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

/* ------------------------------------------------------------------ */
/*  PUT /api/bookings/[id]  — Reschedule a booking                     */
/* ------------------------------------------------------------------ */

export async function PUT(
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

  let body: {
    appointment_date_ad?: string;
    appointment_date_bs?: string;
    appointment_time?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { appointment_date_ad, appointment_date_bs, appointment_time } = body;

  if (!appointment_date_ad || !DATE_REGEX.test(appointment_date_ad)) {
    return NextResponse.json(
      { success: false, error: "A valid appointment date (YYYY-MM-DD) is required." },
      { status: 400 }
    );
  }

  if (!appointment_time || !appointment_time.trim()) {
    return NextResponse.json(
      { success: false, error: "Appointment time is required." },
      { status: 400 }
    );
  }

  try {
    // Fetch existing booking
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

    if (!["pending", "confirmed", "cancelled"].includes(existing.status)) {
      return NextResponse.json(
        { success: false, error: "Only pending, confirmed, or cancelled bookings can be rescheduled." },
        { status: 400 }
      );
    }

    const isCancelled = existing.status === "cancelled";

    // Check new slot exists, is not booked, and is not blocked
    const { data: newSlot, error: slotError } = await supabaseAdmin
      .from("available_slots")
      .select("id, is_booked, is_blocked, slot_date_bs")
      .eq("slot_date_ad", appointment_date_ad)
      .eq("slot_time", appointment_time)
      .single();

    if (slotError || !newSlot) {
      return NextResponse.json(
        { success: false, error: "The selected time slot does not exist for this date." },
        { status: 404 }
      );
    }

    if (newSlot.is_blocked) {
      return NextResponse.json(
        { success: false, error: "The selected time slot is blocked and unavailable." },
        { status: 409 }
      );
    }

    if (newSlot.is_booked) {
      // Allow if rescheduling to the same slot
      const sameSlot =
        existing.appointment_date_ad === appointment_date_ad &&
        existing.appointment_time === appointment_time;
      if (!sameSlot) {
        return NextResponse.json(
          { success: false, error: "The selected time slot is already booked." },
          { status: 409 }
        );
      }
    }

    // Free the old slot (skip for cancelled — slot was already freed on cancel)
    if (!isCancelled) {
      await supabaseAdmin
        .from("available_slots")
        .update({ is_booked: false })
        .eq("slot_date_ad", existing.appointment_date_ad)
        .eq("slot_time", existing.appointment_time);
    }

    // Book the new slot
    const { error: bookError } = await supabaseAdmin
      .from("available_slots")
      .update({ is_booked: true })
      .eq("id", newSlot.id);

    if (bookError) {
      // Rollback: re-book old slot only if we freed it
      if (!isCancelled) {
        await supabaseAdmin
          .from("available_slots")
          .update({ is_booked: true })
          .eq("slot_date_ad", existing.appointment_date_ad)
          .eq("slot_time", existing.appointment_time);
      }
      return NextResponse.json(
        { success: false, error: "Failed to reserve the new time slot." },
        { status: 500 }
      );
    }

    // Update booking (cancelled → pending + new date/time)
    const dateBs = appointment_date_bs?.trim() || newSlot.slot_date_bs || "";
    const bookingUpdate: Record<string, string> = {
      appointment_date_ad,
      appointment_date_bs: dateBs,
      appointment_time,
    };
    if (isCancelled) bookingUpdate.status = "pending";

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update(bookingUpdate)
      .eq("id", id)
      .select(
        "id, patient_name, patient_phone, patient_email, problem, appointment_date_bs, appointment_date_ad, appointment_time, booking_type, specialist_id, status, created_at"
      )
      .single();

    if (updateError || !updated) {
      // Rollback: free new slot, re-book old slot if we freed it
      await supabaseAdmin
        .from("available_slots")
        .update({ is_booked: false })
        .eq("id", newSlot.id);
      if (!isCancelled) {
        await supabaseAdmin
          .from("available_slots")
          .update({ is_booked: true })
          .eq("slot_date_ad", existing.appointment_date_ad)
          .eq("slot_time", existing.appointment_time);
      }
      return NextResponse.json(
        { success: false, error: "Failed to update booking." },
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
