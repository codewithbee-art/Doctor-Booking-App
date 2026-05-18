import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizePhone } from "@/lib/normalizePhone";

const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GET /api/admin/specialist-bookings
 *
 * Returns all specialist bookings grouped by specialist, with optional filters.
 * Query params:
 *   ?specialist_id=<uuid>   — filter by specialist
 *   ?date=<YYYY-MM-DD>      — filter by visit date
 *   ?range=today|upcoming|past|all — date range (default: upcoming)
 *   ?status=<string>        — filter by booking status
 *   ?search=<term>          — search patient name or phone
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const specialistIdFilter = searchParams.get("specialist_id");
    const dateFilter = searchParams.get("date");
    const rangeFilter = searchParams.get("range") || "upcoming";
    const statusFilter = searchParams.get("status");
    const searchFilter = searchParams.get("search")?.trim().toLowerCase();

    // Compute today's date in YYYY-MM-DD
    const now = new Date();
    const todayStr = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");

    // Fetch all specialists (including inactive — old bookings should remain visible)
    const { data: specialists, error: spError } = await supabaseAdmin
      .from("visiting_specialists")
      .select("id, specialist_name, specialization, treatment_type, visit_date_ad, visit_date_bs, available_from, available_to, visit_location, consultation_fee, consultation_mode, is_active, slot_duration_minutes, max_patients")
      .order("visit_date_ad", { ascending: false });

    if (spError) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch specialists." },
        { status: 500 }
      );
    }

    // Filter specialists if specialist_id or date filter is applied
    let filteredSpecialists = specialists ?? [];
    if (specialistIdFilter) {
      filteredSpecialists = filteredSpecialists.filter((s) => s.id === specialistIdFilter);
    }
    if (dateFilter) {
      filteredSpecialists = filteredSpecialists.filter((s) => s.visit_date_ad === dateFilter);
    } else if (rangeFilter !== "all") {
      // Apply range filter when no specific date is set
      if (rangeFilter === "today") {
        filteredSpecialists = filteredSpecialists.filter((s) => s.visit_date_ad === todayStr);
      } else if (rangeFilter === "upcoming") {
        filteredSpecialists = filteredSpecialists.filter((s) => s.visit_date_ad >= todayStr);
      } else if (rangeFilter === "past") {
        filteredSpecialists = filteredSpecialists.filter((s) => s.visit_date_ad < todayStr);
      }
    }

    // Get specialist IDs for querying bookings
    const specialistIds = filteredSpecialists.map((s) => s.id);

    if (specialistIds.length === 0) {
      return NextResponse.json({ success: true, groups: [] });
    }

    // Fetch all specialist bookings
    let bookingsQuery = supabaseAdmin
      .from("bookings")
      .select("id, patient_id, patient_name, patient_phone, patient_email, problem, appointment_date_bs, appointment_date_ad, appointment_time, booking_type, specialist_id, status, cancellation_reason, cancelled_at, created_at, booking_source")
      .eq("booking_type", "specialist")
      .in("specialist_id", specialistIds)
      .order("appointment_time", { ascending: true });

    if (statusFilter && ["pending", "confirmed", "cancelled", "completed"].includes(statusFilter)) {
      bookingsQuery = bookingsQuery.eq("status", statusFilter);
    }

    const { data: bookings, error: bError } = await bookingsQuery;

    if (bError) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch bookings." },
        { status: 500 }
      );
    }

    // Apply search filter on client side
    let filteredBookings = bookings ?? [];
    if (searchFilter) {
      filteredBookings = filteredBookings.filter(
        (b) =>
          b.patient_name?.toLowerCase().includes(searchFilter) ||
          b.patient_phone?.toLowerCase().includes(searchFilter)
      );
    }

    // Check linked visits for each booking
    const bookingIds = filteredBookings.map((b) => b.id);
    let visitMap: Record<string, boolean> = {};
    if (bookingIds.length > 0) {
      const { data: visits } = await supabaseAdmin
        .from("patient_visits")
        .select("booking_id")
        .in("booking_id", bookingIds);
      if (visits) {
        for (const v of visits) {
          if (v.booking_id) visitMap[v.booking_id] = true;
        }
      }
    }

    // Group bookings by specialist
    const groups = filteredSpecialists
      .map((specialist) => {
        const specialistBookings = filteredBookings.filter(
          (b) => b.specialist_id === specialist.id
        );

        const counts = {
          total: specialistBookings.length,
          pending: specialistBookings.filter((b) => b.status === "pending").length,
          confirmed: specialistBookings.filter((b) => b.status === "confirmed").length,
          completed: specialistBookings.filter((b) => b.status === "completed").length,
          cancelled: specialistBookings.filter((b) => b.status === "cancelled").length,
        };

        return {
          specialist: {
            id: specialist.id,
            name: specialist.specialist_name,
            specialization: specialist.specialization,
            treatment_type: specialist.treatment_type,
            visit_date_ad: specialist.visit_date_ad,
            visit_date_bs: specialist.visit_date_bs,
            available_from: specialist.available_from,
            available_to: specialist.available_to,
            visit_location: specialist.visit_location,
            consultation_fee: specialist.consultation_fee,
            consultation_mode: specialist.consultation_mode,
            is_active: specialist.is_active,
            slot_duration_minutes: specialist.slot_duration_minutes,
            max_patients: specialist.max_patients,
          },
          bookings: specialistBookings.map((b) => ({
            ...b,
            has_visit: !!visitMap[b.id],
          })),
          counts,
        };
      })
      .filter((g) => g.bookings.length > 0);

    return NextResponse.json({ success: true, groups });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/admin/specialist-bookings                                */
