import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * GET /api/admin/patients
 *
 * Query params:
 *   ?search=<term>  — searches name, phone, email (case-insensitive, partial)
 *   ?id=<uuid>      — fetch single patient with bookings + visits
 *
 * Returns:
 *   { success: true, patients: [...] }           (list mode)
 *   { success: true, patient: {...}, bookings: [...], visits: [...] }  (detail mode)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  const search = searchParams.get("search")?.trim() || "";

  try {
    // ---- Detail mode: single patient + related data ----
    if (id) {
      const { data: patient, error: patientError } = await supabaseAdmin
        .from("patients")
        .select("id, phone, email, name, date_of_birth, notes, created_at, updated_at")
        .eq("id", id)
        .single();

      if (patientError || !patient) {
        return NextResponse.json(
          { success: false, error: "Patient not found." },
          { status: 404 }
        );
      }

      // Fetch linked bookings
      const { data: bookings } = await supabaseAdmin
        .from("bookings")
        .select(
          "id, patient_name, patient_phone, patient_email, problem, appointment_date_bs, appointment_date_ad, appointment_time, booking_type, status, created_at"
        )
        .eq("patient_id", id)
        .order("appointment_date_ad", { ascending: false })
        .order("appointment_time", { ascending: false });

      // Fetch visits
      const { data: visits } = await supabaseAdmin
        .from("patient_visits")
        .select(
          "id, visit_date_ad, visit_date_bs, chief_complaint, visit_notes, prescribed_medicines, follow_up_instructions, condition_summary, created_at"
        )
        .eq("patient_id", id)
        .order("visit_date_ad", { ascending: false });

      return NextResponse.json({
        success: true,
        patient,
        bookings: bookings ?? [],
        visits: visits ?? [],
      });
    }

    // ---- List mode: all patients (optionally filtered by search) ----
    let query = supabaseAdmin
      .from("patients")
      .select("id, phone, email, name, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch patients." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, patients: data ?? [] });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
