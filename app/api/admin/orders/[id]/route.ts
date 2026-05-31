import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  GET /api/admin/orders/[id]                                         */
/*  Fetch single order with its items                                  */
/* ------------------------------------------------------------------ */

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID required." }, { status: 400 });
    }

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    const { data: items, error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: true });

    if (itemsErr) {
      console.error("[admin orders/id GET]", itemsErr.message);
      return NextResponse.json({ success: false, error: "Failed to fetch order items." }, { status: 500 });
    }

    // Returning customer count by phone
    let returningCount = 0;
    if (order.customer_phone) {
      const { count } = await supabaseAdmin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("customer_phone", order.customer_phone);
      returningCount = (count ?? 1) - 1; // exclude current order
    }

    return NextResponse.json({
      success: true,
      order,
      items: items ?? [],
      returning_customer_orders: returningCount,
    });
  } catch {
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}
