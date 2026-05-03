import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { success: false, error: "Missing required query parameter: date" },
      { status: 400 }
    );
  }

  if (!DATE_REGEX.test(date)) {
    return NextResponse.json(
      { success: false, error: "Invalid date format. Use YYYY-MM-DD." },
      { status: 400 }
    );
  }

  // Validate the date is a real calendar date
  const parsed = new Date(date + "T00:00:00");
  if (isNaN(parsed.getTime())) {
    return NextResponse.json(
      { success: false, error: "Invalid date value." },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("available_slots")
      .select("id, slot_date_ad, slot_date_bs, slot_time, is_booked")
      .eq("slot_date_ad", date)
      .eq("is_blocked", false)
      .order("slot_time", { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch available slots." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, slots: data });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
