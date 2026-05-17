import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
      .select("id, specialist_name, specialization, treatment_type, visit_date_ad, visit_date_bs, available_from, available_to, visit_location, consultation_fee, is_active, slot_duration_minutes, max_patients")
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
      .select("id, patient_id, patient_name, patient_phone, patient_email, problem, appointment_date_bs, appointment_date_ad, appointment_time, booking_type, specialist_id, status, cancellation_reason, cancelled_at, created_at")
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
