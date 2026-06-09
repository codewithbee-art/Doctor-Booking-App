"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PaymentMethodSnapshot {
  method_type: string;
  display_name: string;
  bank_name: string | null;
  account_holder: string | null;
  account_number: string | null;
  branch: string | null;
  wallet_name: string | null;
  wallet_number: string | null;
  qr_image_url: string | null;
  instructions: string | null;
}

interface OrderReceiptData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  fulfillment_method: string;
  delivery_address: string | null;
  order_status: string;
  payment_status: string;
  payment_preference: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  has_consultation_items: boolean;
  payment_methods_snapshot: PaymentMethodSnapshot[] | null;
  payment_reference: string | null;
  created_at: string;
  items: Array<{
    product_name_snapshot: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    requires_consultation_snapshot: boolean;
  }>;
}

interface BookingReceiptData {
  id: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  problem: string;
  appointment_date_ad: string;
  appointment_date_bs: string;
  appointment_time: string;
  booking_type: string;
  specialist_id: string | null;
  status: string;
  booking_reference: string | null;
  payment_methods_snapshot: PaymentMethodSnapshot[] | null;
  payment_status: string | null;
  consultation_mode: string | null;
  payment_preference: string | null;
  created_at: string;
  specialist_name: string | null;
  specialist_specialization: string | null;
  consultation_fee: number | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const CLINIC_NAME = "Arogya Health Clinic";
const CLINIC_PHONE = "01-5555555";
const CLINIC_ADDRESS = "Kathmandu, Nepal";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

/* ------------------------------------------------------------------ */
/*  Payment Methods Display                                            */
/* ------------------------------------------------------------------ */

function PaymentMethodsDisplay({ methods, reference }: { methods: PaymentMethodSnapshot[]; reference: string }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-body text-sm font-bold text-blue-900 mb-2">Payment Instructions</h3>
        <p className="font-body text-sm text-blue-800">
          Please include your reference number <span className="font-bold">{reference}</span> in the payment remarks/description when making your payment.
        </p>
        <p className="font-body text-xs text-blue-700 mt-2">
          Payment is confirmed only after verification by our clinic team.
        </p>
      </div>

      {methods.map((m, idx) => (
        <div key={idx} className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              m.method_type === "bank" ? "bg-blue-100 text-blue-700"
              : m.method_type === "wallet" ? "bg-purple-100 text-purple-700"
              : m.method_type === "cash" ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-600"
            }`}>
              {m.method_type === "bank" ? "Bank Transfer" : m.method_type === "wallet" ? "Digital Wallet" : m.method_type === "cash" ? "Cash" : "Other"}
            </span>
            <span className="font-body text-sm font-semibold text-slate-900">{m.display_name}</span>
          </div>
          <div className="font-body text-sm text-slate-600 space-y-0.5">
            {m.bank_name && <p><span className="font-medium">Bank:</span> {m.bank_name}{m.branch ? ` (${m.branch})` : ""}</p>}
            {m.account_holder && <p><span className="font-medium">Account Holder:</span> {m.account_holder}</p>}
            {m.account_number && <p><span className="font-medium">Account No:</span> {m.account_number}</p>}
            {m.wallet_name && <p><span className="font-medium">Wallet:</span> {m.wallet_name}{m.wallet_number ? ` — ${m.wallet_number}` : ""}</p>}
            {m.instructions && <p className="italic text-slate-500">{m.instructions}</p>}
          </div>
          {m.qr_image_url && (
            <div className="mt-3 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.qr_image_url} alt={`QR code for ${m.display_name}`} className="h-32 w-32 rounded border object-contain" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Order Receipt                                                      */
/* ------------------------------------------------------------------ */

function OrderReceipt({ data }: { data: OrderReceiptData }) {
  const isDelivery = data.fulfillment_method === "delivery";
  const needsConfirmation = data.has_consultation_items || isDelivery;
  const reference = data.payment_reference || data.order_number;

  return (
    <div className="receipt-content mx-auto max-w-2xl">
      {/* Header */}
      <div className="text-center mb-6 border-b border-slate-200 pb-6">
        <h1 className="font-heading text-xl font-bold text-slate-900">{CLINIC_NAME}</h1>
        <p className="font-body text-xs text-slate-500 mt-1">{CLINIC_ADDRESS} | {CLINIC_PHONE}</p>
        <h2 className="font-body text-lg font-semibold text-primary mt-3">Order Receipt / Invoice</h2>
      </div>

      {/* Order info */}
      <div className="grid grid-cols-2 gap-4 mb-6 font-body text-sm">
        <div>
          <p className="text-slate-500">Order Reference</p>
          <p className="font-bold text-slate-900">{reference}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-500">Date</p>
          <p className="font-medium text-slate-900">{formatDate(data.created_at)}</p>
        </div>
        <div>
          <p className="text-slate-500">Customer</p>
          <p className="font-medium text-slate-900">{data.customer_name}</p>
          <p className="text-slate-600">{data.customer_phone}</p>
          {data.customer_email && <p className="text-slate-600">{data.customer_email}</p>}
        </div>
        <div className="text-right">
          <p className="text-slate-500">Fulfillment</p>
          <p className="font-medium text-slate-900">{isDelivery ? "Home Delivery" : "Collect from Shop"}</p>
          {isDelivery && data.delivery_address && <p className="text-xs text-slate-600">{data.delivery_address}</p>}
        </div>
      </div>

      {/* Items table */}
      <div className="mb-6">
        <table className="w-full font-body text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 font-medium text-slate-600">Product</th>
              <th className="text-center py-2 font-medium text-slate-600">Qty</th>
              <th className="text-right py-2 font-medium text-slate-600">Price</th>
              <th className="text-right py-2 font-medium text-slate-600">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-100">
                <td className="py-2 text-slate-900">
                  {item.product_name_snapshot}
                  {item.requires_consultation_snapshot && (
                    <span className="ml-1 text-xs text-purple-600">(Rx)</span>
                  )}
                </td>
                <td className="py-2 text-center text-slate-700">{item.quantity}</td>
                <td className="py-2 text-right text-slate-700">NPR {item.unit_price}</td>
                <td className="py-2 text-right font-medium text-slate-900">NPR {item.subtotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mb-6 border-t border-slate-200 pt-4 space-y-1 font-body text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-medium text-slate-900">NPR {data.subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Delivery Fee</span>
          <span className="font-medium text-slate-900">
            {data.delivery_fee > 0 ? `NPR ${data.delivery_fee}` : isDelivery ? "To be confirmed" : "N/A"}
          </span>
        </div>
        <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2 mt-2">
          <span className="text-slate-900">{needsConfirmation ? "Estimated Total" : "Total"}</span>
          <span className="text-primary">NPR {data.total}</span>
        </div>
      </div>

      {/* Payment status */}
      <div className="mb-6 rounded-lg border border-slate-200 p-3 font-body text-sm">
        <div className="flex justify-between items-center">
          <span className="text-slate-600">Payment Status</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            data.payment_status === "paid" ? "bg-green-100 text-green-800"
            : data.payment_status === "unpaid" ? "bg-amber-100 text-amber-800"
            : "bg-slate-100 text-slate-700"
          }`}>
            {data.payment_status === "paid" ? "Paid" : data.payment_status === "unpaid" ? "Unpaid" : data.payment_status}
          </span>
        </div>
      </div>

      {/* Warnings */}
      {needsConfirmation && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 font-body text-sm text-amber-800">
          <p className="font-semibold mb-1">⚠️ Important</p>
          {isDelivery && (
            <p>• Do not pay until our team confirms the delivery fee and final total.</p>
          )}
          {data.has_consultation_items && (
            <p>• This order contains consultation-required medicine. Do not pay until the doctor reviews and confirms your order.</p>
          )}
        </div>
      )}

      {/* Payment methods */}
      {data.payment_methods_snapshot && data.payment_methods_snapshot.length > 0 && data.payment_status !== "paid" && (
        <PaymentMethodsDisplay methods={data.payment_methods_snapshot} reference={reference} />
      )}

      {/* Footer */}
      <div className="mt-8 border-t border-slate-200 pt-4 text-center font-body text-xs text-slate-400">
        <p>Thank you for your order. For queries, call {CLINIC_PHONE}.</p>
        <p className="mt-1">This receipt was generated on {formatDate(new Date().toISOString())}.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Booking Receipt                                                    */
/* ------------------------------------------------------------------ */

function BookingReceipt({ data }: { data: BookingReceiptData }) {
  const reference = data.booking_reference || data.id.slice(0, 8).toUpperCase();
  const typeLabel = data.booking_type === "specialist" ? "Specialist Appointment" : data.booking_type === "counselling" ? "Private Counselling" : "Appointment";
  const fee = data.consultation_fee;

  return (
    <div className="receipt-content mx-auto max-w-2xl">
      {/* Header */}
      <div className="text-center mb-6 border-b border-slate-200 pb-6">
        <h1 className="font-heading text-xl font-bold text-slate-900">{CLINIC_NAME}</h1>
        <p className="font-body text-xs text-slate-500 mt-1">{CLINIC_ADDRESS} | {CLINIC_PHONE}</p>
        <h2 className="font-body text-lg font-semibold text-primary mt-3">Booking Receipt</h2>
      </div>

      {/* Booking info */}
      <div className="grid grid-cols-2 gap-4 mb-6 font-body text-sm">
        <div>
          <p className="text-slate-500">Booking Reference</p>
          <p className="font-bold text-slate-900">{reference}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-500">Booked On</p>
          <p className="font-medium text-slate-900">{formatDate(data.created_at)}</p>
        </div>
        <div>
          <p className="text-slate-500">Patient</p>
          <p className="font-medium text-slate-900">{data.patient_name}</p>
          <p className="text-slate-600">{data.patient_phone}</p>
          {data.patient_email && <p className="text-slate-600">{data.patient_email}</p>}
        </div>
        <div className="text-right">
          <p className="text-slate-500">Type</p>
          <p className="font-medium text-slate-900">{typeLabel}</p>
        </div>
      </div>

      {/* Appointment details */}
      <div className="mb-6 rounded-lg border border-slate-200 p-4 font-body text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-600">Appointment Date</span>
          <span className="font-medium text-slate-900">
            {data.appointment_date_bs && `${data.appointment_date_bs} BS / `}{formatDate(data.appointment_date_ad)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Time</span>
          <span className="font-medium text-slate-900">{formatTime(data.appointment_time)}</span>
        </div>
        {data.specialist_name && (
          <div className="flex justify-between">
            <span className="text-slate-600">Specialist</span>
            <span className="font-medium text-slate-900">{data.specialist_name}{data.specialist_specialization ? ` (${data.specialist_specialization})` : ""}</span>
          </div>
        )}
        {data.consultation_mode && (
          <div className="flex justify-between">
            <span className="text-slate-600">Consultation Mode</span>
            <span className="font-medium text-slate-900 capitalize">{data.consultation_mode.replace("_", " ")}</span>
          </div>
        )}
        {fee != null && fee > 0 && (
          <div className="flex justify-between border-t border-slate-100 pt-2 mt-2">
            <span className="text-slate-600 font-medium">Consultation Fee</span>
            <span className="font-bold text-primary">NPR {fee}</span>
          </div>
        )}
        {fee === 0 && (
          <div className="flex justify-between border-t border-slate-100 pt-2 mt-2">
            <span className="text-slate-600 font-medium">Consultation Fee</span>
            <span className="font-bold text-green-700">Free</span>
          </div>
        )}
      </div>

      {/* Payment status */}
      {data.payment_status && (
        <div className="mb-6 rounded-lg border border-slate-200 p-3 font-body text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Payment Status</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              data.payment_status === "paid" ? "bg-green-100 text-green-800"
              : data.payment_status === "unpaid" ? "bg-amber-100 text-amber-800"
              : "bg-slate-100 text-slate-700"
            }`}>
              {data.payment_status === "paid" ? "Paid" : data.payment_status === "unpaid" ? "Unpaid" : data.payment_status}
            </span>
          </div>
        </div>
      )}

      {/* Payment methods */}
      {data.payment_methods_snapshot && data.payment_methods_snapshot.length > 0 && data.payment_status !== "paid" && (
        <PaymentMethodsDisplay methods={data.payment_methods_snapshot} reference={reference} />
      )}

      {/* Footer */}
      <div className="mt-8 border-t border-slate-200 pt-4 text-center font-body text-xs text-slate-400">
        <p>Thank you for booking with us. For queries, call {CLINIC_PHONE}.</p>
        <p className="mt-1">This receipt was generated on {formatDate(new Date().toISOString())}.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Receipt Page                                                  */
/* ------------------------------------------------------------------ */

function ReceiptContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") as "order" | "booking" | null;
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderReceiptData | null>(null);
  const [bookingData, setBookingData] = useState<BookingReceiptData | null>(null);

  useEffect(() => {
    if (!type || !id) {
      setError("Invalid receipt link.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/receipt?type=${type}&id=${id}`);
        const json = await res.json();
        if (!json.success) {
          setError(json.error || "Receipt not found.");
          return;
        }
        if (json.receipt_type === "order") setOrderData(json.data);
        if (json.receipt_type === "booking") setBookingData(json.data);
      } catch {
        setError("Failed to load receipt.");
      } finally {
        setLoading(false);
      }
    })();
  }, [type, id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="font-body text-lg font-semibold text-slate-700">{error}</p>
          <p className="font-body text-sm text-slate-500 mt-2">Please check the receipt link and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation bar */}
      <div className="print:hidden sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.href = "/";
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 font-body text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>
            <h1 className="font-body text-sm font-semibold text-slate-700">Receipt</h1>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            Print / Download
          </button>
        </div>
      </div>

      <div className="px-4 py-8 print:py-4">
        {orderData && <OrderReceipt data={orderData} />}
        {bookingData && <BookingReceipt data={bookingData} />}
      </div>
    </main>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <ReceiptContent />
    </Suspense>
  );
}
