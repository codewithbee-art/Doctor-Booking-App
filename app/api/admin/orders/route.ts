import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const VALID_ORDER_STATUSES = [
  "pending", "needs_review", "confirmed",
  "ready_for_pickup", "out_for_delivery", "completed", "cancelled",
];

const VALID_PAYMENT_STATUSES = ["unpaid", "pending", "paid", "failed", "refunded"];

const VALID_FULFILLMENT_METHODS = ["pickup", "delivery"];

/* ------------------------------------------------------------------ */
/*  Status transition rules                                            */
/* ------------------------------------------------------------------ */

function canTransition(from: string, to: string, fulfillment: string): boolean {
  if (from === to) return false;
  if (from === "cancelled") return false;
  if (from === "completed") return false;

  if (from === "pending" || from === "needs_review") {
    return to === "confirmed" || to === "cancelled";
  }
  if (from === "confirmed") {
    if (to === "cancelled" || to === "completed") return true;
    if (to === "ready_for_pickup" && fulfillment === "pickup") return true;
    if (to === "out_for_delivery" && fulfillment === "delivery") return true;
    return false;
  }
  if (from === "ready_for_pickup") {
    return to === "completed" || to === "cancelled";
  }
  if (from === "out_for_delivery") {
    return to === "completed" || to === "cancelled";
  }
  return false;
}

