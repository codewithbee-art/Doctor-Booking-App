import { sendEmail, ADMIN_EMAIL } from "./resend";
import {
  OrderEmailData,
  orderCustomerHtml,
  orderCustomerText,
  orderAdminHtml,
  orderAdminText,
  BookingEmailData,
  bookingPatientHtml,
  bookingPatientText,
  bookingAdminHtml,
  bookingAdminText,
  SpecialistBookingEmailData,
  specialistPatientHtml,
  specialistPatientText,
  specialistAdminHtml,
  specialistAdminText,
} from "./templates";

export type { OrderEmailData, BookingEmailData, SpecialistBookingEmailData };

interface EmailResult {
  customerEmailSent: boolean;
  adminEmailSent: boolean;
}

/* ------------------------------------------------------------------ */
/*  Shop order emails                                                  */
/* ------------------------------------------------------------------ */

export async function sendOrderEmails(data: OrderEmailData): Promise<EmailResult> {
  const result: EmailResult = { customerEmailSent: false, adminEmailSent: false };

  // Customer email
  if (data.customerEmail) {
    try {
      result.customerEmailSent = await sendEmail({
        to: data.customerEmail,
        subject: `Order Received: ${data.orderNumber}`,
        html: orderCustomerHtml(data),
        text: orderCustomerText(data),
      });
    } catch (err) {
      console.error("[email] order customer email failed:", err instanceof Error ? err.message : String(err));
    }
  }

  // Admin email
  if (ADMIN_EMAIL) {
    try {
      result.adminEmailSent = await sendEmail({
        to: ADMIN_EMAIL,
        subject: `New Shop Order: ${data.orderNumber}`,
        html: orderAdminHtml(data),
        text: orderAdminText(data),
      });
    } catch (err) {
      console.error("[email] order admin email failed:", err instanceof Error ? err.message : String(err));
    }
  }

  return result;
}

/* ------------------------------------------------------------------ */
/*  Booking emails (regular + counselling)                             */
/* ------------------------------------------------------------------ */

export async function sendBookingEmails(data: BookingEmailData): Promise<EmailResult> {
  const result: EmailResult = { customerEmailSent: false, adminEmailSent: false };
  const isCounselling = data.bookingType === "counselling";

  // Patient email
  if (data.patientEmail) {
    try {
      const subjectPrefix = isCounselling
        ? "Private Counselling Booking Received"
        : "Booking Received";

      result.customerEmailSent = await sendEmail({
        to: data.patientEmail,
        subject: `${subjectPrefix}: ${data.bookingReference}`,
        html: bookingPatientHtml(data),
        text: bookingPatientText(data),
      });
    } catch (err) {
      console.error("[email] booking patient email failed:", err instanceof Error ? err.message : String(err));
    }
  }

  // Admin email
  if (ADMIN_EMAIL) {
    try {
      const subjectPrefix = isCounselling
        ? "New Private Counselling Booking"
        : "New Booking";

      result.adminEmailSent = await sendEmail({
        to: ADMIN_EMAIL,
        subject: `${subjectPrefix}: ${data.bookingReference}`,
        html: bookingAdminHtml(data),
        text: bookingAdminText(data),
      });
    } catch (err) {
      console.error("[email] booking admin email failed:", err instanceof Error ? err.message : String(err));
    }
  }

  return result;
}

/* ------------------------------------------------------------------ */
/*  Specialist booking emails                                          */
/* ------------------------------------------------------------------ */

export async function sendSpecialistBookingEmails(
  data: SpecialistBookingEmailData
): Promise<EmailResult> {
  const result: EmailResult = { customerEmailSent: false, adminEmailSent: false };

  // Patient email
  if (data.patientEmail) {
    try {
      result.customerEmailSent = await sendEmail({
        to: data.patientEmail,
        subject: `Specialist Booking Received: ${data.bookingReference}`,
        html: specialistPatientHtml(data),
        text: specialistPatientText(data),
      });
    } catch (err) {
      console.error("[email] specialist patient email failed:", err instanceof Error ? err.message : String(err));
    }
  }

  // Admin email
  if (ADMIN_EMAIL) {
    try {
      result.adminEmailSent = await sendEmail({
        to: ADMIN_EMAIL,
        subject: `New Specialist Booking: ${data.bookingReference}`,
        html: specialistAdminHtml(data),
        text: specialistAdminText(data),
      });
    } catch (err) {
      console.error("[email] specialist admin email failed:", err instanceof Error ? err.message : String(err));
    }
  }

  return result;
}
