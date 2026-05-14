import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/**
 * GET /api/specialists/[id]
 *
 * Returns a single active specialist by ID with all public fields.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Specialist ID is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("visiting_specialists")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Specialist not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, specialist: data });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
