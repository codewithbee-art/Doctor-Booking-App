import { SITE_URL } from "./resend";

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paymentMethodsHtml(
  methods: PaymentMethodSnapshot[] | null,
  reference: string
): string {
  if (!methods || methods.length === 0) return "";

  let html = `
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 8px;font-weight:bold;color:#1e3a8a;">Payment Instructions</p>
      <p style="margin:0 0 4px;color:#1e40af;">Please include your reference number <strong>${esc(reference)}</strong> in the payment remarks when making your payment.</p>
      <p style="margin:0;font-size:13px;color:#3b82f6;">Payment is confirmed only after verification by our clinic team.</p>
    </div>`;

  for (const m of methods) {
    html += `<div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin:8px 0;">`;
    html += `<p style="margin:0 0 4px;font-weight:bold;color:#1e293b;">${esc(m.display_name)}</p>`;
    if (m.method_type === "bank" && m.bank_name) {
      html += `<p style="margin:0;font-size:13px;color:#475569;">${esc(m.bank_name)}${m.branch ? ` — ${esc(m.branch)}` : ""}</p>`;
    }
    if (m.account_holder) {
      html += `<p style="margin:0;font-size:13px;color:#475569;">A/C Holder: ${esc(m.account_holder)}</p>`;
    }
    if (m.account_number) {
      html += `<p style="margin:0;font-size:13px;color:#475569;">A/C: ${esc(m.account_number)}</p>`;
    }
    if (m.method_type === "wallet" && m.wallet_name) {
      html += `<p style="margin:0;font-size:13px;color:#475569;">${esc(m.wallet_name)}: ${esc(m.wallet_number) || "—"}</p>`;
    }
    if (m.instructions) {
      html += `<p style="margin:4px 0 0;font-size:13px;font-style:italic;color:#64748b;">${esc(m.instructions)}</p>`;
    }
    if (m.qr_image_url) {
      html += `<p style="margin:8px 0 0;"><img src="${esc(m.qr_image_url)}" alt="QR Code" width="120" height="120" style="border:1px solid #e2e8f0;border-radius:4px;" /></p>`;
    }
    html += `</div>`;
  }

  return html;
}

function receiptButton(type: "order" | "booking", id: string): string {
  const url = `${SITE_URL}/receipt?type=${type}&id=${id}`;
  return `
    <div style="text-align:center;margin:24px 0;">
      <a href="${url}" style="display:inline-block;background:#1e40af;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:14px;">View Receipt</a>
    </div>`;
}

function adminLink(path: string, label: string): string {
  const url = `${SITE_URL}${path}`;
  return `<p style="margin:8px 0;"><a href="${url}" style="color:#1e40af;text-decoration:underline;font-size:13px;">${esc(label)}</a></p>`;
}

function layoutWrap(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;">
    <div style="background:#1e3a8a;padding:20px 24px;">
      <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:bold;">Arogya Health Clinic</h1>
    </div>
    <div style="padding:24px;">
      ${content}
    </div>
    <div style="background:#f1f5f9;padding:16px 24px;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:12px;color:#64748b;text-align:center;">Arogya Health Clinic &middot; Kathmandu, Nepal &middot; 01-5555555</p>
    </div>
  </div>
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/*  Shop Order — Customer                                              */
/* ------------------------------------------------------------------ */

export interface OrderEmailData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  fulfillmentMethod: string;
  deliveryAddress: string | null;
  deliveryNotes: string | null;
  paymentPreference: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  hasConsultationItems: boolean;
  paymentMethodsSnapshot: PaymentMethodSnapshot[] | null;
  items: Array<{
    product_name_snapshot: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    requires_consultation_snapshot: boolean;
  }>;
  createdAt: string;
}

