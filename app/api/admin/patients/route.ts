import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizePhone } from "@/lib/normalizePhone";

/**
 * GET /api/admin/patients
 *
 * Query params:
 *   ?search=<term>       — searches name, phone, email (case-insensitive, partial)
 *   ?id=<uuid>           — fetch single patient with bookings + visits
 *   ?duplicates=<uuid>   — find potential duplicates for a patient
 *
 * Returns:
 *   { success: true, patients: [...] }           (list mode)
 *   { success: true, patient: {...}, bookings: [...], visits: [...] }  (detail mode)
 *   { success: true, duplicates: [...] }          (duplicates mode)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  const duplicatesFor = searchParams.get("duplicates");
  const search = searchParams.get("search")?.trim() || "";

  try {
    // ---- Duplicates mode ----
    if (duplicatesFor) {
      const { data: source, error: srcErr } = await supabaseAdmin
        .from("patients")
        .select("id, phone, email, name, date_of_birth")
        .eq("id", duplicatesFor)
        .single();

      if (srcErr || !source) {
        return NextResponse.json(
          { success: false, error: "Patient not found." },
          { status: 404 }
        );
      }

      const { data: allPatients } = await supabaseAdmin
        .from("patients")
        .select("*")
        .neq("id", source.id)
        .limit(500);

      const srcNorm = normalizePhone(source.phone);
      const srcNameLower = source.name.toLowerCase();
      const srcNameParts = srcNameLower.split(/\s+/);

      const duplicates = (allPatients ?? []).filter((p) => {
        // Exact phone match
        if (p.phone === source.phone) return true;
        // Normalized phone match
        if (normalizePhone(p.phone) === srcNorm) return true;
        // Email match
        if (source.email && p.email && source.email.toLowerCase() === p.email.toLowerCase()) return true;
        // Similar name: share at least one name part AND (same dob OR same phone prefix)
        const pNameParts = p.name.toLowerCase().split(/\s+/);
        const sharedParts = srcNameParts.filter((part: string) => part.length >= 2 && pNameParts.includes(part));
        if (sharedParts.length > 0) {
          // Same DOB
          if (source.date_of_birth && p.date_of_birth && source.date_of_birth === p.date_of_birth) return true;
          // Exact full name match (case-insensitive)
          if (p.name.toLowerCase() === srcNameLower) return true;
        }
        return false;
      });

      return NextResponse.json({ success: true, duplicates });
    }

    // ---- Detail mode: single patient + related data ----
    if (id) {
      const { data: patient, error: patientError } = await supabaseAdmin
        .from("patients")
        .select("*")
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
          "id, booking_id, visit_date_ad, visit_date_bs, chief_complaint, visit_notes, prescribed_medicines, follow_up_instructions, condition_summary, created_at, updated_at"
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

/**
 * PATCH /api/admin/patients
 *
 * Update patient info. Body:
 *   id                (required)
 *   name              (optional)
 *   phone             (optional)
 *   email             (optional, send null to clear)
 *   date_of_birth     (optional, send null to clear)
 *   identity_notes    (optional, send null to clear)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Patient id is required." },
        { status: 400 }
      );
    }

    // Verify patient exists
    const { data: existing, error: findErr } = await supabaseAdmin
      .from("patients")
      .select("id, phone, email")
      .eq("id", id)
      .single();

    if (findErr || !existing) {
      return NextResponse.json(
        { success: false, error: "Patient not found." },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {};

    // Name
    if ("name" in body && body.name && typeof body.name === "string" && body.name.trim().length >= 2) {
      updates.name = body.name.trim();
    }

    // Phone — no longer unique, just validate non-empty
    if ("phone" in body && body.phone && typeof body.phone === "string") {
      const newPhone = body.phone.trim();
      if (newPhone && newPhone !== existing.phone) {
        updates.phone = newPhone;
      }
    }

    // Email — no longer unique, just update
    if ("email" in body) {
      const newEmail = body.email && typeof body.email === "string" ? body.email.trim() : null;
      if (newEmail !== (existing.email || null)) {
        updates.email = newEmail;
      }
    }

    // Date of birth
    if ("date_of_birth" in body) {
      updates.date_of_birth = body.date_of_birth || null;
    }

    // General notes
    if ("notes" in body) {
      updates.notes = body.notes || null;
    }

    // Identity notes
    if ("identity_notes" in body) {
      updates.identity_notes = body.identity_notes || null;
    }

    // Identity status
    if ("identity_status" in body) {
      const validStatuses = ["normal", "possible_duplicate", "shared_contact", "needs_review"];
      if (validStatuses.includes(body.identity_status)) {
        updates.identity_status = body.identity_status;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update." },
        { status: 400 }
      );
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("patients")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (updateErr) {
      return NextResponse.json(
        { success: false, error: "Failed to update patient." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, patient: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
