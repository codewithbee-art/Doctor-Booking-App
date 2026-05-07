/**
 * Normalize a phone number for consistent matching.
 *
 * - Strips spaces, dashes, dots, and parentheses
 * - Removes leading +977 or 977 country code prefix (Nepal)
 * - Returns digits-only string
 *
 * Examples:
 *   "+977-9841234567"  → "9841234567"
 *   "984 123 4567"     → "9841234567"
 *   "9841234567"       → "9841234567"
 *   "+977 01-4123456"  → "014123456"
 */
export function normalizePhone(raw: string): string {
  // Strip all non-digit characters except leading +
  let digits = raw.replace(/[^\d+]/g, "");

  // Remove leading + if present
  if (digits.startsWith("+")) {
    digits = digits.slice(1);
  }

  // Remove Nepal country code prefix (977) if number is long enough
  if (digits.startsWith("977") && digits.length > 10) {
    digits = digits.slice(3);
  }

  return digits;
}