export function orderCustomerHtml(d: OrderEmailData): string {
  let itemsHtml = `<table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0;">
    <tr style="background:#f1f5f9;"><th style="text-align:left;padding:8px;border:1px solid #e2e8f0;">Item</th><th style="text-align:center;padding:8px;border:1px solid #e2e8f0;">Qty</th><th style="text-align:right;padding:8px;border:1px solid #e2e8f0;">Price</th><th style="text-align:right;padding:8px;border:1px solid #e2e8f0;">Subtotal</th></tr>`;
  for (const item of d.items) {
    itemsHtml += `<tr>
      <td style="padding:8px;border:1px solid #e2e8f0;">${esc(item.product_name_snapshot)}${item.requires_consultation_snapshot ? ' <span style="color:#b45309;font-size:12px;">(Consultation required)</span>' : ""}</td>
      <td style="text-align:center;padding:8px;border:1px solid #e2e8f0;">${item.quantity}</td>
      <td style="text-align:right;padding:8px;border:1px solid #e2e8f0;">NPR ${item.unit_price.toLocaleString()}</td>
      <td style="text-align:right;padding:8px;border:1px solid #e2e8f0;">NPR ${item.subtotal.toLocaleString()}</td>
    </tr>`;
  }
  itemsHtml += `</table>`;

  let warnings = "";
  if (d.fulfillmentMethod === "delivery") {
    warnings += `<p style="background:#fef3c7;border:1px solid #fde68a;border-radius:6px;padding:10px;font-size:13px;color:#92400e;margin:8px 0;"><strong>Note:</strong> Please do not pay until admin confirms delivery fee and final total.</p>`;
  }
  if (d.hasConsultationItems) {
    warnings += `<p style="background:#fef3c7;border:1px solid #fde68a;border-radius:6px;padding:10px;font-size:13px;color:#92400e;margin:8px 0;"><strong>Note:</strong> Your order contains items that require consultation review. Please do not pay until consultation review and admin confirmation.</p>`;
  }

  const content = `
    <h2 style="margin:0 0 4px;color:#1e293b;font-size:20px;">Order Received</h2>
    <p style="margin:0 0 16px;color:#64748b;font-size:14px;">Thank you, ${esc(d.customerName)}. We have received your order.</p>

    <div style="background:#f1f5f9;border-radius:8px;padding:12px 16px;margin:0 0 16px;">
      <p style="margin:0;font-size:14px;color:#334155;"><strong>Order Number:</strong> ${esc(d.orderNumber)}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Date:</strong> ${formatDate(d.createdAt)}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Fulfillment:</strong> ${d.fulfillmentMethod === "delivery" ? "Home Delivery" : "Clinic Pickup"}</p>
      ${d.deliveryAddress ? `<p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Delivery Address:</strong> ${esc(d.deliveryAddress)}</p>` : ""}
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Payment Status:</strong> Unpaid</p>
    </div>

    ${itemsHtml}

    <div style="text-align:right;margin:8px 0 16px;font-size:14px;color:#334155;">
      <p style="margin:2px 0;"><strong>Subtotal:</strong> NPR ${d.subtotal.toLocaleString()}</p>
      ${d.deliveryFee > 0 ? `<p style="margin:2px 0;"><strong>Delivery Fee:</strong> NPR ${d.deliveryFee.toLocaleString()}</p>` : ""}
      <p style="margin:2px 0;font-size:16px;"><strong>Total:</strong> NPR ${d.total.toLocaleString()}</p>
    </div>

    ${warnings}

    ${paymentMethodsHtml(d.paymentMethodsSnapshot, d.orderNumber)}

    ${receiptButton("order", d.orderId)}
  `;
  return layoutWrap(content);
}

