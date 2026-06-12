"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStaffProfile } from "@/lib/useStaffProfile";
import AdminInactive from "@/components/AdminInactive";
import AdminPageHeader from "@/components/AdminPageHeader";
import { adminFetch } from "@/lib/adminFetch";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  fulfillment_method: string;
  delivery_address: string | null;
  delivery_notes: string | null;
  order_status: string;
  payment_preference: string;
  payment_status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  has_consultation_items: boolean;
  consultation_reviewed: boolean;
  consultation_reviewed_at: string | null;
  consultation_review_note: string | null;
  notes: string | null;
  payment_reference: string | null;
  paid_amount: number | null;
  payment_note: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  requires_consultation_snapshot: boolean;
  allow_delivery_snapshot: boolean;
  allow_pickup_snapshot: boolean;
  created_at: string;
}

type FilterTab = "all" | "pending" | "needs_review" | "confirmed" | "completed" | "cancelled";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  needs_review: "Needs Review",
  confirmed: "Confirmed",
  ready_for_pickup: "Ready for Pickup",
  out_for_delivery: "Out for Delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

const ORDER_STATUS_STYLES: Record<string, string> = {
  pending: "border-amber-300 bg-amber-50 text-amber-800",
  needs_review: "border-purple-300 bg-purple-50 text-purple-800",
  confirmed: "border-green-300 bg-green-50 text-green-800",
  ready_for_pickup: "border-blue-300 bg-blue-50 text-blue-800",
  out_for_delivery: "border-blue-300 bg-blue-50 text-blue-800",
  completed: "border-slate-300 bg-slate-100 text-slate-700",
  cancelled: "border-red-300 bg-red-50 text-red-800",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  unpaid: "text-amber-700",
  pending: "text-blue-700",
  paid: "text-green-700",
  failed: "text-red-700",
  refunded: "text-slate-600",
};

const FULFILLMENT_LABELS: Record<string, string> = {
  pickup: "Collect from Shop",
  delivery: "Home Delivery",
};

