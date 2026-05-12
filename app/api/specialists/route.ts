import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/**
 * GET /api/specialists
 *
 * Returns active visiting specialists with upcoming or recent visit dates.
 * Public endpoint — only returns is_active = true specialists.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("visiting_specialists")
      .select(
        "id, specialist_name, specialization, treatment_type, visit_date_bs, visit_date_ad, available_from, available_to, consultation_fee"
      )
      .eq("is_active", true)
      .order("visit_date_ad", { ascending: true });

    if (error) {
      console.error("[specialists GET]", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch specialists.", detail: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, specialists: data ?? [] });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