export function orderCustomerText(d: OrderEmailData): string {
  let text = `Order Received — ${d.orderNumber}\n\nThank you, ${d.customerName}.\n\n`;
  text += `Order Number: ${d.orderNumber}\nDate: ${formatDate(d.createdAt)}\nFulfillment: ${d.fulfillmentMethod === "delivery" ? "Home Delivery" : "Clinic Pickup"}\n`;
  if (d.deliveryAddress) text += `Delivery Address: ${d.deliveryAddress}\n`;
  text += `Payment Status: Unpaid\n\nItems:\n`;
  for (const item of d.items) {
    text += `- ${item.product_name_snapshot} x${item.quantity} — NPR ${item.subtotal}\n`;
  }
  text += `\nSubtotal: NPR ${d.subtotal}\nTotal: NPR ${d.total}\n`;
  if (d.fulfillmentMethod === "delivery") text += `\nNote: Please do not pay until admin confirms delivery fee and final total.\n`;
  if (d.hasConsultationItems) text += `\nNote: Your order contains items that require consultation review. Please do not pay until consultation review and admin confirmation.\n`;
  text += `\nReceipt: ${SITE_URL}/receipt?type=order&id=${d.orderId}\n`;
  text += `\nPlease include your reference number ${d.orderNumber} in the payment remarks.\nPayment is confirmed only after verification by our clinic team.\n`;
  return text;
}

/* ------------------------------------------------------------------ */
/*  Shop Order — Admin                                                 */
/* ------------------------------------------------------------------ */

export function orderAdminHtml(d: OrderEmailData): string {
  let itemsList = "";
  for (const item of d.items) {
    itemsList += `<li style="margin:2px 0;font-size:14px;">${esc(item.product_name_snapshot)} x${item.quantity} — NPR ${item.subtotal.toLocaleString()}${item.requires_consultation_snapshot ? ' <span style="color:#b45309;">(Consultation required)</span>' : ""}</li>`;
  }

  const content = `
    <h2 style="margin:0 0 4px;color:#1e293b;font-size:20px;">New Shop Order</h2>
    <p style="margin:0 0 16px;color:#64748b;font-size:14px;">A new order has been placed.</p>

    <div style="background:#f1f5f9;border-radius:8px;padding:12px 16px;margin:0 0 16px;">
      <p style="margin:0;font-size:14px;color:#334155;"><strong>Order Number:</strong> ${esc(d.orderNumber)}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Customer:</strong> ${esc(d.customerName)}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Phone:</strong> ${esc(d.customerPhone)}</p>
      ${d.customerEmail ? `<p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Email:</strong> ${esc(d.customerEmail)}</p>` : ""}
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Fulfillment:</strong> ${d.fulfillmentMethod === "delivery" ? "Home Delivery" : "Clinic Pickup"}</p>
      ${d.deliveryAddress ? `<p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Address:</strong> ${esc(d.deliveryAddress)}</p>` : ""}
      ${d.deliveryNotes ? `<p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Notes:</strong> ${esc(d.deliveryNotes)}</p>` : ""}
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Total:</strong> NPR ${d.total.toLocaleString()}</p>
    </div>

    ${d.hasConsultationItems ? `<p style="background:#fef3c7;border:1px solid #fde68a;border-radius:6px;padding:10px;font-size:13px;color:#92400e;"><strong>⚠ This order contains items requiring consultation review.</strong></p>` : ""}

    <ul style="padding-left:20px;">${itemsList}</ul>

    ${adminLink("/admin/orders", "View in Admin Panel")}
    ${receiptButton("order", d.orderId)}
  `;
  return layoutWrap(content);
}

export function orderAdminText(d: OrderEmailData): string {
  let text = `New Shop Order — ${d.orderNumber}\n\n`;
  text += `Customer: ${d.customerName}\nPhone: ${d.customerPhone}\n`;
  if (d.customerEmail) text += `Email: ${d.customerEmail}\n`;
  text += `Fulfillment: ${d.fulfillmentMethod}\nTotal: NPR ${d.total}\n\nItems:\n`;
  for (const item of d.items) {
    text += `- ${item.product_name_snapshot} x${item.quantity} — NPR ${item.subtotal}\n`;
  }
  if (d.hasConsultationItems) text += `\n⚠ Contains items requiring consultation review.\n`;
  text += `\nAdmin: ${SITE_URL}/admin/orders\n`;
  return text;
}

/* ------------------------------------------------------------------ */
/*  Booking — Patient (regular + counselling)                          */
/* ------------------------------------------------------------------ */

