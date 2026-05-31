import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OrderItemPayload {
  product_id: string;
  name: string;
  price: number;
  sale_price: number | null;
  quantity: number;
  requires_consultation: boolean;
  allow_delivery: boolean;
  allow_pickup: boolean;
}

interface OrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  fulfillment_method: "pickup" | "delivery";
  delivery_address?: string;
  delivery_notes?: string;
  payment_preference: string;
  notes?: string;
  items: OrderItemPayload[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${datePart}-${rand}`;
}

function effectivePrice(p: OrderItemPayload): number {
  return p.sale_price != null && p.sale_price > 0 && p.sale_price < p.price
    ? p.sale_price
    : p.price;
}

/* ------------------------------------------------------------------ */
/*  POST /api/orders                                                   */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderPayload;

    // ---- Validate required fields --------------------------------
    if (!body.customer_name?.trim()) {
      return NextResponse.json({ success: false, error: "Customer name is required." }, { status: 400 });
    }
    if (!body.customer_phone?.trim()) {
      return NextResponse.json({ success: false, error: "Phone number is required." }, { status: 400 });
    }
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ success: false, error: "Cart is empty." }, { status: 400 });
    }
    if (!["pickup", "delivery"].includes(body.fulfillment_method)) {
      return NextResponse.json({ success: false, error: "Invalid fulfillment method." }, { status: 400 });
    }
    if (body.fulfillment_method === "delivery" && !body.delivery_address?.trim()) {
      return NextResponse.json({ success: false, error: "Delivery address is required for home delivery." }, { status: 400 });
    }

    // ---- Validate products exist and are active ------------------
    const productIds = body.items.map((i) => i.product_id);
    const { data: products, error: prodErr } = await supabaseAdmin
      .from("products")
      .select("id, name, price, sale_price, stock_status, is_active, requires_consultation, allow_delivery, allow_pickup")
      .in("id", productIds)
      .eq("is_active", true)
      .neq("stock_status", "hidden");

    if (prodErr) {
      console.error("[orders POST] product lookup", prodErr.message);
      return NextResponse.json({ success: false, error: "Failed to verify products." }, { status: 500 });
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ success: false, error: "None of the selected products are available." }, { status: 400 });
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Verify each item
    for (const item of body.items) {
      const dbProduct = productMap.get(item.product_id);
      if (!dbProduct) {
        return NextResponse.json({ success: false, error: `Product "${item.name}" is no longer available.` }, { status: 400 });
      }
      if (dbProduct.stock_status === "out_of_stock") {
        return NextResponse.json({ success: false, error: `"${dbProduct.name}" is currently out of stock.` }, { status: 400 });
      }
      if (item.quantity < 1 || item.quantity > 99) {
        return NextResponse.json({ success: false, error: `Invalid quantity for "${dbProduct.name}".` }, { status: 400 });
      }
    }

    // ---- Check fulfillment feasibility ---------------------------
    if (body.fulfillment_method === "delivery") {
      const nonDeliverable = body.items.find((i) => {
        const p = productMap.get(i.product_id);
        return p && !p.allow_delivery;
      });
      if (nonDeliverable) {
        const p = productMap.get(nonDeliverable.product_id);
        return NextResponse.json({
          success: false,
          error: `"${p?.name}" is not available for delivery. Please choose pickup.`,
        }, { status: 400 });
      }
    }
    if (body.fulfillment_method === "pickup") {
      const nonPickup = body.items.find((i) => {
        const p = productMap.get(i.product_id);
        return p && !p.allow_pickup;
      });
      if (nonPickup) {
        const p = productMap.get(nonPickup.product_id);
        return NextResponse.json({
          success: false,
          error: `"${p?.name}" is not available for pickup. Please choose delivery.`,
        }, { status: 400 });
      }
    }

    // ---- Calculate totals using DB prices (server authority) ------
    let subtotal = 0;
    let hasConsultation = false;
    const orderItems: Array<{
      product_id: string;
      product_name_snapshot: string;
      quantity: number;
      unit_price: number;
      subtotal: number;
      requires_consultation_snapshot: boolean;
      allow_delivery_snapshot: boolean;
      allow_pickup_snapshot: boolean;
    }> = [];

    for (const item of body.items) {
      const dbProduct = productMap.get(item.product_id)!;
      const unitPrice = effectivePrice({
        ...item,
        price: dbProduct.price,
        sale_price: dbProduct.sale_price,
      });
      const lineSubtotal = unitPrice * item.quantity;
      subtotal += lineSubtotal;

      if (dbProduct.requires_consultation) hasConsultation = true;

      orderItems.push({
        product_id: item.product_id,
        product_name_snapshot: dbProduct.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal: lineSubtotal,
        requires_consultation_snapshot: dbProduct.requires_consultation,
        allow_delivery_snapshot: dbProduct.allow_delivery,
        allow_pickup_snapshot: dbProduct.allow_pickup,
      });
    }

    const deliveryFee = 0; // placeholder — can be configured later
    const total = subtotal + deliveryFee;

    // ---- Determine order status -----------------------------------
    const orderStatus = hasConsultation ? "needs_review" : "pending";

    // ---- Determine payment preference -----------------------------
    const validPreferences = ["pay_later", "pay_on_pickup", "pay_on_delivery", "pay_now_later_phase"];
    const paymentPref = validPreferences.includes(body.payment_preference ?? "")
      ? body.payment_preference
      : "pay_later";

    // ---- Generate unique order number -----------------------------
    let orderNumber = generateOrderNumber();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("order_number", orderNumber)
        .maybeSingle();
      if (!existing) break;
      orderNumber = generateOrderNumber();
      attempts++;
    }

    // ---- Insert order ---------------------------------------------
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: body.customer_name.trim(),
        customer_phone: body.customer_phone.trim(),
        customer_email: body.customer_email?.trim() || null,
        fulfillment_method: body.fulfillment_method,
        delivery_address: body.fulfillment_method === "delivery" ? (body.delivery_address?.trim() || null) : null,
        delivery_notes: body.delivery_notes?.trim() || null,
        order_status: orderStatus,
        payment_preference: paymentPref,
        payment_status: "unpaid",
        subtotal,
        delivery_fee: deliveryFee,
        total,
        has_consultation_items: hasConsultation,
        notes: body.notes?.trim() || null,
      })
      .select("id, order_number")
      .single();

    if (orderErr || !order) {
      console.error("[orders POST] insert order", orderErr?.message);
      return NextResponse.json({ success: false, error: "Failed to create order." }, { status: 500 });
    }

    // ---- Insert order items ---------------------------------------
    const itemsWithOrderId = orderItems.map((oi) => ({
      ...oi,
      order_id: order.id,
    }));

    const { error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .insert(itemsWithOrderId);

    if (itemsErr) {
      console.error("[orders POST] insert items", itemsErr.message);
      // clean up the order if items fail
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ success: false, error: "Failed to save order items." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order_number: order.order_number,
      order_id: order.id,
      order_status: orderStatus,
      has_consultation_items: hasConsultation,
      total,
    });
  } catch (err) {
    console.error("[orders POST] unexpected", err);
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}
