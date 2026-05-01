import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("available_slots")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        { success: false, error: "Supabase query failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      rowsFound: data.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to connect to Supabase" },
      { status: 500 }
    );
  }
}