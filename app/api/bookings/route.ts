import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_REGEX = /^[0-9+\-\s]{7,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface BookingRequestBody {
  patient_name?: string;
  patient_phone?: string;
  patient_email?: string;
  problem?: string;
  appointment_date_ad?: string;
  appointment_date_bs?: string;
  appointment_time?: string;
}

export async function GET() {
  try {
    const { data: bookings, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, patient_name, patient_phone, patient_email, problem, appointment_date_bs, appointment_date_ad, appointment_time, booking_type, specialist_id, status, created_at"
      )
      .order("appointment_date_ad", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch bookings." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, bookings: bookings ?? [] });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: BookingRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const {
    patient_name,
    patient_phone,
    patient_email,
    problem,
    appointment_date_ad,
    appointment_date_bs,
    appointment_time,
  } = body;

  // ---- Validate required fields ----

  const errors: string[] = [];

  if (!patient_name || patient_name.trim().length < 2) {
    errors.push("Full name is required (at least 2 characters).");
  }

  if (!patient_phone || !PHONE_REGEX.test(patient_phone.trim())) {
    errors.push("A valid phone number is required.");
  }

  if (patient_email && patient_email.trim() && !EMAIL_REGEX.test(patient_email.trim())) {
    errors.push("Please provide a valid email address or leave it empty.");
  }

  if (!problem || problem.trim().length < 5) {
    errors.push("Reason for visit is required (at least 5 characters).");
  }

  if (!appointment_date_ad || !DATE_REGEX.test(appointment_date_ad)) {
    errors.push("A valid appointment date (YYYY-MM-DD) is required.");
  }

  if (!appointment_time || !appointment_time.trim()) {
    errors.push("Appointment time is required.");
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { success: false, error: "Validation failed.", details: errors },
      { status: 400 }
    );
  }

  try {
    // ---- Check that the slot exists and is not booked ----

    const { data: slot, error: slotError } = await supabaseAdmin
      .from("available_slots")
      .select("id, is_booked")
      .eq("slot_date_ad", appointment_date_ad!)
      .eq("slot_time", appointment_time!)
      .single();

    if (slotError || !slot) {
      return NextResponse.json(
        { success: false, error: "The selected time slot does not exist for this date." },
        { status: 404 }
      );
    }

    if (slot.is_booked) {
      return NextResponse.json(
        { success: false, error: "This time slot has already been booked. Please choose a different time." },
        { status: 409 }
      );
    }

    // ---- Mark the slot as booked ----

    const { error: updateError } = await supabaseAdmin
      .from("available_slots")
      .update({ is_booked: true })
      .eq("id", slot.id)
      .eq("is_booked", false); // extra guard against race conditions

    if (updateError) {
      return NextResponse.json(
        { success: false, error: "Failed to reserve the time slot. Please try again." },
        { status: 500 }
      );
    }

    // ---- Insert the booking ----

    const { data: booking, error: insertError } = await supabaseAdmin
      .from("bookings")
      .insert({
        patient_name: patient_name!.trim(),
        patient_phone: patient_phone!.trim(),
        patient_email: patient_email?.trim() || null,
        problem: problem!.trim(),
        appointment_date_ad: appointment_date_ad!,
        appointment_date_bs: appointment_date_bs?.trim() || "",
        appointment_time: appointment_time!,
        booking_type: "regular",
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !booking) {
      // Rollback: un-book the slot if booking insert fails
      await supabaseAdmin
        .from("available_slots")
        .update({ is_booked: false })
        .eq("id", slot.id);

      return NextResponse.json(
        { success: false, error: "Failed to create booking. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking_id: booking.id,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
