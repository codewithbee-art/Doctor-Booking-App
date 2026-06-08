import { Resend } from "resend";

/**
 * Resend client — server-side only.
 * Returns null if RESEND_API_KEY is not configured.
 */
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@example.com";
export const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const REPLY_TO = process.env.CLINIC_REPLY_TO_EMAIL || undefined;

/**
 * Send an email via Resend. Returns true on success, false on failure.
 * Never throws — failures are logged server-side and swallowed.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured — skipping email.");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
    });

    if (error) {
      console.error("[email] Resend error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      "[email] send failed:",
      err instanceof Error ? err.message : String(err)
    );
    return false;
  }
}