/*  Create a specialist walk-in booking                                */
/* ------------------------------------------------------------------ */

interface WalkInBody {
  specialist_id: string;
  // existing patient
  patient_id?: string;
  // new patient fields
  patient_name?: string;
  patient_phone?: string;
  patient_email?: string;
  date_of_birth?: string;
  general_notes?: string;
  identity_notes?: string;
  // booking fields
  problem?: string;
  appointment_time?: string;
  // optional visit record fields
  include_visit?: boolean;
  visit_date_ad?: string;
  chief_complaint?: string;
  visit_notes?: string;
  prescribed_medicines?: string;
  follow_up_instructions?: string;
  condition_summary?: string;
  doctor_id?: string;
  doctor_name_snapshot?: string;
  complete_booking?: boolean;
}

export async function POST(request: NextRequest) {
  let body: WalkInBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const {
    specialist_id,
    patient_id: existingPatientId,
    patient_name,
    patient_phone,
    patient_email,
    date_of_birth,
    general_notes,
    identity_notes,
    problem,
    appointment_time,
    // Optional visit fields
    include_visit,
    visit_date_ad,
    chief_complaint,
    visit_notes,
    prescribed_medicines,
    follow_up_instructions,
    condition_summary,
    doctor_id,
    doctor_name_snapshot,
    complete_booking,
  } = body;

  // ---- Validate specialist_id ----
  if (!specialist_id) {
    return NextResponse.json(
      { success: false, error: "Specialist visit is required." },
      { status: 400 }
    );
  }

  try {
    // ---- Fetch specialist visit ----
    const { data: specialist, error: specErr } = await supabaseAdmin
      .from("visiting_specialists")
      .select("id, specialist_name, visit_date_ad, visit_date_bs, available_from, available_to, is_active, slot_duration_minutes, max_patients")
      .eq("id", specialist_id)
      .single();

    if (specErr || !specialist) {
      return NextResponse.json(
        { success: false, error: "Specialist visit not found." },
        { status: 404 }
      );
    }

    // ---- Resolve patient: either use existing or create new ----
    let patientId: string | null = existingPatientId || null;
    let bookingPatientName: string;
    let bookingPatientPhone: string;
    let bookingPatientEmail: string | null = null;

    if (patientId) {
      // Fetch existing patient details for the booking snapshot
      const { data: patient } = await supabaseAdmin
        .from("patients")
        .select("id, name, phone, email")
        .eq("id", patientId)
        .single();

      if (!patient) {
        return NextResponse.json(
          { success: false, error: "Selected patient not found." },
          { status: 404 }
        );
      }
      bookingPatientName = patient.name;
      bookingPatientPhone = patient.phone;
      bookingPatientEmail = patient.email || null;
    } else {
      // ---- Validate new patient fields ----
      const errors: string[] = [];
      if (!patient_name || patient_name.trim().length < 2) {
        errors.push("Patient name is required (at least 2 characters).");
      }
      if (!patient_phone || !PHONE_REGEX.test(patient_phone.trim())) {
        errors.push("A valid phone number is required.");
      }
      if (patient_email && patient_email.trim() && !EMAIL_REGEX.test(patient_email.trim())) {
        errors.push("Please provide a valid email address or leave it empty.");
      }
      if (errors.length > 0) {
        return NextResponse.json(
          { success: false, error: errors.join(" ") },
          { status: 400 }
        );
      }

      const trimmedPhone = patient_phone!.trim();
      const normalizedPh = normalizePhone(trimmedPhone);
      const trimmedEmail = patient_email?.trim() || null;
      const trimmedName = patient_name!.trim();
      const nameLower = trimmedName.toLowerCase();
      const nameParts = nameLower.split(/\s+/).filter((p) => p.length >= 2);

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
            (p) => normalizePhone(p.phone) === normalizedPh
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

      // Create new patient if no safe match found
      if (!patientId) {
        const identityStatus = phoneCandidates.length > 0 ? "shared_contact" : "normal";
        const insertData: Record<string, string | null> = {
          phone: trimmedPhone,
          email: trimmedEmail,
          name: trimmedName,
          identity_status: identityStatus,
        };
        if (date_of_birth?.trim()) insertData.date_of_birth = date_of_birth.trim();
        if (general_notes?.trim()) insertData.general_notes = general_notes.trim();
        if (identity_notes?.trim()) insertData.identity_notes = identity_notes.trim();

        const { data: newPatient } = await supabaseAdmin
          .from("patients")
          .insert(insertData)
          .select("id")
          .single();

        if (newPatient) {
          patientId = newPatient.id;
        }
      }

      bookingPatientName = trimmedName;
      bookingPatientPhone = trimmedPhone;
      bookingPatientEmail = trimmedEmail;
    }

    // ---- Guard: patient_id must be resolved ----
    if (!patientId) {
      return NextResponse.json(
        { success: false, error: "Could not resolve or create patient record. Please check patient details and try again." },
        { status: 400 }
      );
    }

    // ---- Determine walk-in time ----
    let walkInTime: string;
    if (appointment_time && appointment_time.trim()) {
      walkInTime = appointment_time.trim();
    } else {
      // Use current time as default
      const now = new Date();
      walkInTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    }
    // Normalize to HH:mm:ss
    if (walkInTime.length === 5) walkInTime = `${walkInTime}:00`;

    // ---- Insert booking ----
    const { data: booking, error: insertError } = await supabaseAdmin
      .from("bookings")
      .insert({
        patient_name: bookingPatientName,
        patient_phone: bookingPatientPhone,
        patient_email: bookingPatientEmail,
        problem: problem?.trim() || null,
        appointment_date_ad: specialist.visit_date_ad,
        appointment_date_bs: specialist.visit_date_bs || "",
        appointment_time: walkInTime,
        booking_type: "specialist",
        specialist_id: specialist_id,
        status: "confirmed",
        patient_id: patientId,
        booking_source: "walk_in",
      })
      .select("id")
      .single();

    if (insertError || !booking) {
      console.error("[specialist-walk-in]", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to create walk-in booking. Please try again." },
        { status: 500 }
      );
    }

    // ---- Optionally create visit record ----
    let visitCreated = false;
    if (include_visit && patientId && visit_date_ad) {
      const { error: visitErr } = await supabaseAdmin
        .from("patient_visits")
        .insert({
          patient_id: patientId,
          booking_id: booking.id,
          visit_date_ad,
          visit_date_bs: "",
          chief_complaint: chief_complaint || problem?.trim() || null,
          visit_notes: visit_notes || null,
          prescribed_medicines: prescribed_medicines || null,
          follow_up_instructions: follow_up_instructions || null,
          condition_summary: condition_summary || null,
          doctor_id: doctor_id || null,
          doctor_name_snapshot: doctor_name_snapshot || null,
        });

      if (!visitErr) {
        visitCreated = true;
      } else {
        console.error("[specialist-walk-in] visit insert error", visitErr);
      }

      // Optionally mark booking completed
      if (visitCreated && complete_booking) {
        await supabaseAdmin
          .from("bookings")
          .update({ status: "completed" })
          .eq("id", booking.id);
      }
    }

    return NextResponse.json({
      success: true,
      booking_id: booking.id,
      patient_id: patientId,
      specialist_name: specialist.specialist_name,
      visit_created: visitCreated,
    });
  } catch (err) {
    console.error("[specialist-walk-in] unexpected", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