/* ------------------------------------------------------------------ */
/*  GET /api/admin/orders                                              */
/* ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request, { requiredPermission: "orders" });
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const fulfillment = searchParams.get("fulfillment");
    const paymentStatus = searchParams.get("payment_status");
    const search = searchParams.get("search")?.trim().toLowerCase();
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    let query = supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && VALID_ORDER_STATUSES.includes(status)) {
      query = query.eq("order_status", status);
    }
    if (fulfillment && VALID_FULFILLMENT_METHODS.includes(fulfillment)) {
      query = query.eq("fulfillment_method", fulfillment);
    }
    if (paymentStatus && VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      query = query.eq("payment_status", paymentStatus);
    }
    if (dateFrom) {
      query = query.gte("created_at", `${dateFrom}T00:00:00`);
    }
    if (dateTo) {
      query = query.lte("created_at", `${dateTo}T23:59:59`);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error("[admin orders GET]", error.message);
      return NextResponse.json({ success: false, error: "Failed to fetch orders." }, { status: 500 });
    }

    let result = orders ?? [];

    // Client-side search on name/phone/order_number
    if (search) {
      result = result.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(search) ||
          o.customer_name?.toLowerCase().includes(search) ||
          o.customer_phone?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, orders: result });
  } catch {
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/admin/orders                                            */
/*  Update order status, payment status, delivery fee, consultation    */
/* ------------------------------------------------------------------ */

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin(request, { requiredPermission: "orders" });
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const {
      id,
      order_status,
      payment_status,
      cancel_reason,
      delivery_fee,
      consultation_reviewed,
      consultation_review_note,
      payment_reference,
      paid_amount,
      payment_note,
      paid_at,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID is required." }, { status: 400 });
    }

    // Fetch current order
    const { data: order, error: fetchErr } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};

    // --- Consultation review update ---
    if (consultation_reviewed === true && !order.consultation_reviewed) {
      updates.consultation_reviewed = true;
      updates.consultation_reviewed_at = new Date().toISOString();
      if (consultation_review_note) {
        updates.consultation_review_note = consultation_review_note;
      }
    }

    // --- Delivery fee update ---
    if (delivery_fee !== undefined && delivery_fee !== null && typeof delivery_fee === "number") {
      if (delivery_fee < 0) {
        return NextResponse.json({ success: false, error: "Delivery fee cannot be negative." }, { status: 400 });
      }
      updates.delivery_fee = delivery_fee;
      updates.total = order.subtotal + delivery_fee;
    }

    // --- Payment status update ---
    if (payment_status && payment_status !== order.payment_status) {
      if (!VALID_PAYMENT_STATUSES.includes(payment_status)) {
        return NextResponse.json({ success: false, error: "Invalid payment status." }, { status: 400 });
      }
      updates.payment_status = payment_status;
      // Auto-set paid_at when marking as paid
      if (payment_status === "paid" && !order.paid_at && !paid_at) {
        updates.paid_at = new Date().toISOString();
      }
    }

    // --- Payment fields ---
    if (payment_reference !== undefined) {
      updates.payment_reference = payment_reference?.trim() || null;
    }
    if (paid_amount !== undefined) {
      updates.paid_amount = paid_amount === null || paid_amount === "" ? null : Number(paid_amount);
    }
    if (payment_note !== undefined) {
      updates.payment_note = payment_note?.trim() || null;
    }
    if (paid_at !== undefined) {
      updates.paid_at = paid_at || null;
    }

    // --- Order status update ---
    if (order_status && order_status !== order.order_status) {
      if (!VALID_ORDER_STATUSES.includes(order_status)) {
        return NextResponse.json({ success: false, error: "Invalid order status." }, { status: 400 });
      }

      if (!canTransition(order.order_status, order_status, order.fulfillment_method)) {
        return NextResponse.json({
          success: false,
          error: `Cannot change status from "${order.order_status}" to "${order_status}".`,
        }, { status: 400 });
      }

      // --- Consultation gate: block confirm if consultation not reviewed ---
      if (order_status === "confirmed" && order.has_consultation_items) {
        const isReviewed = updates.consultation_reviewed === true || order.consultation_reviewed === true;
        if (!isReviewed) {
          return NextResponse.json({
            success: false,
            error: "Consultation must be reviewed before confirming this order. Please mark consultation as reviewed first.",
          }, { status: 400 });
        }
      }

      // --- Payment status movement rules ---
      const effectivePaymentStatus = (updates.payment_status as string) || order.payment_status;

      if (order_status === "out_for_delivery") {
        if (effectivePaymentStatus !== "paid") {
          return NextResponse.json({
            success: false,
            error: "Delivery orders must be paid before dispatch. Please update payment status to Paid first.",
          }, { status: 400 });
        }
      }

      if (order_status === "ready_for_pickup") {
        if (effectivePaymentStatus === "failed" || effectivePaymentStatus === "refunded") {
          return NextResponse.json({
            success: false,
            error: "Cannot mark ready for pickup when payment status is failed or refunded.",
          }, { status: 400 });
        }
      }

      if (order_status === "completed") {
        if (effectivePaymentStatus !== "paid") {
          return NextResponse.json({
            success: false,
            error: "Payment must be marked as paid before completing this order.",
          }, { status: 400 });
        }
      }

      // --- Stock reduction on confirm ---
      if (order_status === "confirmed" && order.order_status !== "confirmed") {
        const stockResult = await reduceStock(order.id);
        if (!stockResult.success) {
          return NextResponse.json({ success: false, error: stockResult.error }, { status: 400 });
        }
      }

      // --- Stock restoration on cancel ---
      if (order_status === "cancelled") {
        const wasConfirmed = ["confirmed", "ready_for_pickup", "out_for_delivery"].includes(order.order_status);
        if (wasConfirmed) {
          await restoreStock(order.id);
        }
      }

      updates.order_status = order_status;

      if (order_status === "cancelled" && cancel_reason) {
        updates.notes = order.notes
          ? `${order.notes}\n[Cancelled] ${cancel_reason}`
          : `[Cancelled] ${cancel_reason}`;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: true, message: "No changes." });
    }

    const { error: updateErr } = await supabaseAdmin
      .from("orders")
      .update(updates)
      .eq("id", id);

    if (updateErr) {
      console.error("[admin orders PATCH]", updateErr.message);
      return NextResponse.json({ success: false, error: "Failed to update order." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Order updated." });
  } catch {
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  Stock reduction when confirming an order                           */
/* ------------------------------------------------------------------ */

async function reduceStock(orderId: string): Promise<{ success: boolean; error?: string }> {
  // Fetch order items
  const { data: items, error: itemsErr } = await supabaseAdmin
    .from("order_items")
    .select("product_id, product_name_snapshot, quantity")
    .eq("order_id", orderId);

  if (itemsErr || !items) {
    return { success: false, error: "Failed to fetch order items for stock update." };
  }

  // Check stock availability for each item
  for (const item of items) {
    if (!item.product_id) continue; // Product was deleted, skip

    const { data: product, error: prodErr } = await supabaseAdmin
      .from("products")
      .select("id, name, stock_quantity")
      .eq("id", item.product_id)
      .single();

    if (prodErr || !product) {
      // Product no longer exists
      continue;
    }

    if (product.stock_quantity < item.quantity) {
      return {
        success: false,
        error: `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}, Required: ${item.quantity}.`,
      };
    }
  }

  // All checks passed — reduce stock
  for (const item of items) {
    if (!item.product_id) continue;

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id, stock_quantity")
      .eq("id", item.product_id)
      .single();

    if (!product) continue;

    const newQty = product.stock_quantity - item.quantity;
    const newStatus = newQty <= 0 ? "out_of_stock" : newQty <= 5 ? "low_stock" : "in_stock";

    await supabaseAdmin
      .from("products")
      .update({ stock_quantity: newQty, stock_status: newStatus })
      .eq("id", item.product_id);
  }

  return { success: true };
}

/* ------------------------------------------------------------------ */
/*  Stock restoration when cancelling a confirmed order                */
/* ------------------------------------------------------------------ */

async function restoreStock(orderId: string): Promise<void> {
  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  if (!items) return;

  for (const item of items) {
    if (!item.product_id) continue;

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id, stock_quantity")
      .eq("id", item.product_id)
      .single();

    if (!product) continue;

    const newQty = product.stock_quantity + item.quantity;
    const newStatus = newQty <= 0 ? "out_of_stock" : newQty <= 5 ? "low_stock" : "in_stock";

    await supabaseAdmin
      .from("products")
      .update({ stock_quantity: newQty, stock_status: newStatus })
      .eq("id", item.product_id);
  }
}
