import { supabaseAdmin } from "@/lib/supabaseAdmin";

/* ------------------------------------------------------------------ */
/*  Reference Number Generation                                        */
/* ------------------------------------------------------------------ */

/**
 * Generate a unique reference number.
 * Formats:
 *   ORD-YYMMDD-XXXX  (shop orders — already uses order_number)
 *   REG-DDMMYYYY-XXXX (regular bookings)
 *   SPEC-DDMMYYYY-XXXX (specialist bookings)
 *   PRIV-DDMMYYYY-XXXX (private counselling bookings)
 */
export function generateBookingReference(type: "regular" | "specialist" | "counselling"): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const datePart = `${dd}${mm}${yyyy}`;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();

  const prefix = type === "specialist" ? "SPEC" : type === "counselling" ? "PRIV" : "REG";
  return `${prefix}-${datePart}-${rand}`;
}

/* ------------------------------------------------------------------ */
/*  Payment Methods Snapshot                                           */
/* ------------------------------------------------------------------ */

export interface PaymentMethodSnapshot {
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

/**
 * Fetch all currently enabled payment methods and return a snapshot array
 * suitable for storing as JSONB on an order or booking.
 */
export async function getPaymentMethodsSnapshot(): Promise<PaymentMethodSnapshot[]> {
  const { data, error } = await supabaseAdmin
    .from("payment_methods")
    .select("method_type, display_name, bank_name, account_holder, account_number, branch, wallet_name, wallet_number, qr_image_url, instructions")
    .eq("is_enabled", true)
    .order("display_order", { ascending: true });

  if (error || !data) {
    console.error("[getPaymentMethodsSnapshot]", error?.message);
    return [];
  }

  return data.map((m) => ({
    method_type: m.method_type,
    display_name: m.display_name,
    bank_name: m.bank_name || null,
    account_holder: m.account_holder || null,
    account_number: m.account_number || null,
    branch: m.branch || null,
    wallet_name: m.wallet_name || null,
    wallet_number: m.wallet_number || null,
    qr_image_url: m.qr_image_url || null,
    instructions: m.instructions || null,
  }));
}