const PAYMENT_PREF_LABELS: Record<string, string> = {
  pay_later: "Pay Later",
  pay_on_pickup: "Pay on Pickup",
  pay_on_delivery: "Pay on Delivery (legacy)",
  pay_now_later_phase: "Online (TBD)",
};

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminOrdersPage() {
  const router = useRouter();
  const { loading: staffLoading, profile: staffProfile, noSession, inactive } = useStaffProfile();
  const [checking, setChecking] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [actionMsg, setActionMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [returningCount, setReturningCount] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status update
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Cancel modal
  const [cancelOrder, setCancelOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Consultation review
  const [consultReviewNote, setConsultReviewNote] = useState("");
  const [consultReviewing, setConsultReviewing] = useState(false);

  // Delivery fee editing
  const [editingDeliveryFee, setEditingDeliveryFee] = useState(false);
  const [deliveryFeeInput, setDeliveryFeeInput] = useState("");

  // Payment fields editing
  const [editingPayment, setEditingPayment] = useState(false);
  const [payRefInput, setPayRefInput] = useState("");
  const [paidAmtInput, setPaidAmtInput] = useState("");
  const [payNoteInput, setPayNoteInput] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

  /* ---- Auth ---- */
  useEffect(() => {
    if (staffLoading) return;
    if (noSession) { router.replace("/admin/login"); return; }
    setChecking(false);
  }, [staffLoading, noSession, router]);

  /* ---- Fetch orders ---- */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/orders");
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setOrders(data.orders ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!checking && !inactive) fetchOrders();
  }, [checking, inactive, fetchOrders]);

  /* ---- Filters ---- */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && o.order_status !== filter) return false;
      if (fulfillmentFilter && o.fulfillment_method !== fulfillmentFilter) return false;
      if (paymentFilter && o.payment_status !== paymentFilter) return false;
      if (q) {
        const match =
          o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [orders, filter, search, fulfillmentFilter, paymentFilter]);

  const counts = useMemo(() => ({
    all: orders.length,
    pending: orders.filter((o) => o.order_status === "pending").length,
    needs_review: orders.filter((o) => o.order_status === "needs_review").length,
    confirmed: orders.filter((o) => o.order_status === "confirmed").length,
    completed: orders.filter((o) => o.order_status === "completed").length,
    cancelled: orders.filter((o) => o.order_status === "cancelled").length,
  }), [orders]);

  /* ---- View detail ---- */
  async function openDetail(order: Order) {
    setSelectedOrder(order);
    setDetailLoading(true);
    setOrderItems([]);
    setReturningCount(0);
    try {
      const res = await adminFetch(`/api/admin/orders/${order.id}`);
      const data = await res.json();
      if (data.success) {
        setOrderItems(data.items ?? []);
        setReturningCount(data.returning_customer_orders ?? 0);
      }
    } catch { /* ignore */ }
    setDetailLoading(false);
  }

  /* ---- Status update ---- */
  async function updateStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    setActionMsg(null);
    try {
      const res = await adminFetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, order_status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setActionMsg({ text: `Order status updated to "${ORDER_STATUS_LABELS[newStatus] || newStatus}".`, type: "success" });
      await fetchOrders();
      // Refresh detail if open
      if (selectedOrder?.id === orderId) {
        const updated = orders.find((o) => o.id === orderId);
        if (updated) setSelectedOrder({ ...updated, order_status: newStatus });
      }
    } catch (err) {
      setActionMsg({ text: err instanceof Error ? err.message : "Failed to update status.", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  }

  /* ---- Cancel with reason ---- */
  async function handleCancel() {
    if (!cancelOrder) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await adminFetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cancelOrder.id, order_status: "cancelled", cancel_reason: cancelReason.trim() || undefined }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setActionMsg({ text: `Order ${cancelOrder.order_number} cancelled.`, type: "success" });
      setCancelOrder(null);
      setCancelReason("");
      await fetchOrders();
      if (selectedOrder?.id === cancelOrder.id) setSelectedOrder(null);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  }

  /* ---- Payment status update ---- */
  async function updatePayment(orderId: string, newPayment: string) {
    setUpdatingId(orderId);
    setActionMsg(null);
    try {
      const res = await adminFetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, payment_status: newPayment }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setActionMsg({ text: `Payment status updated to "${PAYMENT_STATUS_LABELS[newPayment] || newPayment}".`, type: "success" });
      await fetchOrders();
    } catch (err) {
      setActionMsg({ text: err instanceof Error ? err.message : "Failed to update payment.", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  }

  /* ---- Available next statuses (respects payment + consultation rules) ---- */
  function getNextStatuses(order: Order): string[] {
    const s = order.order_status;
    const f = order.fulfillment_method;
    const ps = order.payment_status;

    if (s === "pending" || s === "needs_review") {
      // Consultation gate: if needs review and not reviewed, don't show confirm
      if (order.has_consultation_items && !order.consultation_reviewed) return [];
      return ["confirmed"];
    }
    if (s === "confirmed") {
      const opts: string[] = [];
      if (f === "pickup" && ps !== "failed" && ps !== "refunded") opts.push("ready_for_pickup");
      if (f === "delivery" && ps === "paid") opts.push("out_for_delivery");
      if (ps === "paid") opts.push("completed");
      return opts;
    }
    if (s === "ready_for_pickup") {
      if (ps === "paid") return ["completed"];
      return [];
    }
    if (s === "out_for_delivery") {
      if (ps === "paid") return ["completed"];
      return [];
    }
    return [];
  }

  function canCancel(order: Order): boolean {
    return ["pending", "needs_review", "confirmed", "ready_for_pickup", "out_for_delivery"].includes(order.order_status);
  }

  function needsConsultReview(order: Order): boolean {
    return order.has_consultation_items && !order.consultation_reviewed && ["pending", "needs_review"].includes(order.order_status);
  }

  /* ---- Consultation review ---- */
  async function handleConsultReview(orderId: string) {
    setConsultReviewing(true);
    setActionMsg(null);
    try {
      const res = await adminFetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, consultation_reviewed: true, consultation_review_note: consultReviewNote.trim() || undefined }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setActionMsg({ text: "Consultation marked as reviewed.", type: "success" });
      setConsultReviewNote("");
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, consultation_reviewed: true, consultation_reviewed_at: new Date().toISOString(), consultation_review_note: consultReviewNote.trim() || null });
      }
    } catch (err) {
      setActionMsg({ text: err instanceof Error ? err.message : "Failed to update consultation.", type: "error" });
    } finally {
      setConsultReviewing(false);
    }
  }

  /* ---- Delivery fee update ---- */
  async function handleDeliveryFeeUpdate(orderId: string) {
    const fee = parseFloat(deliveryFeeInput);
    if (isNaN(fee) || fee < 0) {
      setActionMsg({ text: "Please enter a valid delivery fee (0 or more).", type: "error" });
      return;
    }
    setUpdatingId(orderId);
    setActionMsg(null);
    try {
      const res = await adminFetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, delivery_fee: fee }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setActionMsg({ text: `Delivery fee updated to NPR ${fee}. Total recalculated.`, type: "success" });
      setEditingDeliveryFee(false);
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, delivery_fee: fee, total: selectedOrder.subtotal + fee });
      }
    } catch (err) {
      setActionMsg({ text: err instanceof Error ? err.message : "Failed to update delivery fee.", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  }

  /* ---- Render ---- */
  if (staffLoading || checking) {
    return <main className="min-h-screen bg-bg-light flex items-center justify-center"><p className="font-body text-sm text-text-secondary">Loading...</p></main>;
  }
  if (inactive) return <AdminInactive />;

  return (
    <>
      <AdminPageHeader title="Order Management" description="View and manage customer order requests." />

      <div className="mx-auto max-w-7xl">

        {/* Shop admin tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          <a href="/admin/shop" className="px-4 py-2.5 font-body text-sm font-semibold text-text-secondary hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary/30">Products</a>
          <span className="px-4 py-2.5 font-body text-sm font-semibold text-primary border-b-2 border-primary">Orders</span>
          <a href="/admin/shop/analytics" className="px-4 py-2.5 font-body text-sm font-semibold text-text-secondary hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary/30">Analytics</a>
        </div>

        {/* Action message */}
        {actionMsg && (
          <div className={`mb-4 rounded-lg border px-4 py-3 font-body text-sm ${actionMsg.type === "success" ? "border-green-300 bg-green-50 text-green-800" : "border-red-300 bg-red-50 text-red-800"}`}>
            {actionMsg.text}
            <button onClick={() => setActionMsg(null)} className="ml-3 font-semibold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Tab filter */}
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "needs_review", "confirmed", "completed", "cancelled"] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`rounded-lg px-3 py-1.5 font-body text-xs font-semibold transition-colors ${
                  filter === tab
                    ? "bg-primary text-white"
                    : "bg-white border border-border text-text-primary hover:bg-bg-light"
                }`}
              >
                {tab === "all" ? "All" : ORDER_STATUS_LABELS[tab] || tab} ({counts[tab]})
              </button>
            ))}
          </div>

          {/* Search + dropdowns */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search order #, name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Fulfillment</option>
              <option value="pickup">Pickup</option>
              <option value="delivery">Delivery</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Payment</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Loading/error states */}
        {loading && <p className="font-body text-sm text-text-secondary">Loading orders...</p>}
        {error && <p className="font-body text-sm text-red-600">{error}</p>}

        {/* Orders list */}
        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="font-body text-sm text-text-secondary">No orders found.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-slate-200 bg-white p-4 hover:border-primary/20 transition-colors cursor-pointer"
                onClick={() => openDetail(order)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Left info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-body text-sm font-bold text-primary">{order.order_number}</span>
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${ORDER_STATUS_STYLES[order.order_status] || "border-slate-300 bg-slate-100 text-slate-700"}`}>
                        {ORDER_STATUS_LABELS[order.order_status] || order.order_status}
                      </span>
                      {order.has_consultation_items && !order.consultation_reviewed && (
                        <span className="rounded-full border border-purple-300 bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">Consultation Pending</span>
                      )}
                      {order.has_consultation_items && order.consultation_reviewed && (
                        <span className="rounded-full border border-green-300 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">Consultation Reviewed</span>
                      )}
                    </div>
                    <p className="font-body text-sm text-text-primary mt-1">{order.customer_name} &middot; {order.customer_phone}</p>
                    <div className="flex items-center gap-3 mt-1 font-body text-xs text-text-secondary">
                      <span>{FULFILLMENT_LABELS[order.fulfillment_method] || order.fulfillment_method}</span>
                      <span>&middot;</span>
                      <span className={PAYMENT_STATUS_STYLES[order.payment_status] || ""}>{PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}</span>
                      <span>&middot;</span>
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                  </div>

                  {/* Right: total + actions */}
                  <div className="flex items-center gap-3">
                    <span className="font-body text-sm font-bold text-text-primary">NPR {order.total}</span>
                    {/* Quick actions */}
                    <div className="flex gap-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                      {needsConsultReview(order) && (
                        <button
                          onClick={() => openDetail(order)}
                          className="rounded-md bg-purple-50 px-2 py-1 font-body text-[10px] font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
                          title="Review consultation before confirming"
                        >
                          Review Consultation
                        </button>
                      )}
                      {getNextStatuses(order).map((ns) => (
                        <button
                          key={ns}
                          onClick={() => updateStatus(order.id, ns)}
                          disabled={updatingId === order.id}
                          className="rounded-md bg-primary/10 px-2 py-1 font-body text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                          title={`Mark as ${ORDER_STATUS_LABELS[ns]}`}
                        >
                          {ORDER_STATUS_LABELS[ns]}
                        </button>
                      ))}
                      {canCancel(order) && (
                        <button
                          onClick={() => { setCancelOrder(order); setCancelError(null); setCancelReason(""); }}
                          disabled={updatingId === order.id}
                          className="rounded-md bg-red-50 px-2 py-1 font-body text-[10px] font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                          title="Cancel order"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============ Order Detail Modal ============ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto p-4" onClick={() => setSelectedOrder(null)}>
          <div
            className="relative w-full max-w-3xl rounded-2xl bg-white shadow-xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-heading text-lg font-bold text-text-primary">Order {selectedOrder.order_number}</h2>
              <button onClick={() => setSelectedOrder(null)} className="rounded-lg p-1 hover:bg-bg-light transition-colors" aria-label="Close">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Status + actions row */}
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${ORDER_STATUS_STYLES[selectedOrder.order_status] || "border-slate-300 bg-slate-100 text-slate-700"}`}>
                  {ORDER_STATUS_LABELS[selectedOrder.order_status] || selectedOrder.order_status}
                </span>
                {selectedOrder.has_consultation_items && !selectedOrder.consultation_reviewed && (
                  <span className="rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">Consultation Pending Review</span>
                )}
                {selectedOrder.has_consultation_items && selectedOrder.consultation_reviewed && (
                  <span className="rounded-full border border-green-300 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">Consultation Reviewed</span>
                )}
                {returningCount > 0 && (
                  <span className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    Returning Customer ({returningCount} prev order{returningCount > 1 ? "s" : ""})
                  </span>
                )}
              </div>

              {/* Customer info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-body text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">Customer</h3>
                  <p className="font-body text-sm text-text-primary font-semibold">{selectedOrder.customer_name}</p>
                  <p className="font-body text-sm text-text-secondary">{selectedOrder.customer_phone}</p>
                  {selectedOrder.customer_email && (
                    <p className="font-body text-sm text-text-secondary">{selectedOrder.customer_email}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-body text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">Fulfillment</h3>
                  <p className="font-body text-sm text-text-primary font-semibold">{FULFILLMENT_LABELS[selectedOrder.fulfillment_method] || selectedOrder.fulfillment_method}</p>
                  {selectedOrder.fulfillment_method === "delivery" && selectedOrder.delivery_address && (
                    <p className="font-body text-sm text-text-secondary mt-0.5">{selectedOrder.delivery_address}</p>
                  )}
                  {selectedOrder.delivery_notes && (
                    <p className="font-body text-xs text-text-secondary italic mt-0.5">Notes: {selectedOrder.delivery_notes}</p>
                  )}
                </div>
              </div>

              {/* Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-body text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">Payment Preference</h3>
                  <p className="font-body text-sm text-text-primary">{PAYMENT_PREF_LABELS[selectedOrder.payment_preference] || selectedOrder.payment_preference}</p>
                </div>
                <div>
                  <h3 className="font-body text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">Payment Status</h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedOrder.payment_status}
                      onChange={(e) => {
                        updatePayment(selectedOrder.id, e.target.value);
                        setSelectedOrder({ ...selectedOrder, payment_status: e.target.value });
                      }}
                      className="rounded-lg border border-border bg-white px-2 py-1 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Order items */}
              <div>
                <h3 className="font-body text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Order Items</h3>
                {detailLoading ? (
                  <p className="font-body text-sm text-text-secondary">Loading items...</p>
                ) : orderItems.length === 0 ? (
                  <p className="font-body text-sm text-text-secondary">No items found.</p>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-bg-light">
                        <tr>
                          <th className="px-3 py-2 font-body text-xs font-semibold text-text-secondary">Product</th>
                          <th className="px-3 py-2 font-body text-xs font-semibold text-text-secondary text-center">Qty</th>
                          <th className="px-3 py-2 font-body text-xs font-semibold text-text-secondary text-right">Unit Price</th>
                          <th className="px-3 py-2 font-body text-xs font-semibold text-text-secondary text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {orderItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-3 py-2 font-body text-sm text-text-primary">
                              {item.product_name_snapshot}
                              {item.requires_consultation_snapshot && (
                                <span className="ml-1 text-[9px] text-purple-700 font-semibold">(Consultation)</span>
                              )}
                              {!item.product_id && (
                                <span className="ml-1 text-[9px] text-amber-700 font-semibold">(Product deleted)</span>
                              )}
                            </td>
                            <td className="px-3 py-2 font-body text-sm text-text-primary text-center">{item.quantity}</td>
                            <td className="px-3 py-2 font-body text-sm text-text-primary text-right">NPR {item.unit_price}</td>
                            <td className="px-3 py-2 font-body text-sm font-semibold text-text-primary text-right">NPR {item.subtotal}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Totals + Delivery Fee */}
              <div className="flex justify-end">
                <div className="w-full sm:w-80 space-y-1 font-body text-sm">
                  <div className="flex justify-between"><span className="text-text-secondary">Subtotal</span><span className="text-text-primary">NPR {selectedOrder.subtotal}</span></div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Delivery Fee</span>
                    {selectedOrder.fulfillment_method === "delivery" && !editingDeliveryFee ? (
                      <span className="flex items-center gap-2">
                        <span className="text-text-primary">NPR {selectedOrder.delivery_fee}</span>
                        <button
                          onClick={() => { setEditingDeliveryFee(true); setDeliveryFeeInput(String(selectedOrder.delivery_fee)); }}
                          className="text-[10px] text-primary font-semibold hover:underline"
                        >
                          Edit
                        </button>
                      </span>
                    ) : selectedOrder.fulfillment_method === "delivery" && editingDeliveryFee ? (
                      <span className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          value={deliveryFeeInput}
                          onChange={(e) => setDeliveryFeeInput(e.target.value)}
                          className="w-20 rounded border border-border px-2 py-0.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button onClick={() => handleDeliveryFeeUpdate(selectedOrder.id)} className="text-[10px] text-primary font-semibold hover:underline">Save</button>
                        <button onClick={() => setEditingDeliveryFee(false)} className="text-[10px] text-text-secondary font-semibold hover:underline">Cancel</button>
                      </span>
                    ) : (
                      <span className="text-text-secondary">N/A</span>
                    )}
                  </div>
                  <div className="flex justify-between border-t border-border pt-1"><span className="font-semibold text-text-primary">Total</span><span className="font-bold text-primary">NPR {selectedOrder.total}</span></div>
                </div>
              </div>
              {selectedOrder.fulfillment_method === "delivery" && selectedOrder.order_status !== "completed" && selectedOrder.order_status !== "cancelled" && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                  <p className="font-body text-xs text-amber-800">Delivery fee should be confirmed manually before payment/dispatch.</p>
                </div>
              )}

              {/* Payment Details Section */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-body text-xs font-semibold text-text-secondary uppercase tracking-wide">Payment Details</h3>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/receipt?type=order&id=${selectedOrder.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md bg-slate-100 px-2 py-1 font-body text-[10px] font-semibold text-primary hover:bg-slate-200 transition-colors"
                    >
                      View Receipt
                    </a>
                    {!editingPayment && (
                      <button
                        onClick={() => {
                          setEditingPayment(true);
                          setPayRefInput(selectedOrder.payment_reference || selectedOrder.order_number);
                          setPaidAmtInput(selectedOrder.paid_amount != null ? String(selectedOrder.paid_amount) : "");
                          setPayNoteInput(selectedOrder.payment_note || "");
                        }}
                        className="rounded-md bg-primary/10 px-2 py-1 font-body text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors"
                      >
                        Edit Payment Info
                      </button>
                    )}
                  </div>
                </div>
                {!editingPayment ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-body text-sm">
                    <div>
                      <span className="text-text-secondary text-xs">Reference:</span>
                      <p className="text-text-primary font-medium">{selectedOrder.payment_reference || selectedOrder.order_number}</p>
                    </div>
                    <div>
                      <span className="text-text-secondary text-xs">Paid Amount:</span>
                      <p className="text-text-primary font-medium">{selectedOrder.paid_amount != null ? `NPR ${selectedOrder.paid_amount}` : "—"}</p>
                    </div>
                    <div>
                      <span className="text-text-secondary text-xs">Payment Note:</span>
                      <p className="text-text-primary">{selectedOrder.payment_note || "—"}</p>
                    </div>
                    <div>
                      <span className="text-text-secondary text-xs">Paid At:</span>
                      <p className="text-text-primary">{selectedOrder.paid_at ? formatDateTime(selectedOrder.paid_at) : "—"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-body text-xs font-medium text-text-secondary mb-0.5">Payment Reference</label>
                        <input
                          type="text"
                          value={payRefInput}
                          onChange={(e) => setPayRefInput(e.target.value)}
                          className="w-full rounded-lg border border-border bg-white px-2 py-1.5 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="e.g. bank txn ID, transfer ref"
                        />
                      </div>
                      <div>
                        <label className="block font-body text-xs font-medium text-text-secondary mb-0.5">Paid Amount (NPR)</label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={paidAmtInput}
                          onChange={(e) => setPaidAmtInput(e.target.value)}
                          className="w-full rounded-lg border border-border bg-white px-2 py-1.5 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-body text-xs font-medium text-text-secondary mb-0.5">Payment Note</label>
                      <input
                        type="text"
                        value={payNoteInput}
                        onChange={(e) => setPayNoteInput(e.target.value)}
                        className="w-full rounded-lg border border-border bg-white px-2 py-1.5 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Internal note about payment..."
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          setSavingPayment(true);
                          try {
                            const res = await adminFetch("/api/admin/orders", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                id: selectedOrder.id,
                                payment_reference: payRefInput,
                                paid_amount: paidAmtInput ? parseFloat(paidAmtInput) : null,
                                payment_note: payNoteInput,
                              }),
                            });
                            const data = await res.json();
                            if (!data.success) throw new Error(data.error);
                            setActionMsg({ text: "Payment details saved.", type: "success" });
                            setEditingPayment(false);
                            setSelectedOrder({
                              ...selectedOrder,
                              payment_reference: payRefInput || null,
                              paid_amount: paidAmtInput ? parseFloat(paidAmtInput) : null,
                              payment_note: payNoteInput || null,
                            });
                            await fetchOrders();
                          } catch (err) {
                            setActionMsg({ text: err instanceof Error ? err.message : "Failed to save.", type: "error" });
                          } finally {
                            setSavingPayment(false);
                          }
                        }}
                        disabled={savingPayment}
                        className="rounded-lg bg-primary px-3 py-1.5 font-body text-xs font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {savingPayment ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingPayment(false)}
                        className="rounded-lg border border-border px-3 py-1.5 font-body text-xs font-semibold text-text-primary hover:bg-bg-light transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-body text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">Notes</h3>
                  <p className="font-body text-sm text-text-primary whitespace-pre-wrap">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Dates */}
              <div className="font-body text-xs text-text-secondary">
                <span>Created: {formatDateTime(selectedOrder.created_at)}</span>
                <span className="ml-4">Updated: {formatDateTime(selectedOrder.updated_at)}</span>
              </div>

              {/* Consultation review section */}
              {needsConsultReview(selectedOrder) && (
                <div className="border-t border-border pt-4">
                  <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                    <h3 className="font-body text-sm font-bold text-purple-800 mb-2">Consultation Review Required</h3>
                    <p className="font-body text-xs text-purple-700 mb-3">
                      This order contains items that require consultation. Please review before confirming the order.
                    </p>
                    <div className="mb-3">
                      <label htmlFor="consult-note" className="block font-body text-xs font-semibold text-purple-800 mb-1">
                        Review Note <span className="font-normal text-purple-600">(optional)</span>
                      </label>
                      <textarea
                        id="consult-note"
                        rows={2}
                        value={consultReviewNote}
                        onChange={(e) => setConsultReviewNote(e.target.value)}
                        className="w-full resize-none rounded-lg border border-purple-200 bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="e.g. Discussed dosage with patient, approved"
                      />
                    </div>
                    <button
                      onClick={() => handleConsultReview(selectedOrder.id)}
                      disabled={consultReviewing}
                      className="rounded-lg bg-purple-700 px-4 py-2 font-body text-sm font-semibold text-white hover:bg-purple-800 transition-colors disabled:opacity-50"
                    >
                      {consultReviewing ? "Saving..." : "Mark Consultation Reviewed"}
                    </button>
                  </div>
                </div>
              )}

              {/* Consultation review info (if already reviewed) */}
              {selectedOrder.has_consultation_items && selectedOrder.consultation_reviewed && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                  <p className="font-body text-xs text-green-800 font-semibold">Consultation reviewed{selectedOrder.consultation_reviewed_at ? ` on ${formatDateTime(selectedOrder.consultation_reviewed_at)}` : ""}</p>
                  {selectedOrder.consultation_review_note && (
                    <p className="font-body text-xs text-green-700 mt-1">Note: {selectedOrder.consultation_review_note}</p>
                  )}
                </div>
              )}

              {/* Delivery payment warning */}
              {selectedOrder.fulfillment_method === "delivery" && selectedOrder.payment_status !== "paid" && selectedOrder.order_status === "confirmed" && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                  <p className="font-body text-xs text-amber-800">Delivery orders must be paid before dispatch. Update payment status to &quot;Paid&quot; to enable dispatch.</p>
                </div>
              )}

              {/* Pickup payment warning */}
              {selectedOrder.fulfillment_method === "pickup" && (selectedOrder.payment_status === "unpaid" || selectedOrder.payment_status === "pending") && ["confirmed", "ready_for_pickup"].includes(selectedOrder.order_status) && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                  <p className="font-body text-xs text-blue-800">Payment is {selectedOrder.payment_status}. Customer may pay at pickup.</p>
                </div>
              )}

              {/* Status actions */}
              <div className="border-t border-border pt-4 flex flex-wrap gap-2">
                {getNextStatuses(selectedOrder).map((ns) => (
                  <button
                    key={ns}
                    onClick={() => {
                      updateStatus(selectedOrder.id, ns);
                      setSelectedOrder({ ...selectedOrder, order_status: ns });
                    }}
                    disabled={updatingId === selectedOrder.id}
                    className="rounded-lg bg-primary px-4 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    Mark as {ORDER_STATUS_LABELS[ns]}
                  </button>
                ))}
                {canCancel(selectedOrder) && (
                  <button
                    onClick={() => { setCancelOrder(selectedOrder); setCancelError(null); setCancelReason(""); }}
                    disabled={updatingId === selectedOrder.id}
                    className="rounded-lg bg-red-600 px-4 py-2 font-body text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ Cancel Reason Modal ============ */}
      {cancelOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setCancelOrder(null)}>
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-heading text-lg font-bold text-text-primary mb-2">Cancel Order {cancelOrder.order_number}</h3>
            <p className="font-body text-sm text-text-secondary mb-4">
              {["confirmed", "ready_for_pickup", "out_for_delivery"].includes(cancelOrder.order_status)
                ? "This order has been confirmed. Cancelling will restore stock quantities."
                : "Are you sure you want to cancel this order?"}
            </p>
            <label className="block font-body text-sm font-semibold text-text-primary mb-1">
              Reason <span className="text-text-secondary font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              placeholder="e.g. Customer requested cancellation"
            />
            {cancelError && <p className="font-body text-sm text-red-600 mb-3">{cancelError}</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelOrder(null)}
                className="rounded-lg border border-border px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-lg bg-red-600 px-4 py-2 font-body text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
