"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStaffProfile } from "@/lib/useStaffProfile";
import AdminInactive from "@/components/AdminInactive";
import LogoutButton from "../dashboard/LogoutButton";
import { formatBS } from "@/lib/dateConvert";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Specialist {
  id: string;
  specialist_name: string;
  specialization: string;
  treatment_type: string;
  visit_date_bs: string;
  visit_date_ad: string;
  available_from: string;
  available_to: string;
  consultation_fee: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminSpecialistsPage() {
  const router = useRouter();
  const { loading: staffLoading, profile: staffProfile, noSession } = useStaffProfile();
  const [checking, setChecking] = useState(true);

  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formSpecialization, setFormSpecialization] = useState("");
  const [formTreatment, setFormTreatment] = useState("");
  const [formDateAD, setFormDateAD] = useState("");
  const [formFrom, setFormFrom] = useState("09:00");
  const [formTo, setFormTo] = useState("17:00");
  const [formFee, setFormFee] = useState("");
  const [formFree, setFormFree] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete / toggle state
  const [actionError, setActionError] = useState<string | null>(null);

  /* ---- Auth ---- */
  useEffect(() => {
    if (staffLoading) return;
    if (noSession) { router.replace("/admin/login"); return; }
    setChecking(false);
  }, [staffLoading, noSession, router]);

  /* ---- Fetch ---- */
  const loadSpecialists = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/admin/specialists");
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || json.error || "Failed to load");
      setSpecialists(json.specialists ?? []);
      window.scrollTo(0, 0);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!checking) loadSpecialists();
  }, [checking, loadSpecialists]);

  /* ---- Role check ---- */
  if (staffLoading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-light">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!staffProfile || !staffProfile.is_active) {
    return <AdminInactive />;
  }

  const canManage = ["owner", "doctor", "receptionist"].includes(staffProfile.role);

  /* ---- Form helpers ---- */
  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setFormName("");
    setFormSpecialization("");
    setFormTreatment("");
    setFormDateAD("");
    setFormFrom("09:00");
    setFormTo("17:00");
    setFormFee("");
    setFormFree(false);
    setFormError(null);
  }

  function openAdd() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(s: Specialist) {
    setEditingId(s.id);
    setFormName(s.specialist_name);
    setFormSpecialization(s.specialization);
    setFormTreatment(s.treatment_type);
    setFormDateAD(s.visit_date_ad);
    setFormFrom(s.available_from.slice(0, 5));
    setFormTo(s.available_to.slice(0, 5));
    setFormFee(s.consultation_fee != null ? String(s.consultation_fee) : "");
    setFormFree(s.consultation_fee == null);
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) { setFormError("Specialist name is required."); return; }
    if (!formSpecialization.trim()) { setFormError("Specialization is required."); return; }
    if (!formTreatment.trim()) { setFormError("Treatment type is required."); return; }
    if (!formDateAD) { setFormError("Visit date is required."); return; }
    if (!formFrom || !formTo) { setFormError("Available times are required."); return; }

    setSaving(true);

    const payload = {
      id: editingId || undefined,
      specialist_name: formName.trim(),
      specialization: formSpecialization.trim(),
      treatment_type: formTreatment.trim(),
      visit_date_ad: formDateAD,
      visit_date_bs: formatBS(formDateAD),
      available_from: formFrom,
      available_to: formTo,
      consultation_fee: formFree ? null : (formFee ? Number(formFee) : null),
    };

    try {
      const res = await fetch("/api/admin/specialists", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || json.error || "Failed to save");
      resetForm();
      loadSpecialists();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(s: Specialist) {
    setActionError(null);
    try {
      const res = await fetch("/api/admin/specialists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.id, is_active: !s.is_active }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update");
      setSpecialists((cur) => cur.map((x) => (x.id === s.id ? { ...x, is_active: !x.is_active } : x)));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unexpected error");
    }
  }

  async function handleDelete(s: Specialist) {
    if (!confirm(`Delete specialist visit for "${s.specialist_name}" on ${formatDate(s.visit_date_ad)}?`)) return;
    setActionError(null);
    try {
      const res = await fetch("/api/admin/specialists", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete");
      setSpecialists((cur) => cur.filter((x) => x.id !== s.id));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unexpected error");
    }
  }

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h1 className="font-heading text-xl font-bold text-text-primary">Visiting Specialists</h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/dashboard"
              className="inline-flex items-center gap-1 sm:gap-2 rounded-lg border border-border bg-white px-2.5 sm:px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              <span className="hidden sm:inline">Dashboard</span>
            </a>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Action bar */}
        {canManage && (
          <div className="mb-6 flex items-center justify-between">
            <p className="font-body text-sm text-text-secondary">{specialists.length} specialist visit{specialists.length !== 1 ? "s" : ""}</p>
            <button
              onClick={openAdd}
              className="rounded-lg bg-primary px-4 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              + Add Specialist Visit
            </button>
          </div>
        )}

        {/* Errors */}
        {fetchError && (
          <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
            <p className="font-body text-sm text-danger">{fetchError}</p>
          </div>
        )}
        {actionError && (
          <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
            <p className="font-body text-sm text-danger">{actionError}</p>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-6 rounded-xl border border-border bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-text-primary mb-4">
              {editingId ? "Edit Specialist Visit" : "Add Specialist Visit"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sp-name" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                    Specialist Name <span className="text-danger">*</span>
                  </label>
                  <input id="sp-name" type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Dr. Name" />
                </div>
                <div>
                  <label htmlFor="sp-spec" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                    Specialization <span className="text-danger">*</span>
                  </label>
                  <input id="sp-spec" type="text" value={formSpecialization} onChange={(e) => setFormSpecialization(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Orthopedics" />
                </div>
                <div>
                  <label htmlFor="sp-treat" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                    Treatment Type <span className="text-danger">*</span>
                  </label>
                  <input id="sp-treat" type="text" value={formTreatment} onChange={(e) => setFormTreatment(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Joint Pain, Fractures" />
                </div>
                <div>
                  <label htmlFor="sp-date" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                    Visit Date (AD) <span className="text-danger">*</span>
                  </label>
                  <input id="sp-date" type="date" value={formDateAD} onChange={(e) => setFormDateAD(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  {formDateAD && (
                    <p className="mt-1 font-body text-xs text-primary font-semibold">{formatBS(formDateAD)} (BS)</p>
                  )}
                </div>
                <div>
                  <label htmlFor="sp-from" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                    Available From <span className="text-danger">*</span>
                  </label>
                  <input id="sp-from" type="time" value={formFrom} onChange={(e) => setFormFrom(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label htmlFor="sp-to" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                    Available To <span className="text-danger">*</span>
                  </label>
                  <input id="sp-to" type="time" value={formTo} onChange={(e) => setFormTo(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label htmlFor="sp-fee" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                    Consultation Fee (NPR)
                  </label>
                  <div className="flex items-center gap-3 mb-1.5">
                    <label htmlFor="sp-free" className="inline-flex items-center gap-2 cursor-pointer">
                      <input id="sp-free" type="checkbox" checked={formFree} onChange={(e) => { setFormFree(e.target.checked); if (e.target.checked) setFormFee(""); }} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                      <span className="font-body text-sm text-text-primary">Free Consultation</span>
                    </label>
                  </div>
                  <input id="sp-fee" type="number" min="0" step="0.01" value={formFee} onChange={(e) => setFormFee(e.target.value)} disabled={formFree} className="w-full rounded-lg border border-border px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:bg-bg-light" placeholder={formFree ? "Free" : "Optional"} />
                </div>
              </div>

              {formError && (
                <p className="font-body text-sm text-danger">{formError}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary px-5 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-border px-5 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {/* List */}
        {!loading && specialists.length === 0 && (
          <div className="rounded-xl border border-border bg-white px-6 py-12 text-center">
            <p className="font-body text-base text-text-secondary">No specialist visits yet.</p>
          </div>
        )}

        {!loading && specialists.length > 0 && (
          <div className="space-y-3">
            {specialists.map((s) => {
              const bsDisplay = s.visit_date_bs || formatBS(s.visit_date_ad);
              const isPast = s.visit_date_ad < new Date().toISOString().slice(0, 10);
              return (
                <div
                  key={s.id}
                  className={`rounded-xl border bg-white p-4 shadow-sm ${s.is_active ? "border-border" : "border-border/50 opacity-60"}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-body text-sm font-bold text-text-primary">{s.specialist_name}</h3>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-body text-xs font-semibold text-primary">{s.specialization}</span>
                        {!s.is_active && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 font-body text-xs font-semibold text-red-700">Inactive</span>
                        )}
                        {isPast && s.is_active && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-body text-xs font-semibold text-amber-700">Past</span>
                        )}
                      </div>
                      <p className="font-body text-xs text-text-secondary mt-1">
                        {s.treatment_type} &middot; {bsDisplay} ({formatDate(s.visit_date_ad)}) &middot; {formatTime(s.available_from)}–{formatTime(s.available_to)}
                        {s.consultation_fee != null ? ` · NPR ${s.consultation_fee}` : " · Free Consultation"}
                      </p>
                    </div>
                    {canManage && (
                      <div className="flex flex-shrink-0 gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="rounded-lg border border-border px-3 py-1.5 font-body text-xs font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleActive(s)}
                          className={`rounded-lg px-3 py-1.5 font-body text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${s.is_active ? "border border-amber-300 text-amber-700 hover:bg-amber-50" : "border border-green-300 text-green-700 hover:bg-green-50"}`}
                        >
                          {s.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className="rounded-lg border border-danger/40 px-3 py-1.5 font-body text-xs font-semibold text-danger hover:bg-danger/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
