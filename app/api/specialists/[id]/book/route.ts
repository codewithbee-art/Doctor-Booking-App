import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizePhone } from "@/lib/normalizePhone";

export const dynamic = "force-dynamic";

const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SpecialistBookingBody {
  patient_name?: string;
  patient_phone?: string;
  patient_email?: string;
  problem?: string;
  appointment_time?: string;
}

/**
 * POST /api/specialists/[id]/book
 *
 * Creates a specialist booking. Does NOT use the regular available_slots table.
 * Validates slot availability against existing non-cancelled bookings.
 * Reuses patient creation/linking logic from the regular booking API.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: SpecialistBookingBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { patient_name, patient_phone, patient_email, problem, appointment_time } = body;

  // ---- Validation ----
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
  if (!problem || problem.trim().length < 3) {
    errors.push("Reason for visit is required (at least 3 characters).");
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
    const specialistId = params.id;

    // ---- Fetch specialist ----
    const { data: specialist, error: specErr } = await supabaseAdmin
      .from("visiting_specialists")
      .select("id, specialist_name, visit_date_ad, visit_date_bs, available_from, available_to, is_active, slot_duration_minutes, max_patients")
      .eq("id", specialistId)
      .single();

    if (specErr || !specialist) {
      return NextResponse.json(
        { success: false, error: "Specialist not found." },
        { status: 404 }
      );
    }

    if (!specialist.is_active) {
      return NextResponse.json(
        { success: false, error: "This specialist is not currently accepting bookings." },
        { status: 400 }
      );
    }

    // ---- Check visit date not in the past ----
    const today = new Date().toISOString().slice(0, 10);
    if (specialist.visit_date_ad < today) {
      return NextResponse.json(
        { success: false, error: "This specialist visit date has passed." },
        { status: 400 }
      );
    }

    // ---- Validate time slot is valid ----
    const duration = specialist.slot_duration_minutes || 30;
    const validSlots = generateSlots(specialist.available_from, specialist.available_to, duration);
    const selectedTime = appointment_time!.trim();

    if (!validSlots.includes(selectedTime)) {
      return NextResponse.json(
        { success: false, error: "Invalid time slot selected." },
        { status: 400 }
      );
    }

    // ---- Check slot not already booked ----
    const { data: existingBookings } = await supabaseAdmin
      .from("bookings")
      .select("id, appointment_time")
      .eq("specialist_id", specialistId)
      .eq("appointment_date_ad", specialist.visit_date_ad)
      .neq("status", "cancelled");

    const bookedTimes = new Set((existingBookings ?? []).map((b) => normalizeTime(b.appointment_time)));

    if (bookedTimes.has(selectedTime)) {
      return NextResponse.json(
        { success: false, error: "This specialist time slot has already been booked." },
        { status: 409 }
      );
    }

    // ---- Check max_patients ----
    if (specialist.max_patients != null && (existingBookings ?? []).length >= specialist.max_patients) {
      return NextResponse.json(
        { success: false, error: "This specialist has reached the maximum number of patients for this visit." },
        { status: 409 }
      );
    }

    // ---- Patient matching/creation (same logic as regular booking) ----
    const trimmedPhone = patient_phone!.trim();
    const normalizedPhone = normalizePhone(trimmedPhone);
    const trimmedEmail = patient_email?.trim() || null;
    const trimmedName = patient_name!.trim();
    const nameLower = trimmedName.toLowerCase();
    const nameParts = nameLower.split(/\s+/).filter((p) => p.length >= 2);

    let patientId: string | null = null;

    const namesAreSimilar = (existingName: string): boolean => {
      const existLower = existingName.toLowerCase();
      if (existLower === nameLower) return true;
      const existParts = existLower.split(/\s+/).filter((p) => p.length >= 2);
      const shared = nameParts.filter((p) => existParts.includes(p));
      return shared.length > 0 && shared.length >= Math.min(nameParts.length, existParts.length) * 0.5;
    };

    // Find by phone
    const { data: phoneMatches } = await supabaseAdmin
      .from("patients")
      .select("id, name, phone, email")
      .eq("phone", trimmedPhone);

    let phoneCandidates = phoneMatches ?? [];

    if (phoneCandidates.length === 0) {
      const { data: allPatients } = await supabaseAdmin
        .from("patients")
        .select("id, name, phone, email")
        .limit(500);

      if (allPatients) {
        phoneCandidates = allPatients.filter(
          (p) => normalizePhone(p.phone) === normalizedPhone
        );
      }
    }

    if (phoneCandidates.length > 0) {
      const safeMatch = phoneCandidates.find((p) => namesAreSimilar(p.name));
      if (safeMatch) {
        patientId = safeMatch.id;
      }
    }

    // Try email
    if (!patientId && trimmedEmail) {
      const { data: emailMatches } = await supabaseAdmin
        .from("patients")
        .select("id, name")
        .eq("email", trimmedEmail);

      if (emailMatches && emailMatches.length > 0) {
        const emailSafeMatch = emailMatches.find((p) => namesAreSimilar(p.name));
        if (emailSafeMatch) {
          patientId = emailSafeMatch.id;
        }
      }
    }

    // Create new patient if no match
    if (!patientId) {
      const identityStatus = phoneCandidates.length > 0 ? "shared_contact" : "normal";
      const { data: newPatient } = await supabaseAdmin
        .from("patients")
        .insert({
          phone: trimmedPhone,
          email: trimmedEmail,
          name: trimmedName,
          identity_status: identityStatus,
        })
        .select("id")
        .single();

      if (newPatient) {
        patientId = newPatient.id;
      }
    }

    // ---- Insert booking ----
    const { data: booking, error: insertError } = await supabaseAdmin
      .from("bookings")
      .insert({
        patient_name: trimmedName,
        patient_phone: trimmedPhone,
        patient_email: trimmedEmail,
        problem: problem!.trim(),
        appointment_date_ad: specialist.visit_date_ad,
        appointment_date_bs: specialist.visit_date_bs || "",
        appointment_time: selectedTime.length === 5 ? `${selectedTime}:00` : selectedTime,
        booking_type: "specialist",
        specialist_id: specialistId,
        status: "pending",
        patient_id: patientId,
      })
      .select("id")
      .single();

    if (insertError || !booking) {
      console.error("[specialist/book]", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to create booking. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking_id: booking.id,
      specialist_name: specialist.specialist_name,
    });
  } catch (err) {
    console.error("[specialist/book] unexpected", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

/** Normalize time to HH:mm (strip seconds if present) */
function normalizeTime(t: string): string {
  return t.slice(0, 5);
}

function generateSlots(from: string, to: string, durationMinutes: number): string[] {
  const [fh, fm] = from.split(":").map(Number);
  const [th, tm] = to.split(":").map(Number);
  const startMin = fh * 60 + fm;
  const endMin = th * 60 + tm;

  const slots: string[] = [];
  for (let m = startMin; m + durationMinutes <= endMin; m += durationMinutes) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }
  return slots;
}