export interface BookingEmailData {
  bookingId: string;
  bookingReference: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string | null;
  problem: string;
  appointmentDateAd: string;
  appointmentDateBs: string;
  appointmentTime: string;
  bookingType: string;
  paymentStatus: string | null;
  consultationMode: string | null;
  paymentPreference: string | null;
  paymentMethodsSnapshot: PaymentMethodSnapshot[] | null;
  createdAt: string;
}

function modeLabel(m: string | null): string {
  if (m === "phone") return "Phone Call";
  if (m === "video") return "Video Call";
  if (m === "in_person") return "In-Person";
  return "—";
}

export function bookingPatientHtml(d: BookingEmailData): string {
  const isCounselling = d.bookingType === "counselling";
  const typeLabel = isCounselling ? "Private Counselling Booking" : "Booking";

  let detailsHtml = `
    <div style="background:#f1f5f9;border-radius:8px;padding:12px 16px;margin:0 0 16px;">
      <p style="margin:0;font-size:14px;color:#334155;"><strong>Reference:</strong> ${esc(d.bookingReference)}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Date:</strong> ${esc(d.appointmentDateBs)} (${formatDate(d.appointmentDateAd)})</p>
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Time:</strong> ${formatTime(d.appointmentTime)}</p>`;

  if (isCounselling) {
    detailsHtml += `<p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Mode:</strong> ${modeLabel(d.consultationMode)}</p>`;
  }

  detailsHtml += `<p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Status:</strong> Pending Confirmation</p>`;
  detailsHtml += `</div>`;

  const content = `
    <h2 style="margin:0 0 4px;color:#1e293b;font-size:20px;">${typeLabel} Received</h2>
    <p style="margin:0 0 16px;color:#64748b;font-size:14px;">Thank you, ${esc(d.patientName)}. ${isCounselling ? "Your private counselling booking has been received." : "Your booking has been received."}</p>
    ${detailsHtml}
    ${isCounselling ? `<p style="font-size:13px;color:#64748b;margin:8px 0;">Your booking details are kept confidential. The clinic team will confirm your appointment.</p>` : ""}
    ${paymentMethodsHtml(d.paymentMethodsSnapshot, d.bookingReference)}
    ${receiptButton("booking", d.bookingId)}
  `;
  return layoutWrap(content);
}

export function bookingPatientText(d: BookingEmailData): string {
  const isCounselling = d.bookingType === "counselling";
  let text = `${isCounselling ? "Private Counselling Booking" : "Booking"} Received — ${d.bookingReference}\n\n`;
  text += `Thank you, ${d.patientName}.\n\n`;
  text += `Reference: ${d.bookingReference}\n`;
  text += `Date: ${d.appointmentDateBs} (${formatDate(d.appointmentDateAd)})\n`;
  text += `Time: ${formatTime(d.appointmentTime)}\n`;
  if (isCounselling) text += `Mode: ${modeLabel(d.consultationMode)}\n`;
  text += `Status: Pending Confirmation\n`;
  text += `\nReceipt: ${SITE_URL}/receipt?type=booking&id=${d.bookingId}\n`;
  if (d.bookingReference) {
    text += `\nPlease include your reference number ${d.bookingReference} in payment remarks.\n`;
    text += `Payment is confirmed only after verification by our clinic team.\n`;
  }
  return text;
}

/* ------------------------------------------------------------------ */
/*  Booking — Admin (regular + counselling)                            */
/* ------------------------------------------------------------------ */

