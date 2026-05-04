import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/* ------------------------------------------------------------------ */
/*  GET /api/admin/slots?date=YYYY-MM-DD                               */
/*  Returns ALL slots for a date (including blocked) for admin view    */
/* ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (!date || !DATE_REGEX.test(date)) {
    return NextResponse.json(
      { success: false, error: "Missing or invalid date. Use YYYY-MM-DD." },
      { status: 400 }
    );
  }

  try {
    const [{ data, error }, { data: bookings }] = await Promise.all([
      supabaseAdmin
        .from("available_slots")
        .select("id, slot_date_ad, slot_date_bs, slot_time, is_booked, is_blocked, blocked_reason")
        .eq("slot_date_ad", date)
        .order("slot_time", { ascending: true }),
      supabaseAdmin
        .from("bookings")
        .select("id, patient_name, patient_phone, status, appointment_time")
        .eq("appointment_date_ad", date)
        .neq("status", "cancelled"),
    ]);

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch slots." },
        { status: 500 }
      );
    }

    const bookingByTime = new Map(
      (bookings ?? []).map((b) => [b.appointment_time, b])
    );

    const slots = (data ?? []).map((slot) => ({
      ...slot,
      booking_summary: slot.is_booked ? (bookingByTime.get(slot.slot_time) ?? null) : null,
    }));

    return NextResponse.json({ success: true, slots });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/admin/slots                                             */
/*  Block or unblock a single slot                                     */
/*  Body: { id, is_blocked, blocked_reason? }                         */
/* ------------------------------------------------------------------ */

export async function PATCH(request: NextRequest) {
  let body: { id?: string; is_blocked?: boolean; blocked_reason?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { id, is_blocked, blocked_reason } = body;

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { success: false, error: "Slot ID is required." },
      { status: 400 }
    );
  }

  if (typeof is_blocked !== "boolean") {
    return NextResponse.json(
      { success: false, error: "is_blocked must be true or false." },
      { status: 400 }
    );
  }

  try {
    const { data: updated, error } = await supabaseAdmin
      .from("available_slots")
      .update({
        is_blocked,
        blocked_reason: is_blocked ? (blocked_reason?.trim() || null) : null,
      })
      .eq("id", id)
      .select("id, slot_date_ad, slot_time, is_booked, is_blocked, blocked_reason")
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { success: false, error: "Failed to update slot." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, slot: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/admin/slots/block-day                                    */
/*  Block all slots on a given date                                    */
/*  Body: { date, blocked_reason? }                                    */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  let body: { date?: string; blocked_reason?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { date, blocked_reason } = body;

  if (!date || !DATE_REGEX.test(date)) {
    return NextResponse.json(
      { success: false, error: "Missing or invalid date. Use YYYY-MM-DD." },
      { status: 400 }
    );
  }

  try {
    const { error, count } = await supabaseAdmin
      .from("available_slots")
      .update({
        is_blocked: true,
        blocked_reason: blocked_reason?.trim() || null,
      })
      .eq("slot_date_ad", date);

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to block day." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, updated: count ?? 0 });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
