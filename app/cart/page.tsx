"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { useCart, type CartItem } from "@/contexts/CartContext";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function itemPrice(item: CartItem): number {
  return item.sale_price != null && item.sale_price > 0 && item.sale_price < item.price
    ? item.sale_price
    : item.price;
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type FulfillmentMethod = "pickup" | "delivery";

interface OrderSuccessData {
  order_number: string;
  order_status: string;
  has_consultation_items: boolean;
  total: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CartPage() {
  const { items, totalItems, subtotal, removeItem, updateQuantity, clearCart } = useCart();

  // Fulfillment
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>("pickup");
  const [deliveryArea, setDeliveryArea] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentPreference, setPaymentPreference] = useState("pay_later");
  const [notes, setNotes] = useState("");

  // State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<OrderSuccessData | null>(null);

  // Computed constraints
  const hasNonDeliverable = useMemo(() => items.some((i) => !i.allow_delivery), [items]);
  const hasNonPickup = useMemo(() => items.some((i) => !i.allow_pickup), [items]);
  const hasConsultation = useMemo(() => items.some((i) => i.requires_consultation), [items]);
  const nonDeliverableNames = useMemo(() => items.filter((i) => !i.allow_delivery).map((i) => i.name), [items]);
  const nonPickupNames = useMemo(() => items.filter((i) => !i.allow_pickup).map((i) => i.name), [items]);

  // Auto-correct fulfillment if constraints invalidate current choice
  const effectiveFulfillment = useMemo(() => {
    if (fulfillment === "delivery" && hasNonDeliverable) return "pickup";
    if (fulfillment === "pickup" && hasNonPickup) return "delivery";
    return fulfillment;
  }, [fulfillment, hasNonDeliverable, hasNonPickup]);

  // Payment options filtered by fulfillment method
  const paymentLabels: Record<string, string> = {
    pay_later: "Pay Later (after confirmation)",
    pay_on_pickup: "Pay on Pickup",
  };

  const availablePaymentOptions = useMemo(() => {
    if (effectiveFulfillment === "pickup") return ["pay_later", "pay_on_pickup"] as const;
    return ["pay_later"] as const;
  }, [effectiveFulfillment]);

  // Auto-reset payment preference when fulfillment changes and current choice becomes invalid
  useEffect(() => {
    if (!(availablePaymentOptions as readonly string[]).includes(paymentPreference)) {
      setPaymentPreference("pay_later");
    }
  }, [availablePaymentOptions, paymentPreference]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) { setError("Please enter your name."); return; }
    if (!customerPhone.trim()) { setError("Please enter your phone number."); return; }
    if (effectiveFulfillment === "delivery" && !deliveryArea) {
      setError("Please select a delivery area.");
      return;
    }
    if (effectiveFulfillment === "delivery" && !deliveryAddress.trim()) {
      setError("Please enter a delivery address.");
      return;
    }
    if (items.length === 0) { setError("Your cart is empty."); return; }

    setSubmitting(true);
    try {
      const payload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        fulfillment_method: effectiveFulfillment,
        delivery_address: effectiveFulfillment === "delivery" ? deliveryAddress.trim() : undefined,
        delivery_notes: deliveryNotes.trim() || undefined,
        payment_preference: paymentPreference,
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          product_id: i.product_id,
          name: i.name,
          price: i.price,
          sale_price: i.sale_price,
          quantity: i.quantity,
          requires_consultation: i.requires_consultation,
          allow_delivery: i.allow_delivery,
          allow_pickup: i.allow_pickup,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Order failed.");

      setSuccess({
        order_number: data.order_number,
        order_status: data.order_status,
        has_consultation_items: data.has_consultation_items,
        total: data.total,
      });
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit order.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Success state                                                    */
  /* ---------------------------------------------------------------- */

  if (success) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 md:py-24 text-center">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-8 md:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">Order Request Received!</h1>
          <p className="mt-3 font-body text-lg text-text-secondary">
            Your order <span className="font-semibold text-primary">{success.order_number}</span> has been submitted.
          </p>
          <div className="mt-6 space-y-2 text-left max-w-md mx-auto">
            <div className="rounded-lg bg-white border border-green-100 p-4">
              <h3 className="font-body text-sm font-semibold text-text-primary mb-2">What happens next?</h3>
              <ul className="space-y-1.5 font-body text-sm text-text-secondary">
                <li className="flex gap-2">
                  <span className="text-green-600 font-bold">1.</span>
                  Our team will review your order and confirm product availability.
                </li>
                {success.has_consultation_items && (
                  <li className="flex gap-2">
                    <span className="text-purple-600 font-bold">!</span>
                    <span className="text-purple-700">Your order includes consultation-required products. A doctor will review before confirming.</span>
                  </li>
                )}
                <li className="flex gap-2">
                  <span className="text-green-600 font-bold">2.</span>
                  You will be contacted on your phone number to confirm and arrange payment.
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600 font-bold">3.</span>
                  Payment will be handled during pickup or delivery as per your preference.
                </li>
              </ul>
            </div>
            <p className="font-body text-sm text-text-secondary mt-3">
              <span className="font-semibold">Total:</span> NPR {success.total}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="rounded-lg bg-accent px-6 py-3 font-body text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-border px-6 py-3 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Empty cart                                                       */
  /* ---------------------------------------------------------------- */

  if (totalItems === 0) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 md:py-24 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-bg-light">
          <svg className="h-8 w-8 text-text-secondary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">Your Cart is Empty</h1>
        <p className="mt-2 font-body text-base text-text-secondary">Browse our shop and add products to get started.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-lg bg-accent px-6 py-3 font-body text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
        >
          Browse Shop
        </Link>
      </section>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Cart with items                                                  */
  /* ---------------------------------------------------------------- */

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <Link href="/shop" className="inline-flex items-center gap-1 font-body text-sm text-primary hover:text-secondary transition-colors mb-3">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          Continue Shopping
        </Link>
        <h1 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">
          Shopping Cart <span className="font-body text-lg text-text-secondary font-normal">({totalItems} {totalItems === 1 ? "item" : "items"})</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ---- Left: Cart Items -------------------------------- */}
          <div className="lg:col-span-2 space-y-4">
            {/* Consultation warning */}
            {hasConsultation && (
              <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 flex items-start gap-3">
                <svg className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="font-body text-sm text-purple-800">
                  <span className="font-semibold">Consultation Required.</span> Some items require a doctor&apos;s review. Your order will be marked for review and our team will contact you before confirming.
                </p>
              </div>
            )}

