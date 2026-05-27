import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  GET /api/products                                                   */
/*  Public: list active, non-hidden products                            */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.trim().toLowerCase();
    const featured = searchParams.get("featured");

    let query = supabaseAdmin
      .from("products")
      .select("id, name, slug, short_description, category, price, sale_price, image_url, image_alt, stock_quantity, stock_status, is_featured, requires_consultation, allow_delivery, allow_pickup")
      .eq("is_active", true)
      .neq("stock_status", "hidden")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (featured === "true") {
      query = query.eq("is_featured", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[products GET]", error.code);
      return NextResponse.json({ success: false, error: "Failed to fetch products." }, { status: 500 });
    }

    let products = data ?? [];

    if (search) {
      products = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(search) ||
          p.short_description?.toLowerCase().includes(search) ||
          p.category?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, products }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}
