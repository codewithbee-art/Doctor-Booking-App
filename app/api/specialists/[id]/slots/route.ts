import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/**
 * GET /api/specialists/[id]/slots
 *
 * Returns available time slots for a specialist visit.
 * Slots are generated from available_from, available_to, and slot_duration_minutes.
 * Already-booked slots (non-cancelled bookings) are marked as unavailable.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch specialist
    const { data: specialist, error: specError } = await supabaseAdmin
      .from("visiting_specialists")
      .select("id, specialist_name, specialization, treatment_type, visit_date_bs, visit_date_ad, available_from, available_to, consultation_fee, visit_location, consultation_mode, preparation_note, profile_image_url, is_active, slot_duration_minutes, max_patients")
      .eq("id", id)
      .single();

    if (specError || !specialist) {
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

    // Check if visit date is in the past
    const today = new Date().toISOString().slice(0, 10);
    if (specialist.visit_date_ad < today) {
      return NextResponse.json(
        { success: false, error: "This specialist visit date has passed." },
        { status: 400 }
      );
    }

    // Generate time slots
    const duration = specialist.slot_duration_minutes || 30;
    const slots = generateSlots(specialist.available_from, specialist.available_to, duration);

    // Get existing non-cancelled bookings for this specialist on the visit date
    const { data: bookings } = await supabaseAdmin
      .from("bookings")
      .select("appointment_time")
      .eq("specialist_id", id)
      .eq("appointment_date_ad", specialist.visit_date_ad)
      .neq("status", "cancelled");

    const bookedTimes = new Set((bookings ?? []).map((b) => normalizeTime(b.appointment_time)));
    const totalBooked = bookedTimes.size;

    // Check max_patients capacity
    const maxReached = specialist.max_patients != null && totalBooked >= specialist.max_patients;

    const slotsWithAvailability = slots.map((time) => ({
      time,
      available: !bookedTimes.has(time) && !maxReached,
    }));

    return NextResponse.json({
      success: true,
      specialist: {
        id: specialist.id,
        specialist_name: specialist.specialist_name,
        specialization: specialist.specialization,
        treatment_type: specialist.treatment_type,
        visit_date_bs: specialist.visit_date_bs,
        visit_date_ad: specialist.visit_date_ad,
        available_from: specialist.available_from,
        available_to: specialist.available_to,
        consultation_fee: specialist.consultation_fee,
        visit_location: specialist.visit_location,
        consultation_mode: specialist.consultation_mode,
        preparation_note: specialist.preparation_note,
        profile_image_url: specialist.profile_image_url,
        slot_duration_minutes: duration,
        max_patients: specialist.max_patients,
      },
      slots: slotsWithAvailability,
      total_booked: totalBooked,
      max_reached: maxReached,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * Generate time slot strings from start to end with given duration in minutes.
 * e.g. generateSlots("09:00:00", "12:00:00", 30) => ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]
 */
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