            {/* Cart items list */}
            {items.map((item) => {
              const price = itemPrice(item);
              const lineTotal = price * item.quantity;
              return (
                <div key={item.product_id} className="rounded-xl border border-slate-200 bg-white p-4 flex gap-4">
                  {/* Image */}
                  <Link href={`/shop/${item.slug}`} className="flex-shrink-0">
                    <div className="h-20 w-20 rounded-lg overflow-hidden bg-bg-off">
                      <ProductImage src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/shop/${item.slug}`}>
                      <h3 className="font-body text-sm font-semibold text-text-primary hover:text-primary transition-colors truncate">{item.name}</h3>
                    </Link>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-body text-sm font-bold text-primary">NPR {price}</span>
                      {item.sale_price != null && item.sale_price > 0 && item.sale_price < item.price && (
                        <span className="font-body text-xs text-text-secondary line-through">NPR {item.price}</span>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {item.requires_consultation && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">Consultation</span>
                      )}
                      {!item.allow_delivery && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Pickup Only</span>
                      )}
                      {!item.allow_pickup && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Delivery Only</span>
                      )}
                    </div>

                    {/* Quantity + Remove */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center rounded-lg border border-border">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="px-2.5 py-1 font-body text-sm text-text-primary hover:bg-bg-light rounded-l-lg transition-colors"
                          aria-label="Decrease quantity"
                        >
                          &minus;
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product_id, Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                          className="w-10 border-x border-border bg-white py-1 text-center font-body text-xs text-text-primary focus:outline-none"
                          aria-label={`Quantity for ${item.name}`}
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product_id, Math.min(99, item.quantity + 1))}
                          className="px-2.5 py-1 font-body text-sm text-text-primary hover:bg-bg-light rounded-r-lg transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.product_id)}
                        className="font-body text-xs text-red-600 hover:text-red-800 transition-colors"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        Remove
                      </button>
                      <span className="ml-auto font-body text-sm font-bold text-text-primary">NPR {lineTotal}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ---- Right: Order Summary + Form --------------------- */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="font-heading text-lg font-bold text-text-primary mb-4">Order Summary</h2>
              <div className="space-y-2 font-body text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-text-primary">NPR {subtotal}</span>
                </div>
                {effectiveFulfillment === "delivery" ? (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Delivery Fee</span>
                    <span className="font-semibold text-amber-700 text-xs">To be confirmed</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Delivery Fee</span>
                    <span className="font-semibold text-text-secondary">Not applicable</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-semibold text-text-primary">
                    {effectiveFulfillment === "delivery" ? "Estimated Total" : "Total"}
                  </span>
                  <span className="text-lg font-bold text-primary">NPR {subtotal}</span>
                </div>
                {effectiveFulfillment === "delivery" && (
                  <p className="font-body text-[11px] text-text-secondary">Final total including delivery fee will be confirmed by our team.</p>
                )}
              </div>
            </div>

            {/* Fulfillment Method */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="font-heading text-lg font-bold text-text-primary mb-3">Fulfillment Method</h2>
              <div className="space-y-2">
                {/* Pickup */}
                <label className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  hasNonPickup ? "opacity-50 cursor-not-allowed border-slate-200" : effectiveFulfillment === "pickup" ? "border-primary bg-blue-50" : "border-slate-200 hover:border-primary/30"
                }`}>
                  <input
                    type="radio"
                    name="fulfillment"
                    value="pickup"
                    checked={effectiveFulfillment === "pickup"}
                    onChange={() => setFulfillment("pickup")}
                    disabled={hasNonPickup}
                    className="mt-0.5 h-4 w-4 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-body text-sm font-semibold text-text-primary">Collect from Shop</span>
                    <p className="font-body text-xs text-text-secondary mt-0.5">Pick up from our clinic / pharmacy counter.</p>
                    {hasNonPickup && (
                      <p className="font-body text-xs text-amber-700 mt-1">Unavailable: {nonPickupNames.join(", ")} {nonPickupNames.length === 1 ? "is" : "are"} delivery-only.</p>
                    )}
                  </div>
                </label>

                {/* Delivery */}
                <label className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  hasNonDeliverable ? "opacity-50 cursor-not-allowed border-slate-200" : effectiveFulfillment === "delivery" ? "border-primary bg-blue-50" : "border-slate-200 hover:border-primary/30"
                }`}>
                  <input
                    type="radio"
                    name="fulfillment"
                    value="delivery"
                    checked={effectiveFulfillment === "delivery"}
                    onChange={() => setFulfillment("delivery")}
                    disabled={hasNonDeliverable}
                    className="mt-0.5 h-4 w-4 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-body text-sm font-semibold text-text-primary">Home Delivery</span>
                    <p className="font-body text-xs text-text-secondary mt-0.5">We will deliver to your address.</p>
                    {hasNonDeliverable && (
                      <p className="font-body text-xs text-amber-700 mt-1">Unavailable: {nonDeliverableNames.join(", ")} {nonDeliverableNames.length === 1 ? "is" : "are"} pickup-only.</p>
                    )}
                  </div>
                </label>
              </div>

              {/* Delivery area + address */}
              {effectiveFulfillment === "delivery" && (
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">
                    <p className="font-body text-xs text-blue-800">
                      Delivery is currently available inside <span className="font-semibold">Kathmandu Valley</span> only. Our team will confirm delivery availability before processing your order.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="delivery-area" className="block font-body text-sm font-semibold text-text-primary mb-1">
                      Delivery Area <span className="text-danger">*</span>
                    </label>
                    <select
                      id="delivery-area"
                      value={deliveryArea}
                      onChange={(e) => setDeliveryArea(e.target.value)}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Select delivery area</option>
                      <option value="kathmandu_valley">Kathmandu Valley</option>
                    </select>
                  </div>
                  {deliveryArea && (
                    <>
                      <div>
                        <label htmlFor="delivery-address" className="block font-body text-sm font-semibold text-text-primary mb-1">
                          Delivery Address <span className="text-danger">*</span>
                        </label>
                        <textarea
                          id="delivery-address"
                          rows={2}
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Full delivery address within Kathmandu Valley"
                        />
                      </div>
                      <div>
                        <label htmlFor="delivery-notes" className="block font-body text-sm font-semibold text-text-primary mb-1">
                          Delivery Notes <span className="text-text-secondary font-normal">(optional)</span>
                        </label>
                        <input
                          id="delivery-notes"
                          type="text"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g. Ring the bell, leave at door"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Customer Info */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="font-heading text-lg font-bold text-text-primary mb-3">Your Details</h2>
              <div className="space-y-3">
                <div>
                  <label htmlFor="customer-name" className="block font-body text-sm font-semibold text-text-primary mb-1">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="customer-phone" className="block font-body text-sm font-semibold text-text-primary mb-1">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    id="customer-phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. 98XXXXXXXX"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="customer-email" className="block font-body text-sm font-semibold text-text-primary mb-1">
                    Email <span className="text-text-secondary font-normal">(optional)</span>
                  </label>
                  <input
                    id="customer-email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Payment Preference */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="font-heading text-lg font-bold text-text-primary mb-3">Payment Preference</h2>
              <div className="space-y-2">
                {availablePaymentOptions.map((opt) => (
                  <label key={opt} className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    paymentPreference === opt ? "border-primary bg-blue-50" : "border-slate-200 hover:border-primary/30"
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value={opt}
                      checked={paymentPreference === opt}
                      onChange={() => setPaymentPreference(opt)}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span className="font-body text-sm text-text-primary">{paymentLabels[opt]}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 font-body text-xs text-text-secondary">Online payment integration coming soon.</p>
            </div>

            {/* Additional notes */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="font-heading text-lg font-bold text-text-primary mb-3">Additional Notes</h2>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Any special requests or notes for your order"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="font-body text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="w-full rounded-xl bg-accent px-6 py-4 font-body text-base font-semibold text-white shadow-sm hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting Order…" : `Place Order Request — NPR ${subtotal}${effectiveFulfillment === "delivery" ? " (estimated)" : ""}`}
            </button>

            <p className="font-body text-xs text-text-secondary text-center">
              By placing this order, you agree that our team will contact you to confirm availability and payment.
            </p>
          </div>
        </div>
      </form>

      {/* Medicine safety disclaimer */}
      <div className="mt-12 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="font-body text-xs text-amber-800">
          <span className="font-semibold">Important:</span> Medicines should be taken only as directed. Please consult a healthcare professional before using any medication. Self-medication can be harmful.
        </p>
      </div>
    </section>
  );
}
