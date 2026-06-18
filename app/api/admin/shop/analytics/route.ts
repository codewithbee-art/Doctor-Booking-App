import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  GET /api/admin/shop/analytics                                      */
/*  Server-side aggregation for shop analytics                         */
/* ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request, { requiredPermission: "shop_analytics" });
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "all"; // today, week, month, year, all

    // Build date filter
    const now = new Date();
    let dateFrom: string | null = null;
    if (range === "today") {
      dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    } else if (range === "week") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      dateFrom = d.toISOString();
    } else if (range === "month") {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      dateFrom = d.toISOString();
    } else if (range === "year") {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      dateFrom = d.toISOString();
    }

    // --- Fetch all orders (summary fields only) ---
    let ordersQuery = supabaseAdmin
      .from("orders")
      .select("id, order_status, payment_status, fulfillment_method, total, has_consultation_items, customer_phone, customer_name, created_at");

    if (dateFrom) {
      ordersQuery = ordersQuery.gte("created_at", dateFrom);
    }

    const { data: orders, error: ordersErr } = await ordersQuery;
    if (ordersErr) {
      console.error("[analytics orders]", ordersErr.message);
      return NextResponse.json({ success: false, error: "Failed to fetch orders." }, { status: 500 });
    }

    const allOrders = orders ?? [];

    // --- Summary cards ---
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter((o) => o.order_status === "pending" || o.order_status === "needs_review").length;
    const confirmedOrders = allOrders.filter((o) => o.order_status === "confirmed" || o.order_status === "ready_for_pickup" || o.order_status === "out_for_delivery").length;
    const completedOrders = allOrders.filter((o) => o.order_status === "completed").length;
    const cancelledOrders = allOrders.filter((o) => o.order_status === "cancelled").length;
    const completedOrderValue = allOrders
      .filter((o) => o.order_status === "completed")
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const consultationOrders = allOrders.filter((o) => o.has_consultation_items).length;
    const pickupOrders = allOrders.filter((o) => o.fulfillment_method === "pickup" && o.order_status !== "cancelled").length;
    const deliveryOrders = allOrders.filter((o) => o.fulfillment_method === "delivery" && o.order_status !== "cancelled").length;

    // --- Products stock data ---
    const { data: products, error: productsErr } = await supabaseAdmin
      .from("products")
      .select("id, name, slug, category, stock_quantity, stock_status, is_active, requires_consultation");

    if (productsErr) {
      console.error("[analytics products]", productsErr.message);
      return NextResponse.json({ success: false, error: "Failed to fetch products." }, { status: 500 });
    }

    const allProducts = products ?? [];
    const lowStockProducts = allProducts.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 5);
    const outOfStockProducts = allProducts.filter((p) => p.stock_quantity <= 0 || p.stock_status === "out_of_stock");

    // --- Order items for best-selling / slow-moving ---
    // Only from confirmed/completed orders
    const validOrderIds = allOrders
      .filter((o) => o.order_status === "confirmed" || o.order_status === "completed" || o.order_status === "ready_for_pickup" || o.order_status === "out_for_delivery")
      .map((o) => o.id);

    let bestSelling: { product_name: string; product_id: string | null; total_qty: number }[] = [];
    let categoryPerformance: { category: string; total_qty: number; total_value: number }[] = [];

    if (validOrderIds.length > 0) {
      const { data: items } = await supabaseAdmin
        .from("order_items")
        .select("product_id, product_name_snapshot, quantity, subtotal")
        .in("order_id", validOrderIds);

      if (items && items.length > 0) {
        // Best-selling by quantity
        const productMap: Record<string, { name: string; product_id: string | null; qty: number }> = {};
        for (const item of items) {
          const key = item.product_id || item.product_name_snapshot;
          if (!productMap[key]) {
            productMap[key] = { name: item.product_name_snapshot, product_id: item.product_id, qty: 0 };
          }
          productMap[key].qty += item.quantity;
        }
        bestSelling = Object.values(productMap)
          .map((p) => ({ product_name: p.name, product_id: p.product_id, total_qty: p.qty }))
          .sort((a, b) => b.total_qty - a.total_qty)
          .slice(0, 10);

        // Category performance
        const catMap: Record<string, { qty: number; value: number }> = {};
        for (const item of items) {
          const product = allProducts.find((p) => p.id === item.product_id);
          const cat = product?.category || "Uncategorized";
          if (!catMap[cat]) catMap[cat] = { qty: 0, value: 0 };
          catMap[cat].qty += item.quantity;
          catMap[cat].value += item.subtotal || 0;
        }
        categoryPerformance = Object.entries(catMap)
          .map(([category, v]) => ({ category, total_qty: v.qty, total_value: v.value }))
          .sort((a, b) => b.total_value - a.total_value);
      }
    }

    // Slow-moving: active products not in bestSelling top list
    const soldProductIds = new Set(bestSelling.filter((b) => b.product_id).map((b) => b.product_id));
    const slowMoving = allProducts
      .filter((p) => p.is_active && !soldProductIds.has(p.id))
      .map((p) => ({ id: p.id, name: p.name, category: p.category, stock_quantity: p.stock_quantity }))
      .slice(0, 10);

    // --- Top customers ---
    const customerMap: Record<string, { name: string; phone: string; orders: number; total: number }> = {};
    for (const o of allOrders.filter((o) => o.order_status !== "cancelled")) {
      const key = o.customer_phone;
      if (!customerMap[key]) {
        customerMap[key] = { name: o.customer_name, phone: o.customer_phone, orders: 0, total: 0 };
      }
      customerMap[key].orders += 1;
      customerMap[key].total += o.total || 0;
    }
    const topCustomers = Object.values(customerMap)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10);

    // --- Sales trend (daily for selected range, max 30 points) ---
    const completedForTrend = allOrders.filter((o) => o.order_status === "completed");
    const trendMap: Record<string, { date: string; orders: number; value: number }> = {};
    for (const o of completedForTrend) {
      const day = o.created_at.slice(0, 10); // YYYY-MM-DD
      if (!trendMap[day]) trendMap[day] = { date: day, orders: 0, value: 0 };
      trendMap[day].orders += 1;
      trendMap[day].value += o.total || 0;
    }
    const salesTrend = Object.values(trendMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    return NextResponse.json({
      success: true,
      summary: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        completedOrders,
        cancelledOrders,
        completedOrderValue,
        consultationOrders,
        pickupOrders,
        deliveryOrders,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
      },
      bestSelling,
      slowMoving,
      categoryPerformance,
      topCustomers,
      salesTrend,
      lowStockProducts: lowStockProducts.map((p) => ({ id: p.id, name: p.name, category: p.category, stock_quantity: p.stock_quantity })),
      outOfStockProducts: outOfStockProducts.map((p) => ({ id: p.id, name: p.name, category: p.category, stock_quantity: p.stock_quantity, stock_status: p.stock_status })),
    });
  } catch {
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}
