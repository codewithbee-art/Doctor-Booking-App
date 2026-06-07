import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizePhone } from "@/lib/normalizePhone";
import { generateBookingReference, getPaymentMethodsSnapshot } from "@/lib/paymentUtils";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface BookingRequestBody {
  patient_name?: string;
  patient_phone?: string;
  patient_email?: string;
  problem?: string;
  appointment_date_ad?: string;
  appointment_date_bs?: string;
  appointment_time?: string;
  booking_type?: string;
  consultation_mode?: string;
  privacy_preference?: string;
  payment_preference?: string;
  counselling_reason?: string;
}

const VALID_CONSULTATION_MODES = ["phone", "video", "in_person"];
const VALID_PRIVACY_PREFERENCES = ["private", "normal"];
const VALID_PAYMENT_PREFERENCES = ["pay_now", "pay_later", "pay_on_visit"];

export async function GET() {
  try {
    const { data: bookings, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, patient_id, patient_name, patient_phone, patient_email, problem, appointment_date_bs, appointment_date_ad, appointment_time, booking_type, specialist_id, status, cancellation_reason, cancelled_at, created_at, booking_source, consultation_mode, privacy_preference, payment_preference, payment_status, counselling_reason"
      )
      .order("appointment_date_ad", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch bookings." },
        { status: 500 }
      );
    }

    // Enrich bookings with visit_count, is_new_patient, has_visit
    const patientIds = Array.from(new Set((bookings ?? []).map((b) => b.patient_id).filter(Boolean))) as string[];
    const bookingIds = (bookings ?? []).map((b) => b.id);
    let visitCountMap: Record<string, number> = {};
    const bookingVisitSet: Set<string> = new Set();
    if (patientIds.length > 0) {
      const { data: visits } = await supabaseAdmin
        .from("patient_visits")
        .select("patient_id, booking_id")
        .in("patient_id", patientIds);
      if (visits) {
        for (const v of visits) {
          visitCountMap[v.patient_id] = (visitCountMap[v.patient_id] || 0) + 1;
          if (v.booking_id) bookingVisitSet.add(v.booking_id);
        }
      }
    }
    // Also check visits for bookings without patient_id (edge case)
    if (bookingIds.length > 0 && bookingVisitSet.size === 0) {
      const { data: bVisits } = await supabaseAdmin
        .from("patient_visits")
        .select("booking_id")
        .in("booking_id", bookingIds);
      if (bVisits) {
        for (const v of bVisits) {
          if (v.booking_id) bookingVisitSet.add(v.booking_id);
        }
      }
    }

    // Count bookings per patient to detect new vs returning
    const bookingCountMap: Record<string, number> = {};
    for (const b of bookings ?? []) {
      if (b.patient_id) {
        bookingCountMap[b.patient_id] = (bookingCountMap[b.patient_id] || 0) + 1;
      }
    }

    // Fetch specialist names for specialist bookings
    const specialistIds = Array.from(new Set((bookings ?? []).filter((b) => b.specialist_id).map((b) => b.specialist_id))) as string[];
    let specialistNameMap: Record<string, { name: string; specialization?: string; treatment_type?: string; visit_location?: string; consultation_fee?: number | null }> = {};
    if (specialistIds.length > 0) {
      const { data: specialists } = await supabaseAdmin
        .from("visiting_specialists")
        .select("id, specialist_name, specialization, treatment_type, visit_location, consultation_fee")
        .in("id", specialistIds);
      if (specialists) {
        for (const sp of specialists) {
          specialistNameMap[sp.id] = { name: sp.specialist_name, specialization: sp.specialization, treatment_type: sp.treatment_type, visit_location: sp.visit_location, consultation_fee: sp.consultation_fee };
        }
      }
    }

    const enriched = (bookings ?? []).map((b) => ({
      ...b,
      visit_count: b.patient_id ? (visitCountMap[b.patient_id] || 0) : 0,
      is_new_patient: b.patient_id ? (bookingCountMap[b.patient_id] || 0) <= 1 && (visitCountMap[b.patient_id] || 0) === 0 : true,
      has_visit: bookingVisitSet.has(b.id),
      specialist_name: b.specialist_id ? (specialistNameMap[b.specialist_id]?.name || null) : null,
      specialist_info: b.specialist_id ? (specialistNameMap[b.specialist_id] || null) : null,
    }));

    return NextResponse.json({ success: true, bookings: enriched });
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
    booking_type,
    consultation_mode,
    privacy_preference,
    payment_preference,
    counselling_reason,
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

  const isCounselling = booking_type === "counselling";

  if (isCounselling) {
    if (!consultation_mode || !VALID_CONSULTATION_MODES.includes(consultation_mode)) {
      errors.push("A valid consultation mode is required for counselling bookings.");
    }
    if (privacy_preference && !VALID_PRIVACY_PREFERENCES.includes(privacy_preference)) {
      errors.push("Invalid privacy preference.");
    }
    if (payment_preference && !VALID_PAYMENT_PREFERENCES.includes(payment_preference)) {
      errors.push("Invalid payment preference.");
    }
    if (payment_preference === "pay_on_visit" && consultation_mode !== "in_person") {
      errors.push("Pay on Visit is only available for in-person consultations.");
    }
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
      console.error("[bookings POST] slot_lookup failed", slotError?.code);
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
      console.error("[bookings POST] slot_mark_booked failed", updateError?.code);
      return NextResponse.json(
        { success: false, error: "Failed to reserve the time slot. Please try again." },
        { status: 500 }
      );
    }

    // ---- Match or create patient (safe identity logic) ----

    const trimmedPhone = patient_phone!.trim();
    const normalizedPhone = normalizePhone(trimmedPhone);
    const trimmedEmail = patient_email?.trim() || null;
    const trimmedName = patient_name!.trim();
    const nameLower = trimmedName.toLowerCase();
    const nameParts = nameLower.split(/\s+/).filter((p) => p.length >= 2);

    let patientId: string | null = null;

    // Helper: check if two names are similar enough for safe linking
    const namesAreSimilar = (existingName: string): boolean => {
      const existLower = existingName.toLowerCase();
      if (existLower === nameLower) return true;
      const existParts = existLower.split(/\s+/).filter((p) => p.length >= 2);
      const shared = nameParts.filter((p) => existParts.includes(p));
      // At least half of name parts overlap
      return shared.length > 0 && shared.length >= Math.min(nameParts.length, existParts.length) * 0.5;
    };

    // Find candidates by phone (exact or normalized)
    const { data: phoneMatches } = await supabaseAdmin
      .from("patients")
      .select("id, name, phone, email")
      .eq("phone", trimmedPhone);

    let phoneCandidates = phoneMatches ?? [];

    // Also check normalized phone if no exact match
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

    // Among phone candidates, find one with a similar name
    if (phoneCandidates.length > 0) {
      const safeMatch = phoneCandidates.find((p) => namesAreSimilar(p.name));
      if (safeMatch) {
        patientId = safeMatch.id;
        // Never overwrite name, phone, email, or notes
      }
      // If phone matches but name is clearly different, do NOT link — will create a new record
    }

    // Try email as secondary match if still no match
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

    // Create new patient if no safe match found
    if (!patientId) {
      // Determine identity status: if phone exists with different name, mark as shared_contact
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

    // ---- Generate booking reference + payment snapshot ----

    const bookingType = isCounselling ? "counselling" : "regular";
    const bookingReference = generateBookingReference(bookingType as "regular" | "specialist" | "counselling");
    const paymentMethodsSnapshot = await getPaymentMethodsSnapshot();

    // ---- Insert the booking ----

    const insertData: Record<string, unknown> = {
      patient_name: trimmedName,
      patient_phone: trimmedPhone,
      patient_email: trimmedEmail,
      problem: problem!.trim(),
      appointment_date_ad: appointment_date_ad!,
      appointment_date_bs: appointment_date_bs?.trim() || "",
      appointment_time: appointment_time!,
      booking_type: bookingType,
      status: "pending",
      patient_id: patientId,
      booking_reference: bookingReference,
      payment_methods_snapshot: paymentMethodsSnapshot.length > 0 ? paymentMethodsSnapshot : null,
    };

    if (isCounselling) {
      insertData.consultation_mode = consultation_mode;
      insertData.privacy_preference = privacy_preference || "private";
      insertData.payment_preference = payment_preference || "pay_later";
      insertData.payment_status = "unpaid";
      insertData.counselling_reason = counselling_reason?.trim() || null;
    }

    const { data: booking, error: insertError } = await supabaseAdmin
      .from("bookings")
      .insert(insertData)
      .select("id")
      .single();

    if (insertError || !booking) {
      console.error("[bookings POST] booking_insert failed", insertError?.code);
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
      booking_reference: bookingReference,
    });
  } catch (err) {
    console.error("[bookings POST] unexpected exception", err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
