"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStaffProfile } from "@/lib/useStaffProfile";
import AdminAccessDenied from "@/components/AdminAccessDenied";
import AdminInactive from "@/components/AdminInactive";
import AdminPageHeader from "@/components/AdminPageHeader";
import { adminFetch } from "@/lib/adminFetch";
import {
  PERMISSION_KEYS,
  PERMISSION_LABELS,
  OWNER_ONLY_KEYS,
  SETTINGS_PERMISSION_KEYS,
  defaultPermissionsForRole,
  type PermissionKey,
} from "@/lib/permissions";
import type { StaffRole } from "@/types/database";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StaffMember {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  role: string;
  phone: string | null;
  is_active: boolean;
  permissions: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "doctor", label: "Doctor" },
  { value: "receptionist", label: "Receptionist" },
  { value: "inventory_manager", label: "Inventory Manager" },
  { value: "content_editor", label: "Content Editor" },
];

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  doctor: "Doctor",
  receptionist: "Receptionist",
  inventory_manager: "Inventory Manager",
  content_editor: "Content Editor",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

/** Permission keys that are NOT inside the Settings group and NOT staff. */
const TOP_LEVEL_KEYS: PermissionKey[] = PERMISSION_KEYS.filter(
  (k) => !SETTINGS_PERMISSION_KEYS.includes(k) && k !== "staff"
);

/** Delegatable settings keys (non-owner can toggle). */
const DELEGATABLE_SETTINGS: PermissionKey[] = SETTINGS_PERMISSION_KEYS.filter(
  (k) => !OWNER_ONLY_KEYS.includes(k)
);