export function bookingAdminHtml(d: BookingEmailData): string {
  const isCounselling = d.bookingType === "counselling";
  const typeLabel = isCounselling ? "Private Counselling Booking" : "Booking";

  const content = `
    <h2 style="margin:0 0 4px;color:#1e293b;font-size:20px;">New ${typeLabel}</h2>
    <p style="margin:0 0 16px;color:#64748b;font-size:14px;">A new ${typeLabel.toLowerCase()} has been received.</p>

    <div style="background:#f1f5f9;border-radius:8px;padding:12px 16px;margin:0 0 16px;">
      <p style="margin:0;font-size:14px;color:#334155;"><strong>Reference:</strong> ${esc(d.bookingReference)}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Patient:</strong> ${esc(d.patientName)}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Phone:</strong> ${esc(d.patientPhone)}</p>
      ${d.patientEmail ? `<p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Email:</strong> ${esc(d.patientEmail)}</p>` : ""}
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Date:</strong> ${esc(d.appointmentDateBs)} (${formatDate(d.appointmentDateAd)})</p>
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Time:</strong> ${formatTime(d.appointmentTime)}</p>
      ${isCounselling ? `<p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Mode:</strong> ${modeLabel(d.consultationMode)}</p>` : ""}
      ${!isCounselling && d.problem ? `<p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Problem:</strong> ${esc(d.problem)}</p>` : ""}
    </div>

    ${isCounselling ? `<p style="font-size:13px;color:#64748b;margin:8px 0;">This is a private counselling request. View full details securely in the admin panel.</p>` : ""}

    ${adminLink("/admin/dashboard", "View in Admin Panel")}
  `;
  return layoutWrap(content);
}

export function bookingAdminText(d: BookingEmailData): string {
  const isCounselling = d.bookingType === "counselling";
  let text = `New ${isCounselling ? "Private Counselling Booking" : "Booking"} — ${d.bookingReference}\n\n`;
  text += `Patient: ${d.patientName}\nPhone: ${d.patientPhone}\n`;
  if (d.patientEmail) text += `Email: ${d.patientEmail}\n`;
  text += `Date: ${d.appointmentDateBs} (${formatDate(d.appointmentDateAd)})\n`;
  text += `Time: ${formatTime(d.appointmentTime)}\n`;
  if (isCounselling) text += `Mode: ${modeLabel(d.consultationMode)}\n`;
  if (!isCounselling && d.problem) text += `Problem: ${d.problem}\n`;
  text += `\nAdmin: ${SITE_URL}/admin/dashboard\n`;
  return text;
}

/* ------------------------------------------------------------------ */
/*  Specialist Booking — Patient                                       */
/* ------------------------------------------------------------------ */

export interface SpecialistBookingEmailData {
  bookingId: string;
  bookingReference: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string | null;
  problem: string;
  appointmentDateAd: string;
  appointmentDateBs: string;
  appointmentTime: string;
  specialistName: string;
  specialization?: string | null;
  consultationFee: number | null;
  paymentMethodsSnapshot: PaymentMethodSnapshot[] | null;
  createdAt: string;
}

export function specialistPatientHtml(d: SpecialistBookingEmailData): string {
  const content = `
    <h2 style="margin:0 0 4px;color:#1e293b;font-size:20px;">Specialist Booking Received</h2>
    <p style="margin:0 0 16px;color:#64748b;font-size:14px;">Thank you, ${esc(d.patientName)}. Your specialist booking has been received.</p>

    <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:12px 16px;margin:0 0 12px;">
      <p style="margin:0;font-size:14px;color:#5b21b6;font-weight:bold;">${esc(d.specialistName)}</p>
      ${d.specialization ? `<p style="margin:2px 0 0;font-size:13px;color:#7c3aed;">${esc(d.specialization)}</p>` : ""}
      <p style="margin:4px 0 0;font-size:13px;color:#6d28d9;">Fee: ${d.consultationFee != null ? `NPR ${d.consultationFee.toLocaleString()}` : "Free Consultation"}</p>
    </div>

    <div style="background:#f1f5f9;border-radius:8px;padding:12px 16px;margin:0 0 16px;">
      <p style="margin:0;font-size:14px;color:#334155;"><strong>Reference:</strong> ${esc(d.bookingReference)}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Date:</strong> ${esc(d.appointmentDateBs)} (${formatDate(d.appointmentDateAd)})</p>
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Time:</strong> ${formatTime(d.appointmentTime)}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Status:</strong> Pending Confirmation</p>
    </div>

    ${paymentMethodsHtml(d.paymentMethodsSnapshot, d.bookingReference)}
    ${receiptButton("booking", d.bookingId)}
  `;
  return layoutWrap(content);
}

