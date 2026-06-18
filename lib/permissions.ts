import type { StaffRole } from "@/types/database";

/* ------------------------------------------------------------------ */
/*  Permission Keys                                                     */
/* ------------------------------------------------------------------ */

export const PERMISSION_KEYS = [
  "dashboard",
  "bookings",
  "patients",
  "patient_visits",
  "availability",
  "specialists",
  "specialist_bookings",
  "blog",
  "shop",
  "orders",
  "shop_analytics",
  "payment_methods",
  "settings_clinic_info",
  "settings_email",
  "settings_notifications",
  "settings_shop",
  "settings_seo",
  "settings_security",
  "settings_system",
  "staff",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export type PermissionSet = Record<PermissionKey, boolean>;

/* ------------------------------------------------------------------ */
/*  Owner-only & Settings grouping constants                            */
/* ------------------------------------------------------------------ */

/** Permission keys that must always be false for non-owner staff. */
export const OWNER_ONLY_KEYS: PermissionKey[] = [
  "staff",
  "settings_email",
  "settings_security",
  "settings_system",
];

/** All Settings-related permission keys (for sidebar/tab visibility). */
export const SETTINGS_PERMISSION_KEYS: PermissionKey[] = [
  "settings_clinic_info",
  "payment_methods",
  "settings_email",
  "settings_notifications",
  "settings_shop",
  "settings_seo",
  "settings_security",
  "settings_system",
];

/* ------------------------------------------------------------------ */
/*  Permission Labels (for UI)                                          */
/* ------------------------------------------------------------------ */

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  dashboard: "Dashboard",
  bookings: "Bookings",
  patients: "Patients",
  patient_visits: "Patient Visits",
  availability: "Availability",
  specialists: "Specialists",
  specialist_bookings: "Specialist Bookings",
  blog: "Blog",
  shop: "Shop / Products",
  orders: "Orders",
  shop_analytics: "Shop Analytics",
  payment_methods: "Payment Methods",
  settings_clinic_info: "Clinic Info",
  settings_email: "Email Settings",
  settings_notifications: "Admin Notifications",
  settings_shop: "Shop Settings",
  settings_seo: "SEO / Metadata",
  settings_security: "Security & Account",
  settings_system: "System Settings",
  staff: "Staff Management",
};

/* ------------------------------------------------------------------ */
/*  Role Permission Templates                                           */
/* ------------------------------------------------------------------ */

const ALL_TRUE: PermissionSet = {
  dashboard: true,
  bookings: true,
  patients: true,
  patient_visits: true,
  availability: true,
  specialists: true,
  specialist_bookings: true,
  blog: true,
  shop: true,
  orders: true,
  shop_analytics: true,
  payment_methods: true,
  settings_clinic_info: true,
  settings_email: true,
  settings_notifications: true,
  settings_shop: true,
  settings_seo: true,
  settings_security: true,
  settings_system: true,
  staff: true,
};

export const ROLE_PERMISSION_TEMPLATES: Record<StaffRole, PermissionSet> = {
  owner: { ...ALL_TRUE },
  doctor: {
    dashboard: true,
    bookings: true,
    patients: true,
    patient_visits: true,
    availability: true,
    specialists: true,
    specialist_bookings: true,
    blog: false,
    shop: false,
    orders: false,
    shop_analytics: false,
    payment_methods: false,
    settings_clinic_info: false,
    settings_email: false,
    settings_notifications: false,
    settings_shop: false,
    settings_seo: false,
    settings_security: false,
    settings_system: false,
    staff: false,
  },
  receptionist: {
    dashboard: true,
    bookings: true,
    patients: true,
    patient_visits: true,
    availability: true,
    specialists: true,
    specialist_bookings: true,
    blog: false,
    shop: false,
    orders: false,
    shop_analytics: false,
    payment_methods: false,
    settings_clinic_info: false,
    settings_email: false,
    settings_notifications: false,
    settings_shop: false,
    settings_seo: false,
    settings_security: false,
    settings_system: false,
    staff: false,
  },
  inventory_manager: {
    dashboard: true,
    bookings: false,
    patients: false,
    patient_visits: false,
    availability: false,
    specialists: false,
    specialist_bookings: false,
    blog: false,
    shop: true,
    orders: true,
    shop_analytics: true,
    payment_methods: false,
    settings_clinic_info: false,
    settings_email: false,
    settings_notifications: false,
    settings_shop: false,
    settings_seo: false,
    settings_security: false,
    settings_system: false,
    staff: false,
  },
  content_editor: {
    dashboard: true,
    bookings: false,
    patients: false,
    patient_visits: false,
    availability: false,
    specialists: false,
    specialist_bookings: false,
    blog: true,
    shop: false,
    orders: false,
    shop_analytics: false,
    payment_methods: false,
    settings_clinic_info: false,
    settings_email: false,
    settings_notifications: false,
    settings_shop: false,
    settings_seo: false,
    settings_security: false,
    settings_system: false,
    staff: false,
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Get the default permission set for a given role.
 */
export function defaultPermissionsForRole(role: StaffRole): PermissionSet {
  return { ...ROLE_PERMISSION_TEMPLATES[role] };
}

/**
 * Normalize a raw permissions object (from DB JSONB) into a complete PermissionSet.
 * Missing keys default to false for non-owner safety.
 * Unknown keys are stripped.
 */
export function normalizePermissions(raw: unknown): PermissionSet {
  const result: PermissionSet = {} as PermissionSet;
  const obj = (raw && typeof raw === "object" && !Array.isArray(raw)) ? raw as Record<string, unknown> : {};

  for (const key of PERMISSION_KEYS) {
    result[key] = obj[key] === true;
  }

  return result;
}

/**
 * Force owner-only permission keys to false for non-owner roles.
 */
export function enforceOwnerOnly(perms: PermissionSet, role: StaffRole): PermissionSet {
  if (role === "owner") return perms;
  const enforced = { ...perms };
  for (const key of OWNER_ONLY_KEYS) {
    enforced[key] = false;
  }
  return enforced;
}

/**
 * Check if a staff profile has a specific permission.
 * Owner always returns true regardless of stored permissions.
 */
export function hasPermission(
  profile: { role: string; permissions?: unknown } | null | undefined,
  key: PermissionKey
): boolean {
  if (!profile) return false;

  // Owner always has full access
  if (profile.role === "owner") return true;

  // Normalize and check
  const perms = normalizePermissions(profile.permissions);
  return perms[key] === true;
}