/** Settings group parent checkbox component */
function SettingsGroupCheckbox({
  role,
  perms,
  onPermChange,
  disabled,
}: {
  role: string;
  perms: Record<string, boolean>;
  onPermChange: (key: string, value: boolean) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const parentRef = useRef<HTMLInputElement>(null);

  const isOwner = role === "owner";
  const selectableKeys = isOwner ? SETTINGS_PERMISSION_KEYS : DELEGATABLE_SETTINGS;
  const checkedCount = selectableKeys.filter((k) => perms[k] === true).length;
  const allChecked = checkedCount === selectableKeys.length && selectableKeys.length > 0;
  const noneChecked = checkedCount === 0;
  const indeterminate = !allChecked && !noneChecked;

  useEffect(() => {
    if (parentRef.current) {
      parentRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  function handleParentToggle() {
    const newVal = !allChecked;
    for (const k of selectableKeys) {
      onPermChange(k, newVal);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50">
      <div className="flex items-center gap-2 px-3 py-2">
        <input
          ref={parentRef}
          type="checkbox"
          checked={allChecked}
          onChange={handleParentToggle}
          disabled={disabled || selectableKeys.length === 0}
          className="rounded border-border text-primary focus:ring-primary h-4 w-4"
        />
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="flex flex-1 items-center gap-1 font-body text-xs font-semibold text-text-primary"
        >
          Settings
          <svg className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-200 px-3 py-2 grid grid-cols-2 gap-2">
          {SETTINGS_PERMISSION_KEYS.map((key) => {
            const isOwnerOnly = OWNER_ONLY_KEYS.includes(key);
            const lockedForNonOwner = !isOwner && isOwnerOnly;
            return (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOwner ? true : (perms[key] ?? false)}
                  onChange={(e) => onPermChange(key, e.target.checked)}
                  disabled={disabled || lockedForNonOwner || isOwner}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span className="font-body text-xs text-text-primary">
                  {PERMISSION_LABELS[key]}
                  {lockedForNonOwner && <span className="ml-1 text-text-secondary/60">(Owner only)</span>}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminStaffPage() {
  const router = useRouter();
  const { loading: staffLoading, profile: myProfile, noSession, inactive, hasRole } = useStaffProfile();
  const [checking, setChecking] = useState(true);

  // Staff list
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Create staff modal
  const [showCreate, setShowCreate] = useState(false);
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cRole, setCRole] = useState("doctor");
  const [cPassword, setCPassword] = useState("");
  const [cPermissions, setCPermissions] = useState<Record<string, boolean>>(() => defaultPermissionsForRole("doctor"));
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Edit staff modal
  const [editStaff, setEditStaff] = useState<StaffMember | null>(null);
  const [eName, setEName] = useState("");
  const [ePhone, setEPhone] = useState("");
  const [eRole, setERole] = useState("");
  const [ePermissions, setEPermissions] = useState<Record<string, boolean>>({});
  const [showApplyDefaults, setShowApplyDefaults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Password reset modal
  const [pwTarget, setPwTarget] = useState<StaffMember | null>(null);
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  // Confirm deactivate/activate modal
  const [toggleTarget, setToggleTarget] = useState<StaffMember | null>(null);
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  /* ---- Auth + Role ---- */
  useEffect(() => {
    if (staffLoading) return;
    if (noSession) { router.replace("/admin/login"); return; }
    setChecking(false);
  }, [staffLoading, noSession, router]);

  /* ---- Fetch staff ---- */
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await adminFetch("/api/admin/staff");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch staff.");
      setStaff(json.staff ?? []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  const isOwner = myProfile?.is_active && myProfile?.role === "owner";
  useEffect(() => {
    if (checking) return;
    if (!isOwner) return;
    fetchStaff();
  }, [checking, isOwner, fetchStaff]);

  // Update create permissions when role changes
  const handleCRoleChange = useCallback((newRole: string) => {
    setCRole(newRole);
    setCPermissions(defaultPermissionsForRole(newRole as StaffRole));
  }, []);

  /* ---- Create staff ---- */
  const submitCreate = useCallback(async () => {
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      const res = await adminFetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: cName, email: cEmail, phone: cPhone, role: cRole, password: cPassword, permissions: cPermissions }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create staff user.");
      setCreateSuccess(`Staff user "${json.profile.full_name}" created successfully.`);
      setCName(""); setCEmail(""); setCPhone(""); setCRole("doctor"); setCPassword("");
      setCPermissions(defaultPermissionsForRole("doctor"));
      fetchStaff();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setCreating(false);
    }
  }, [cName, cEmail, cPhone, cRole, cPassword, cPermissions, fetchStaff]);

  /* ---- Edit staff ---- */
  const openEdit = useCallback((s: StaffMember) => {
    setEditStaff(s);
    setEName(s.full_name);
    setEPhone(s.phone ?? "");
    setERole(s.role);
    setEPermissions(s.permissions || defaultPermissionsForRole(s.role as StaffRole));
    setShowApplyDefaults(false);
    setEditError(null);
  }, []);

  const submitEdit = useCallback(async () => {
    if (!editStaff) return;
    setSaving(true);
    setEditError(null);
    const isSelf = editStaff.auth_user_id === myProfile?.auth_user_id;
    try {
      const payload: Record<string, unknown> = { staff_id: editStaff.id, full_name: eName, phone: ePhone, role: eRole };
      if (!isSelf) payload.permissions = ePermissions;
      const res = await adminFetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update staff.");
      setEditStaff(null);
      fetchStaff();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSaving(false);
    }
  }, [editStaff, eName, ePhone, eRole, ePermissions, myProfile, fetchStaff]);

  /* ---- Password reset ---- */
  const openPasswordReset = useCallback((s: StaffMember) => {
    setPwTarget(s);
    setPwNew("");
    setPwConfirm("");
    setPwError(null);
    setPwSuccess(null);
  }, []);

  const submitPasswordReset = useCallback(async () => {
    if (!pwTarget) return;
    if (pwNew.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    if (pwNew !== pwConfirm) { setPwError("Passwords do not match."); return; }
    setPwSaving(true);
    setPwError(null);
    try {
      const res = await adminFetch("/api/admin/staff/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff_id: pwTarget.id, new_password: pwNew }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to reset password.");
      setPwSuccess("Password updated successfully.");
      setPwNew("");
      setPwConfirm("");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setPwSaving(false);
    }
  }, [pwTarget, pwNew, pwConfirm]);

  /* ---- Toggle active ---- */
  const submitToggle = useCallback(async () => {
    if (!toggleTarget) return;
    setToggling(true);
    setToggleError(null);
    try {
      const res = await adminFetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff_id: toggleTarget.id, is_active: !toggleTarget.is_active }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update staff.");
      setToggleTarget(null);
      fetchStaff();
    } catch (err) {
      setToggleError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setToggling(false);
    }
  }, [toggleTarget, fetchStaff]);

  /* ---- Loading gate ---- */
  if (checking) {
    return (
      <main className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="mt-3 font-body text-sm text-text-secondary">Checking authentication…</p>
        </div>
      </main>
    );
  }

  /* ---- Inactive staff gate ---- */
  if (inactive) return <AdminInactive />;

  /* ---- Role guard: owner only ---- */
  if (myProfile && !hasRole("owner")) {
    return <AdminAccessDenied message="Only the clinic owner can manage staff." />;
  }

  return (
    <>
      <AdminPageHeader title="Staff Management" description="Manage staff accounts and roles.">
        <button
          onClick={() => { setShowCreate(true); setCreateError(null); setCreateSuccess(null); }}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-body text-sm font-semibold text-white hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Staff
        </button>
      </AdminPageHeader>

      <div className="mx-auto max-w-4xl">
        {/* ===== Error/Loading ===== */}
        {fetchError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 font-body text-sm text-red-700">{fetchError}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="h-6 w-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-body text-sm text-text-secondary">No staff members found.</p>
          </div>
        ) : (
          /* ===== Staff List ===== */
          <div className="space-y-3">
            {staff.map((s) => (
              <div
                key={s.id}
                className={`rounded-xl border p-4 shadow-sm transition-colors ${
                  s.is_active
                    ? "border-border bg-white"
                    : "border-red-200 bg-red-50/50"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-body text-base font-semibold text-text-primary">{s.full_name}</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 font-body text-xs font-semibold ${
                        s.role === "owner" ? "bg-primary/10 text-primary" :
                        s.role === "doctor" ? "bg-green-50 text-green-700 border border-green-200" :
                        s.role === "receptionist" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {ROLE_LABELS[s.role] || s.role}
                      </span>
                      {!s.is_active && (
                        <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 font-body text-xs font-semibold text-red-700">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="font-body text-sm text-text-secondary mt-0.5">{s.email}{s.phone ? ` · ${s.phone}` : ""}</p>
                    <p className="font-body text-xs text-text-secondary/70 mt-0.5">Added {formatDate(s.created_at)}</p>
                    {s.role !== "owner" && s.permissions && (() => {
                      const topPerms = TOP_LEVEL_KEYS.filter((k) => s.permissions[k]).map((k) => PERMISSION_LABELS[k]);
                      const settingsPerms = SETTINGS_PERMISSION_KEYS.filter((k) => s.permissions[k]);
                      if (settingsPerms.length > 0) {
                        const settingsLabels = settingsPerms.map((k) => PERMISSION_LABELS[k]).join(", ");
                        topPerms.push(`Settings (${settingsLabels})`);
                      }
                      if (s.permissions.staff) topPerms.push("Staff Management");
                      return (
                        <p className="font-body text-xs text-text-secondary/70 mt-0.5">
                          Permissions: {topPerms.join(", ") || "None"}
                        </p>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <button
                      onClick={() => openEdit(s)}
                      className="rounded-lg border border-border bg-white px-3 py-1.5 font-body text-xs font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Edit
                    </button>
                    {s.auth_user_id !== myProfile?.auth_user_id && (
                      <button
                        onClick={() => openPasswordReset(s)}
                        className="rounded-lg border border-border bg-white px-3 py-1.5 font-body text-xs font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        Reset Password
                      </button>
                    )}
                    {/* Don't show toggle for the current owner themselves */}
                    {s.auth_user_id !== myProfile?.auth_user_id && (
                      <button
                        onClick={() => { setToggleTarget(s); setToggleError(null); }}
                        className={`rounded-lg border px-3 py-1.5 font-body text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                          s.is_active
                            ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:ring-red-500"
                            : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 focus-visible:ring-green-500"
                        }`}
                      >
                        {s.is_active ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Create Staff Modal ===== */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !creating && setShowCreate(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Create staff user"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-lg font-bold text-text-primary mb-4">Add Staff Member</h2>

            {createSuccess && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 font-body text-sm text-green-700">{createSuccess}</div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="c-name" className="block font-body text-sm font-semibold text-text-secondary mb-1">Full Name *</label>
                <input id="c-name" type="text" value={cName} onChange={(e) => setCName(e.target.value)} disabled={creating} placeholder="Dr. Sharma"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="c-email" className="block font-body text-sm font-semibold text-text-secondary mb-1">Email *</label>
                <input id="c-email" type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} disabled={creating} placeholder="staff@clinic.com"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="c-password" className="block font-body text-sm font-semibold text-text-secondary mb-1">Password *</label>
                <input id="c-password" type="password" value={cPassword} onChange={(e) => setCPassword(e.target.value)} disabled={creating} placeholder="Minimum 8 characters"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="c-phone" className="block font-body text-sm font-semibold text-text-secondary mb-1">Phone (optional)</label>
                <input id="c-phone" type="text" value={cPhone} onChange={(e) => setCPhone(e.target.value)} disabled={creating} placeholder="9801234567"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="c-role" className="block font-body text-sm font-semibold text-text-secondary mb-1">Role *</label>
                <select id="c-role" value={cRole} onChange={(e) => handleCRoleChange(e.target.value)} disabled={creating}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50">
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Permissions checkboxes */}
              <div>
                <p className="font-body text-sm font-semibold text-text-secondary mb-2">Permissions</p>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {TOP_LEVEL_KEYS.map((key) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cRole === "owner" ? true : (cPermissions[key] ?? false)}
                          onChange={(e) => setCPermissions((prev) => ({ ...prev, [key]: e.target.checked }))}
                          disabled={creating || cRole === "owner"}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="font-body text-xs text-text-primary">{PERMISSION_LABELS[key]}</span>
                      </label>
                    ))}
                  </div>
                  <SettingsGroupCheckbox
                    role={cRole}
                    perms={cPermissions}
                    onPermChange={(k, v) => setCPermissions((prev) => ({ ...prev, [k]: v }))}
                    disabled={creating}
                  />
                  {/* Staff Management */}
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={cRole === "owner"}
                      disabled
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="font-body text-xs text-text-primary">
                      Staff Management
                      {cRole !== "owner" && <span className="ml-1 text-text-secondary/60">(Owner only)</span>}
                    </span>
                  </label>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="font-body text-xs text-amber-700">
                  This will create a login account for this staff member. They will be able to sign in with their email and the password you set.
                </p>
              </div>
            </div>

            {createError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 font-body text-sm text-red-700">{createError}</div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCreate(false)}
                disabled={creating}
                className="rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Cancel
              </button>
              <button
                onClick={submitCreate}
                disabled={creating || !cName.trim() || !cEmail.trim() || cPassword.length < 8}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-body text-sm font-semibold text-white hover:bg-accent-hover transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {creating ? "Creating…" : "Create Staff User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Edit Staff Modal ===== */}
      {editStaff && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !saving && setEditStaff(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Edit staff member"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-lg font-bold text-text-primary mb-1">Edit Staff Member</h2>
            <p className="font-body text-sm text-text-secondary mb-4">{editStaff.email}</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="e-name" className="block font-body text-sm font-semibold text-text-secondary mb-1">Full Name</label>
                <input id="e-name" type="text" value={eName} onChange={(e) => setEName(e.target.value)} disabled={saving}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="e-phone" className="block font-body text-sm font-semibold text-text-secondary mb-1">Phone</label>
                <input id="e-phone" type="text" value={ePhone} onChange={(e) => setEPhone(e.target.value)} disabled={saving}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="e-role" className="block font-body text-sm font-semibold text-text-secondary mb-1">Role</label>
                <select id="e-role" value={eRole} onChange={(e) => setERole(e.target.value)} disabled={saving || editStaff.auth_user_id === myProfile?.auth_user_id}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50">
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                {editStaff.auth_user_id === myProfile?.auth_user_id && (
                  <p className="font-body text-xs text-amber-600 mt-1">You cannot change your own role.</p>
                )}
              </div>

              {eRole !== editStaff.role && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="font-body text-xs text-amber-700">
                    Changing role from <strong>{ROLE_LABELS[editStaff.role]}</strong> to <strong>{ROLE_LABELS[eRole]}</strong> will change what this staff member can access.
                  </p>
                </div>
              )}

              {/* Permissions checkboxes (not editable for self) */}
              {editStaff.auth_user_id !== myProfile?.auth_user_id ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-body text-sm font-semibold text-text-secondary">Permissions</p>
                    {!showApplyDefaults ? (
                      <button
                        type="button"
                        onClick={() => setShowApplyDefaults(true)}
                        className="font-body text-xs text-primary hover:underline"
                      >
                        Reset to role defaults
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-body text-xs text-amber-600">Apply defaults for {ROLE_LABELS[eRole]}?</span>
                        <button
                          type="button"
                          onClick={() => { setEPermissions(defaultPermissionsForRole(eRole as StaffRole)); setShowApplyDefaults(false); }}
                          className="font-body text-xs font-semibold text-primary hover:underline"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowApplyDefaults(false)}
                          className="font-body text-xs text-text-secondary hover:underline"
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {TOP_LEVEL_KEYS.map((key) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={eRole === "owner" ? true : (ePermissions[key] ?? false)}
                            onChange={(e) => setEPermissions((prev) => ({ ...prev, [key]: e.target.checked }))}
                            disabled={saving || eRole === "owner"}
                            className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                          />
                          <span className="font-body text-xs text-text-primary">{PERMISSION_LABELS[key]}</span>
                        </label>
                      ))}
                    </div>
                    <SettingsGroupCheckbox
                      role={eRole}
                      perms={ePermissions}
                      onPermChange={(k, v) => setEPermissions((prev) => ({ ...prev, [k]: v }))}
                      disabled={saving}
                    />
                    {/* Staff Management */}
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={eRole === "owner"}
                        disabled
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="font-body text-xs text-text-primary">
                        Staff Management
                        {eRole !== "owner" && <span className="ml-1 text-text-secondary/60">(Owner only)</span>}
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <p className="font-body text-xs text-amber-600">You cannot edit your own permissions.</p>
              )}
            </div>

            {editError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 font-body text-sm text-red-700">{editError}</div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditStaff(null)}
                disabled={saving}
                className="rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                disabled={saving || !eName.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Password Reset Modal ===== */}
      {pwTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !pwSaving && setPwTarget(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Reset staff password"
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-lg font-bold text-text-primary mb-1">Reset Password</h2>
            <p className="font-body text-sm text-text-secondary mb-4">For: {pwTarget.full_name} ({pwTarget.email})</p>

            {pwSuccess && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 font-body text-sm text-green-700">{pwSuccess}</div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="pw-new" className="block font-body text-sm font-semibold text-text-secondary mb-1">New Password</label>
                <input id="pw-new" type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} disabled={pwSaving} placeholder="Minimum 8 characters"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="pw-confirm" className="block font-body text-sm font-semibold text-text-secondary mb-1">Confirm Password</label>
                <input id="pw-confirm" type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} disabled={pwSaving} placeholder="Re-enter password"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
            </div>

            {pwError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 font-body text-sm text-red-700">{pwError}</div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setPwTarget(null)}
                disabled={pwSaving}
                className="rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Cancel
              </button>
              <button
                onClick={submitPasswordReset}
                disabled={pwSaving || !pwNew || !pwConfirm}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {pwSaving ? "Updating…" : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Toggle Active Confirmation Modal ===== */}
      {toggleTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !toggling && setToggleTarget(null)}
          role="dialog"
          aria-modal="true"
          aria-label={toggleTarget.is_active ? "Deactivate staff member" : "Activate staff member"}
        >
          <div
            className={`w-full max-w-sm rounded-2xl border p-6 shadow-xl ${
              toggleTarget.is_active ? "border-red-200 bg-white" : "border-green-200 bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">
              {toggleTarget.is_active ? "Deactivate Staff Member" : "Activate Staff Member"}
            </h2>

            {toggleTarget.is_active ? (
              <div className="space-y-3 mb-6">
                <p className="font-body text-sm text-text-primary">
                  Are you sure you want to deactivate <strong>{toggleTarget.full_name}</strong>?
                </p>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="font-body text-xs text-red-700">
                    This staff member will immediately lose access to all admin pages. They will not be able to log in until reactivated.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                <p className="font-body text-sm text-text-primary">
                  Reactivate <strong>{toggleTarget.full_name}</strong>?
                </p>
                <p className="font-body text-xs text-text-secondary">
                  This will restore their access to admin pages based on their saved permissions.
                </p>
              </div>
            )}

            {toggleError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 font-body text-sm text-red-700">{toggleError}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setToggleTarget(null)}
                disabled={toggling}
                className="rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Cancel
              </button>
              <button
                onClick={submitToggle}
                disabled={toggling}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-body text-sm font-semibold text-white transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 ${
                  toggleTarget.is_active
                    ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
                    : "bg-green-600 hover:bg-green-700 focus-visible:ring-green-500"
                }`}
              >
                {toggling
                  ? (toggleTarget.is_active ? "Deactivating…" : "Activating…")
                  : (toggleTarget.is_active ? "Deactivate" : "Activate")
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
