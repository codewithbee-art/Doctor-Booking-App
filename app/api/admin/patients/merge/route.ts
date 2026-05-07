import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * POST /api/admin/patients/merge
 *
 * Merge source patient into target patient.
 * - Moves all bookings from source to target
 * - Moves all visits from source to target
 * - Deletes the source patient record
 *
 * Body:
 *   target_id  (required, uuid — the primary patient to keep)
 *   source_id  (required, uuid — the duplicate to merge away)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target_id, source_id } = body;

    if (!target_id || !source_id || typeof target_id !== "string" || typeof source_id !== "string") {
      return NextResponse.json(
        { success: false, error: "target_id and source_id are required." },
        { status: 400 }
      );
    }

    if (target_id === source_id) {
      return NextResponse.json(
        { success: false, error: "Cannot merge a patient into themselves." },
        { status: 400 }
      );
    }

    // Verify both patients exist
    const { data: target, error: tErr } = await supabaseAdmin
      .from("patients")
      .select("id, name, phone, email")
      .eq("id", target_id)
      .single();

    if (tErr || !target) {
      return NextResponse.json(
        { success: false, error: "Target patient not found." },
        { status: 404 }
      );
    }

    const { data: source, error: sErr } = await supabaseAdmin
      .from("patients")
      .select("id, name, phone, email")
      .eq("id", source_id)
      .single();

    if (sErr || !source) {
      return NextResponse.json(
        { success: false, error: "Source patient not found." },
        { status: 404 }
      );
    }

    // Move bookings from source to target
    const { error: bookingErr } = await supabaseAdmin
      .from("bookings")
      .update({ patient_id: target_id })
      .eq("patient_id", source_id);

    if (bookingErr) {
      return NextResponse.json(
        { success: false, error: "Failed to move bookings." },
        { status: 500 }
      );
    }

    // Move visits from source to target
    const { error: visitErr } = await supabaseAdmin
      .from("patient_visits")
      .update({ patient_id: target_id })
      .eq("patient_id", source_id);

    if (visitErr) {
      return NextResponse.json(
        { success: false, error: "Failed to move visits." },
        { status: 500 }
      );
    }

    // Delete the source patient (now has no linked records)
    const { error: deleteErr } = await supabaseAdmin
      .from("patients")
      .delete()
      .eq("id", source_id);

    if (deleteErr) {
      return NextResponse.json(
        { success: false, error: "Bookings and visits moved, but failed to delete the duplicate patient record. You may remove it manually." },
        { status: 500 }
      );
    }

    const sourceLabel = source.email ? `${source.name} (${source.phone}, ${source.email})` : `${source.name} (${source.phone})`;
    const targetLabel = target.email ? `${target.name} (${target.phone}, ${target.email})` : `${target.name} (${target.phone})`;

    return NextResponse.json({
      success: true,
      message: `Merged ${sourceLabel} into ${targetLabel}. All bookings and visits preserved.`,
      target_id,
      source_deleted: true,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
