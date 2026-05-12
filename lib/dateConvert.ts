/**
 * BS/AD date conversion utilities using nepali-date-converter.
 *
 * BS = Bikram Sambat (Nepali calendar)
 * AD = Gregorian calendar
 *
 * The package supports 2000–2099 BS (approximately 1943–2043 AD).
 */
import NepaliDate from "nepali-date-converter";
import { dateConfigMap } from "nepali-date-converter";

/* ------------------------------------------------------------------ */
/*  BS Month Names                                                     */
/* ------------------------------------------------------------------ */

export const BS_MONTHS = [
  "Baisakh",    // 1
  "Jestha",     // 2
  "Ashadh",     // 3
  "Shrawan",    // 4
  "Bhadra",     // 5
  "Ashwin",     // 6
  "Kartik",     // 7
  "Mangsir",    // 8
  "Poush",      // 9
  "Magh",       // 10
  "Falgun",     // 11
  "Chaitra",    // 12
];

// Keys used in dateConfigMap (may differ from display names)
const BS_MONTH_CONFIG_KEYS = [
  "Baisakh", "Jestha", "Asar", "Shrawan", "Bhadra", "Aswin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra",
];

/* ------------------------------------------------------------------ */
/*  Core conversion functions                                          */
/* ------------------------------------------------------------------ */

/**
 * Convert AD date string (YYYY-MM-DD) to BS date object.
 * Returns { year, month (0-indexed), day } or null if out of range.
 */
export function adToBS(adDateStr: string): { year: number; month: number; day: number } | null {
  try {
    const [y, m, d] = adDateStr.split("-").map(Number);
    const npDate = new NepaliDate(new Date(y, m - 1, d));
    return {
      year: npDate.getYear(),
      month: npDate.getMonth(), // 0-indexed
      day: npDate.getDate(),
    };
  } catch {
    return null;
  }
}

/**
 * Convert BS date (year, month 0-indexed, day) to AD date string (YYYY-MM-DD).
 * Returns null if out of range.
 */
export function bsToAD(bsYear: number, bsMonth: number, bsDay: number): string | null {
  try {
    const npDate = new NepaliDate(bsYear, bsMonth, bsDay);
    const adDate = npDate.toJsDate();
    const y = adDate.getFullYear();
    const m = String(adDate.getMonth() + 1).padStart(2, "0");
    const d = String(adDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  } catch {
    return null;
  }
}

/**
 * Format AD date string as BS display string.
 * Example: "2025-05-11" → "28 Baisakh 2082"
 */
export function formatBS(adDateStr: string): string {
  const bs = adToBS(adDateStr);
  if (!bs) return adDateStr;
  return `${bs.day} ${BS_MONTHS[bs.month]} ${bs.year}`;
}

/**
 * Format BS date as "YYYY-MM-DD" (BS) string for storage.
 * Example: (2082, 0, 28) → "2082-01-28"
 */
export function formatBSKey(bsYear: number, bsMonth: number, bsDay: number): string {
  return `${bsYear}-${String(bsMonth + 1).padStart(2, "0")}-${String(bsDay).padStart(2, "0")}`;
}

/**
 * Get the number of days in a given BS month (0-indexed).
 */
export function getBSDaysInMonth(bsYear: number, bsMonth: number): number {
  try {
    const yearConfig = (dateConfigMap as Record<string, Record<string, number>>)[String(bsYear)];
    if (yearConfig) {
      const monthKey = BS_MONTH_CONFIG_KEYS[bsMonth];
      if (monthKey && yearConfig[monthKey]) {
        return yearConfig[monthKey];
      }
    }
    return 30; // Safe fallback
  } catch {
    return 30;
  }
}

/**
 * Get the day of the week (0=Sun, 6=Sat) for the first day of a BS month.
 */
export function getBSFirstDayOfMonth(bsYear: number, bsMonth: number): number {
  try {
    const npDate = new NepaliDate(bsYear, bsMonth, 1);
    return npDate.toJsDate().getDay();
  } catch {
    return 0;
  }
}

/**
 * Get today's BS date.
 */
export function todayBS(): { year: number; month: number; day: number } {
  const npDate = new NepaliDate();
  return {
    year: npDate.getYear(),
    month: npDate.getMonth(),
    day: npDate.getDate(),
  };
}

/**
 * Get today's AD date string (YYYY-MM-DD).
 */
export function todayAD(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