export function specialistPatientText(d: SpecialistBookingEmailData): string {
  let text = `Specialist Booking Received — ${d.bookingReference}\n\n`;
  text += `Thank you, ${d.patientName}.\n\n`;
  text += `Specialist: ${d.specialistName}\n`;
  if (d.specialization) text += `Specialization: ${d.specialization}\n`;
  text += `Fee: ${d.consultationFee != null ? `NPR ${d.consultationFee}` : "Free Consultation"}\n\n`;
  text += `Reference: ${d.bookingReference}\n`;
  text += `Date: ${d.appointmentDateBs} (${formatDate(d.appointmentDateAd)})\n`;
  text += `Time: ${formatTime(d.appointmentTime)}\n`;
  text += `Status: Pending Confirmation\n`;
  text += `\nReceipt: ${SITE_URL}/receipt?type=booking&id=${d.bookingId}\n`;
  text += `\nPlease include your reference number ${d.bookingReference} in payment remarks.\nPayment is confirmed only after verification by our clinic team.\n`;
  return text;
}

/* ------------------------------------------------------------------ */
/*  Specialist Booking — Admin                                         */
/* ------------------------------------------------------------------ */

export function specialistAdminHtml(d: SpecialistBookingEmailData): string {
  const content = `
    <h2 style="margin:0 0 4px;color:#1e293b;font-size:20px;">New Specialist Booking</h2>
    <p style="margin:0 0 16px;color:#64748b;font-size:14px;">A new specialist booking has been received.</p>

    <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:12px 16px;margin:0 0 12px;">
      <p style="margin:0;font-size:14px;color:#5b21b6;font-weight:bold;">${esc(d.specialistName)}</p>
      ${d.specialization ? `<p style="margin:2px 0 0;font-size:13px;color:#7c3aed;">${esc(d.specialization)}</p>` : ""}
      <p style="margin:4px 0 0;font-size:13px;color:#6d28d9;">Fee: ${d.consultationFee != null ? `NPR ${d.consultationFee.toLocaleString()}` : "Free Consultation"}</p>
    </div>

    <div style="background:#f1f5f9;border-radius:8px;padding:12px 16px;margin:0 0 16px;">
      <p style="margin:0;font-size:14px;color:#334155;"><strong>Reference:</strong> ${esc(d.bookingReference)}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Patient:</strong> ${esc(d.patientName)}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Phone:</strong> ${esc(d.patientPhone)}</p>
      ${d.patientEmail ? `<p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Email:</strong> ${esc(d.patientEmail)}</p>` : ""}
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Date:</strong> ${esc(d.appointmentDateBs)} (${formatDate(d.appointmentDateAd)})</p>
      <p style="margin:4px 0 0;font-size:14px;color:#334155;"><strong>Time:</strong> ${formatTime(d.appointmentTime)}</p>
    </div>

    ${adminLink("/admin/specialist-bookings", "View in Admin Panel")}
  `;
  return layoutWrap(content);
}

export function specialistAdminText(d: SpecialistBookingEmailData): string {
  let text = `New Specialist Booking — ${d.bookingReference}\n\n`;
  text += `Specialist: ${d.specialistName}\n`;
  if (d.specialization) text += `Specialization: ${d.specialization}\n`;
  text += `Fee: ${d.consultationFee != null ? `NPR ${d.consultationFee}` : "Free Consultation"}\n\n`;
  text += `Patient: ${d.patientName}\nPhone: ${d.patientPhone}\n`;
  if (d.patientEmail) text += `Email: ${d.patientEmail}\n`;
  text += `Date: ${d.appointmentDateBs} (${formatDate(d.appointmentDateAd)})\n`;
  text += `Time: ${formatTime(d.appointmentTime)}\n`;
  text += `\nAdmin: ${SITE_URL}/admin/specialist-bookings\n`;
  return text;
}
