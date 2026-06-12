import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "@/lib/adminAuth";

const ALLOWED_STATUSES = ["pending", "confirmed", "cancelled", "completed"];
const BOOKINGS_ROLES = ["owner", "doctor", "receptionist"] as const;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAdmin(request, { allowedRoles: [...BOOKINGS_ROLES] });
  if (auth instanceof NextResponse) return auth;

  const { id } = params;

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { success: false, error: "Booking ID is required." },
      { status: 400 }
    );
  }

  let body: { status?: string; cancellation_reason?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { status, cancellation_reason } = body;

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
      .select("id, status, appointment_date_ad, appointment_time, booking_type, specialist_id, booking_source")
      .eq("id", id)
      .single();

    if (findError || !existing) {
      return NextResponse.json(
        { success: false, error: "Booking not found." },
        { status: 404 }
      );
    }

    const prevStatus = existing.status;
    const isSpecialist = existing.booking_type === "specialist" && existing.specialist_id;
    const isWalkIn = existing.booking_source === "walk_in";

    // ---- Slot management: cancelling releases the slot (regular bookings only) ----
    if (status === "cancelled" && prevStatus !== "cancelled" && !isSpecialist) {
      await supabaseAdmin
        .from("available_slots")
        .update({ is_booked: false })
        .eq("slot_date_ad", existing.appointment_date_ad)
        .eq("slot_time", existing.appointment_time);
    }

    // ---- Determine restore target status ----
    // Walk-in specialist bookings restore directly to confirmed (no slot blocking)
    // Online specialist bookings restore to pending after slot check
    const restoreTargetStatus = (isSpecialist && isWalkIn) ? "confirmed" : "pending";
    const effectiveNewStatus = (prevStatus === "cancelled" && status === "pending") ? restoreTargetStatus : status;

    // ---- Slot management: restoring from cancelled ----
    if (prevStatus === "cancelled" && status === "pending") {
      if (isSpecialist && isWalkIn) {
        // Walk-in specialist bookings skip slot conflict check — restore directly to confirmed
      } else if (isSpecialist) {
        // For online specialist bookings: check if another booking occupies that slot
        const normalizedTime = existing.appointment_time.slice(0, 5);
        const { data: conflictingBookings } = await supabaseAdmin
          .from("bookings")
          .select("id, appointment_time")
          .eq("specialist_id", existing.specialist_id)
          .eq("appointment_date_ad", existing.appointment_date_ad)
          .neq("status", "cancelled")
          .neq("id", id);

        const conflictFound = (conflictingBookings ?? []).some(
          (b2) => b2.appointment_time.slice(0, 5) === normalizedTime
        );

        if (conflictFound) {
          return NextResponse.json(
            { success: false, error: "This specialist time slot has already been booked by another patient. Please reschedule instead." },
            { status: 409 }
          );
        }
      } else {
        // Regular bookings: check available_slots
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
    }

    // ---- Update booking status ----
    const updatePayload: Record<string, string | null> = { status: effectiveNewStatus };
    if (effectiveNewStatus === "cancelled") {
      updatePayload.cancellation_reason = cancellation_reason?.trim() || null;
      updatePayload.cancelled_at = new Date().toISOString();
    }
    // Clear cancellation fields when restoring from cancelled
    if (prevStatus === "cancelled" && status !== "cancelled") {
      updatePayload.cancellation_reason = null;
      updatePayload.cancelled_at = null;
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update(updatePayload)
      .eq("id", id)
      .select(
        "id, patient_name, patient_phone, patient_email, problem, appointment_date_bs, appointment_date_ad, appointment_time, booking_type, specialist_id, status, cancellation_reason, cancelled_at, created_at"
      )
      .single();

    if (updateError || !updated) {
      // Rollback slot if we just re-booked it (regular bookings only)
      if (prevStatus === "cancelled" && status === "pending" && !isSpecialist) {
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
  const auth = await verifyAdmin(request, { allowedRoles: [...BOOKINGS_ROLES] });
  if (auth instanceof NextResponse) return auth;

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
      .select("id, status, appointment_date_ad, appointment_time, booking_type, specialist_id")
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
    const isSpecialist = existing.booking_type === "specialist" && existing.specialist_id;

    if (isSpecialist) {
      // ---- Specialist booking reschedule ----
      // Normalize time to HH:mm:ss for DB storage
      const normalizedNewTime = appointment_time.length === 5 ? `${appointment_time}:00` : appointment_time;
      const normalizedNewTimeShort = appointment_time.slice(0, 5);

      // Check that the new time doesn't conflict with another specialist booking
      const sameSlot =
        existing.appointment_date_ad === appointment_date_ad &&
        existing.appointment_time.slice(0, 5) === normalizedNewTimeShort;

      if (!sameSlot) {
        const { data: conflicting } = await supabaseAdmin
          .from("bookings")
          .select("id, appointment_time")
          .eq("specialist_id", existing.specialist_id)
          .eq("appointment_date_ad", appointment_date_ad)
          .neq("status", "cancelled")
          .neq("id", id);

        const hasConflict = (conflicting ?? []).some(
          (b) => b.appointment_time.slice(0, 5) === normalizedNewTimeShort
        );

        if (hasConflict) {
          return NextResponse.json(
            { success: false, error: "This specialist time slot is already booked." },
            { status: 409 }
          );
        }
      }

      // Update booking
      const bookingUpdate: Record<string, string | null> = {
        appointment_date_ad,
        appointment_date_bs: appointment_date_bs?.trim() || "",
        appointment_time: normalizedNewTime,
      };
      if (isCancelled) {
        bookingUpdate.status = "pending";
        bookingUpdate.cancellation_reason = null;
        bookingUpdate.cancelled_at = null;
      }

      const { data: updated, error: updateError } = await supabaseAdmin
        .from("bookings")
        .update(bookingUpdate)
        .eq("id", id)
        .select(
          "id, patient_name, patient_phone, patient_email, problem, appointment_date_bs, appointment_date_ad, appointment_time, booking_type, specialist_id, status, created_at"
        )
        .single();

      if (updateError || !updated) {
        return NextResponse.json(
          { success: false, error: "Failed to update booking." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, booking: updated });
    }

    // ---- Regular booking reschedule ----
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
    const bookingUpdate: Record<string, string | null> = {
      appointment_date_ad,
      appointment_date_bs: dateBs,
      appointment_time,
    };
    if (isCancelled) {
      bookingUpdate.status = "pending";
      bookingUpdate.cancellation_reason = null;
      bookingUpdate.cancelled_at = null;
    }

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
