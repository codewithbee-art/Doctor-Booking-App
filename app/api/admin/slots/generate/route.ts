import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { adToBS, BS_MONTHS } from "@/lib/dateConvert";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/slots/generate
 *
 * Generate appointment slots for the next N months (default 3).
 * - Slots: 9:00 AM to 5:00 PM in 30-minute increments (16 slots/day).
 * - Duplicate-safe: uses ON CONFLICT DO NOTHING.
 * - Does not overwrite booked or blocked slots.
 * - Only creates missing slots.
 */

const SLOT_START_HOUR = 9;
const SLOT_END_HOUR = 17;
const SLOT_DURATION_MINUTES = 30;

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = SLOT_START_HOUR; h < SLOT_END_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_DURATION_MINUTES) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

function formatBSString(adDateStr: string): string {
  const bs = adToBS(adDateStr);
  if (!bs) return "";
  return `${bs.day} ${BS_MONTHS[bs.month]} ${bs.year}`;
}

export async function POST(request: NextRequest) {
  let body: { months?: number };

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const months = Math.min(Math.max(body.months ?? 3, 1), 6);

  try {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + months);

    // Generate all dates from today to endDate
    const dates: string[] = [];
    const current = new Date(today);
    while (current <= endDate) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, "0");
      const d = String(current.getDate()).padStart(2, "0");
      dates.push(`${y}-${m}-${d}`);
      current.setDate(current.getDate() + 1);
    }

    const timeSlots = generateTimeSlots();

    // Build rows to insert
    const rows = dates.flatMap((dateAd) => {
      const bsStr = formatBSString(dateAd);
      return timeSlots.map((time) => ({
        slot_date_ad: dateAd,
        slot_date_bs: bsStr,
        slot_time: time,
        is_booked: false,
        is_blocked: false,
      }));
    });

    // Insert in batches of 500 using upsert with ignoreDuplicates
    let created = 0;
    const batchSize = 500;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { count, error } = await supabaseAdmin
        .from("available_slots")
        .upsert(batch, {
          onConflict: "slot_date_ad,slot_time",
          ignoreDuplicates: true,
          count: "exact",
        });

      if (error) {
        return NextResponse.json(
          { success: false, error: `Failed to generate slots: ${error.message}` },
          { status: 500 }
        );
      }

      created += count ?? 0;
    }

    const totalPossible = rows.length;
    const skipped = totalPossible - created;

    return NextResponse.json({
      success: true,
      created,
      skipped,
      total_days: dates.length,
      months,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during slot generation." },
      { status: 500 }
    );
  }
}
