"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStaffProfile } from "@/lib/useStaffProfile";
import AdminAccessDenied from "@/components/AdminAccessDenied";
import AdminInactive from "@/components/AdminInactive";
import AdminPageHeader from "@/components/AdminPageHeader";

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
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Edit staff modal
  const [editStaff, setEditStaff] = useState<StaffMember | null>(null);
  const [eName, setEName] = useState("");
  const [ePhone, setEPhone] = useState("");
  const [eRole, setERole] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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
      const session = await (await import("@/lib/supabase")).supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const res = await fetch("/api/admin/staff", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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

  /* ---- Create staff ---- */
  const submitCreate = useCallback(async () => {
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      const session = await (await import("@/lib/supabase")).supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ full_name: cName, email: cEmail, phone: cPhone, role: cRole, password: cPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create staff user.");
      setCreateSuccess(`Staff user "${json.profile.full_name}" created successfully.`);
      setCName(""); setCEmail(""); setCPhone(""); setCRole("doctor"); setCPassword("");
      fetchStaff();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setCreating(false);
    }
  }, [cName, cEmail, cPhone, cRole, cPassword, fetchStaff]);

  /* ---- Edit staff ---- */
  const openEdit = useCallback((s: StaffMember) => {
    setEditStaff(s);
    setEName(s.full_name);
    setEPhone(s.phone ?? "");
    setERole(s.role);
    setEditError(null);
  }, []);

  const submitEdit = useCallback(async () => {
    if (!editStaff) return;
    setSaving(true);
    setEditError(null);
    try {
      const session = await (await import("@/lib/supabase")).supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const res = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ staff_id: editStaff.id, full_name: eName, phone: ePhone, role: eRole }),
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
  }, [editStaff, eName, ePhone, eRole, fetchStaff]);

  /* ---- Toggle active ---- */
  const submitToggle = useCallback(async () => {
    if (!toggleTarget) return;
    setToggling(true);
    setToggleError(null);
    try {
      const session = await (await import("@/lib/supabase")).supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const res = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEdit(s)}
                      className="rounded-lg border border-border bg-white px-3 py-1.5 font-body text-xs font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Edit
                    </button>
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
                <input id="c-password" type="password" value={cPassword} onChange={(e) => setCPassword(e.target.value)} disabled={creating} placeholder="Minimum 6 characters"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="c-phone" className="block font-body text-sm font-semibold text-text-secondary mb-1">Phone (optional)</label>
                <input id="c-phone" type="text" value={cPhone} onChange={(e) => setCPhone(e.target.value)} disabled={creating} placeholder="9801234567"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="c-role" className="block font-body text-sm font-semibold text-text-secondary mb-1">Role *</label>
                <select id="c-role" value={cRole} onChange={(e) => setCRole(e.target.value)} disabled={creating}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50">
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
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
                disabled={creating || !cName.trim() || !cEmail.trim() || !cPassword.trim()}
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
                  This will restore their access to admin pages based on their role ({ROLE_LABELS[toggleTarget.role]}).
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
