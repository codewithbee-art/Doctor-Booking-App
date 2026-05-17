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
  bio: string | null;
  qualifications: string | null;
  experience: string | null;
  work_history: string | null;
  treatment_areas: string | null;
  profile_image_url: string | null;
  visit_location: string | null;
  public_note: string | null;
  preparation_note: string | null;
  languages: string | null;
  gender: string | null;
  license_number: string | null;
  consultation_mode: string | null;
  display_order: number;
  slot_duration_minutes: number;
  max_patients: number | null;
  created_at: string;
  updated_at: string;
}

const INPUT_CLS = "w-full rounded-lg border border-border px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const TEXTAREA_CLS = `${INPUT_CLS} min-h-[80px]`;
const LABEL_CLS = "block font-body text-sm font-semibold text-text-secondary mb-1";

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

function modeLabel(m: string | null) {
  if (m === "in_person") return "In-person";
  if (m === "online") return "Online";
  if (m === "both") return "In-person & Online";
  return "";
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

  // Core form state
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
  const [formLocation, setFormLocation] = useState("");
  const [formConsultMode, setFormConsultMode] = useState("");
  const [formDisplayOrder, setFormDisplayOrder] = useState("0");
  const [formSlotDuration, setFormSlotDuration] = useState("30");
  const [formMaxPatients, setFormMaxPatients] = useState("");

  // Profile form state
  const [showProfile, setShowProfile] = useState(false);
  const [formImageUrl, setFormImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [formBio, setFormBio] = useState("");
  const [formQualifications, setFormQualifications] = useState("");
  const [formExperience, setFormExperience] = useState("");
  const [formWorkHistory, setFormWorkHistory] = useState("");
  const [formTreatmentAreas, setFormTreatmentAreas] = useState("");
  const [formLanguages, setFormLanguages] = useState("");
  const [formGender, setFormGender] = useState("");
  const [formLicenseNumber, setFormLicenseNumber] = useState("");
  const [formPublicNote, setFormPublicNote] = useState("");
  const [formPrepNote, setFormPrepNote] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
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
    setFormName(""); setFormSpecialization(""); setFormTreatment("");
    setFormDateAD(""); setFormFrom("09:00"); setFormTo("17:00");
    setFormFee(""); setFormFree(false);
    setFormLocation(""); setFormConsultMode(""); setFormDisplayOrder("0");
    setFormSlotDuration("30"); setFormMaxPatients("");
    setShowProfile(false);
    setUploadMsg(null);
    setFormImageUrl(""); setFormBio(""); setFormQualifications("");
    setFormExperience(""); setFormWorkHistory(""); setFormTreatmentAreas("");
    setFormLanguages(""); setFormGender(""); setFormLicenseNumber("");
    setFormPublicNote(""); setFormPrepNote("");
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
    setFormLocation(s.visit_location || "");
    setFormConsultMode(s.consultation_mode || "");
    setFormDisplayOrder(String(s.display_order ?? 0));
    setFormSlotDuration(String(s.slot_duration_minutes ?? 30));
    setFormMaxPatients(s.max_patients != null ? String(s.max_patients) : "");
    setFormImageUrl(s.profile_image_url || "");
    setFormBio(s.bio || "");
    setFormQualifications(s.qualifications || "");
    setFormExperience(s.experience || "");
    setFormWorkHistory(s.work_history || "");
    setFormTreatmentAreas(s.treatment_areas || "");
    setFormLanguages(s.languages || "");
    setFormGender(s.gender || "");
    setFormLicenseNumber(s.license_number || "");
    setFormPublicNote(s.public_note || "");
    setFormPrepNote(s.preparation_note || "");
    const hasProfile = !!(s.bio || s.qualifications || s.experience || s.work_history || s.treatment_areas || s.profile_image_url || s.languages || s.gender || s.license_number || s.public_note || s.preparation_note);
    setShowProfile(hasProfile);
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

    const payload: Record<string, unknown> = {
      id: editingId || undefined,
      specialist_name: formName.trim(),
      specialization: formSpecialization.trim(),
      treatment_type: formTreatment.trim(),
      visit_date_ad: formDateAD,
      visit_date_bs: formatBS(formDateAD),
      available_from: formFrom,
      available_to: formTo,
      consultation_fee: formFree ? null : (formFee ? Number(formFee) : null),
      visit_location: formLocation.trim() || null,
      consultation_mode: formConsultMode || null,
      display_order: Number(formDisplayOrder) || 0,
      slot_duration_minutes: Number(formSlotDuration) || 30,
      max_patients: formMaxPatients ? Number(formMaxPatients) : null,
      profile_image_url: formImageUrl.trim() || null,
      bio: formBio.trim() || null,
      qualifications: formQualifications.trim() || null,
      experience: formExperience.trim() || null,
      work_history: formWorkHistory.trim() || null,
      treatment_areas: formTreatmentAreas.trim() || null,
      languages: formLanguages.trim() || null,
      gender: formGender || null,
      license_number: formLicenseNumber.trim() || null,
      public_note: formPublicNote.trim() || null,
      preparation_note: formPrepNote.trim() || null,
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
            <a href="/admin/dashboard" className="inline-flex items-center gap-1 sm:gap-2 rounded-lg border border-border bg-white px-2.5 sm:px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
              <span className="hidden sm:inline">Dashboard</span>
            </a>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {canManage && (
          <div className="mb-6 flex items-center justify-between">
            <p className="font-body text-sm text-text-secondary">{specialists.length} specialist visit{specialists.length !== 1 ? "s" : ""}</p>
            <button onClick={openAdd} className="rounded-lg bg-primary px-4 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">+ Add Specialist Visit</button>
          </div>
        )}

        {fetchError && <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3"><p className="font-body text-sm text-danger">{fetchError}</p></div>}
        {actionError && <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3"><p className="font-body text-sm text-danger">{actionError}</p></div>}

        {/* ---- Form ---- */}
        {showForm && (
          <div className="mb-6 rounded-xl border border-border bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-text-primary mb-4">{editingId ? "Edit Specialist Visit" : "Add Specialist Visit"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Core fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sp-name" className={LABEL_CLS}>Specialist Name <span className="text-danger">*</span></label>
                  <input id="sp-name" type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className={INPUT_CLS} placeholder="Dr. Name" />
                </div>
                <div>
                  <label htmlFor="sp-spec" className={LABEL_CLS}>Specialization <span className="text-danger">*</span></label>
                  <input id="sp-spec" type="text" value={formSpecialization} onChange={(e) => setFormSpecialization(e.target.value)} className={INPUT_CLS} placeholder="Orthopedics" />
                </div>
                <div>
                  <label htmlFor="sp-treat" className={LABEL_CLS}>Treatment Type <span className="text-danger">*</span></label>
                  <input id="sp-treat" type="text" value={formTreatment} onChange={(e) => setFormTreatment(e.target.value)} className={INPUT_CLS} placeholder="Joint Pain, Fractures" />
                </div>
                <div>
                  <label htmlFor="sp-date" className={LABEL_CLS}>Visit Date (AD) <span className="text-danger">*</span></label>
                  <input id="sp-date" type="date" value={formDateAD} onChange={(e) => setFormDateAD(e.target.value)} className={INPUT_CLS} />
                  {formDateAD && <p className="mt-1 font-body text-xs text-primary font-semibold">{formatBS(formDateAD)} (BS)</p>}
                </div>
                <div>
                  <label htmlFor="sp-from" className={LABEL_CLS}>Available From <span className="text-danger">*</span></label>
                  <input id="sp-from" type="time" value={formFrom} onChange={(e) => setFormFrom(e.target.value)} className={INPUT_CLS} />
                </div>
                <div>
                  <label htmlFor="sp-to" className={LABEL_CLS}>Available To <span className="text-danger">*</span></label>
                  <input id="sp-to" type="time" value={formTo} onChange={(e) => setFormTo(e.target.value)} className={INPUT_CLS} />
                </div>
                <div>
                  <label htmlFor="sp-fee" className={LABEL_CLS}>Consultation Fee (NPR)</label>
                  <div className="flex items-center gap-3 mb-1.5">
                    <label htmlFor="sp-free" className="inline-flex items-center gap-2 cursor-pointer">
                      <input id="sp-free" type="checkbox" checked={formFree} onChange={(e) => { setFormFree(e.target.checked); if (e.target.checked) setFormFee(""); }} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                      <span className="font-body text-sm text-text-primary">Free Consultation</span>
                    </label>
                  </div>
                  <input id="sp-fee" type="number" min="0" step="0.01" value={formFee} onChange={(e) => setFormFee(e.target.value)} disabled={formFree} className={`${INPUT_CLS} disabled:opacity-50 disabled:bg-bg-light`} placeholder={formFree ? "Free" : "Optional"} />
                </div>
                <div>
                  <label htmlFor="sp-location" className={LABEL_CLS}>Visit Location</label>
                  <input id="sp-location" type="text" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className={INPUT_CLS} placeholder="e.g. Room 3, Main Building" />
                </div>
                <div>
                  <label htmlFor="sp-mode" className={LABEL_CLS}>Consultation Mode</label>
                  <select id="sp-mode" value={formConsultMode} onChange={(e) => setFormConsultMode(e.target.value)} className={INPUT_CLS}>
                    <option value="">— Not set —</option>
                    <option value="in_person">In-person</option>
                    <option value="online">Online</option>
                    <option value="both">Both (In-person & Online)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="sp-order" className={LABEL_CLS}>Display Order</label>
                  <input id="sp-order" type="number" min="0" value={formDisplayOrder} onChange={(e) => setFormDisplayOrder(e.target.value)} className={INPUT_CLS} placeholder="0 = default" />
                  <p className="mt-0.5 font-body text-xs text-text-secondary">Lower numbers appear first on public pages</p>
                </div>
                <div>
                  <label htmlFor="sp-slot-dur" className={LABEL_CLS}>Slot Duration (minutes)</label>
                  <input id="sp-slot-dur" type="number" min="5" max="120" step="5" value={formSlotDuration} onChange={(e) => setFormSlotDuration(e.target.value)} className={INPUT_CLS} placeholder="30" />
                  <p className="mt-0.5 font-body text-xs text-text-secondary">Time per patient for booking slots</p>
                </div>
                <div>
                  <label htmlFor="sp-max-pat" className={LABEL_CLS}>Max Patients (optional)</label>
                  <input id="sp-max-pat" type="number" min="1" value={formMaxPatients} onChange={(e) => setFormMaxPatients(e.target.value)} className={INPUT_CLS} placeholder="Unlimited if empty" />
                  <p className="mt-0.5 font-body text-xs text-text-secondary">Leave empty for no limit</p>
                </div>
              </div>

              {/* Profile details toggle */}
              <button type="button" onClick={() => setShowProfile(!showProfile)} className="inline-flex items-center gap-2 font-body text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                <svg className={`h-4 w-4 transition-transform ${showProfile ? "rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                {showProfile ? "Hide Profile Details" : "Show Profile Details (bio, qualifications, image, etc.)"}
              </button>

              {/* Profile fields */}
              {showProfile && (
                <div className="rounded-lg border border-border/60 bg-bg-light/50 p-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={LABEL_CLS}>Profile Photo</label>
                      {/* Upload */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                        <label className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2 font-body text-sm font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                          {uploading ? "Uploading..." : "Upload Photo"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="sr-only"
                            disabled={uploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadMsg(null);
                              if (file.size > 2 * 1024 * 1024) {
                                setUploadMsg("File too large. Maximum 2 MB.");
                                return;
                              }
                              setUploading(true);
                              try {
                                const fd = new FormData();
                                fd.append("file", file);
                                const res = await fetch("/api/admin/specialists/upload-image", { method: "POST", body: fd });
                                const json = await res.json();
                                if (!res.ok) throw new Error(json.error || "Upload failed");
                                setFormImageUrl(json.url);
                                setUploadMsg("Photo uploaded successfully.");
                              } catch (err) {
                                setUploadMsg(err instanceof Error ? err.message : "Upload failed");
                              } finally {
                                setUploading(false);
                                e.target.value = "";
                              }
                            }}
                          />
                        </label>
                        <span className="font-body text-xs text-text-secondary">JPEG, PNG, WebP, or GIF &middot; Max 2 MB</span>
                      </div>
                      {uploadMsg && (
                        <p className={`font-body text-xs mb-2 ${uploadMsg.includes("success") ? "text-green-700" : "text-danger"}`}>{uploadMsg}</p>
                      )}
                      {/* URL fallback */}
                      <input id="sp-img" type="url" value={formImageUrl} onChange={(e) => { setFormImageUrl(e.target.value); setUploadMsg(null); }} className={INPUT_CLS} placeholder="Or paste image URL manually" />
                      {formImageUrl && (
                        <div className="mt-2 flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={formImageUrl} alt="Preview" className="h-16 w-16 rounded-full object-cover border border-border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <span className="font-body text-xs text-text-secondary">Image preview</span>
                        </div>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="sp-bio" className={LABEL_CLS}>Bio</label>
                      <textarea id="sp-bio" value={formBio} onChange={(e) => setFormBio(e.target.value)} className={TEXTAREA_CLS} rows={3} placeholder="Brief biography (supports Markdown)" />
                    </div>
                    <div>
                      <label htmlFor="sp-qual" className={LABEL_CLS}>Qualifications</label>
                      <textarea id="sp-qual" value={formQualifications} onChange={(e) => setFormQualifications(e.target.value)} className={TEXTAREA_CLS} rows={3} placeholder="e.g. MBBS, MD (supports Markdown)" />
                    </div>
                    <div>
                      <label htmlFor="sp-exp" className={LABEL_CLS}>Experience</label>
                      <textarea id="sp-exp" value={formExperience} onChange={(e) => setFormExperience(e.target.value)} className={TEXTAREA_CLS} rows={3} placeholder="e.g. 15 years in orthopedics (supports Markdown)" />
                    </div>
                    <div>
                      <label htmlFor="sp-work" className={LABEL_CLS}>Work History</label>
                      <textarea id="sp-work" value={formWorkHistory} onChange={(e) => setFormWorkHistory(e.target.value)} className={TEXTAREA_CLS} rows={3} placeholder="Previous hospitals, clinics (supports Markdown)" />
                    </div>
                    <div>
                      <label htmlFor="sp-areas" className={LABEL_CLS}>Treatment Areas</label>
                      <textarea id="sp-areas" value={formTreatmentAreas} onChange={(e) => setFormTreatmentAreas(e.target.value)} className={TEXTAREA_CLS} rows={3} placeholder="Specific treatments offered (supports Markdown)" />
                    </div>
                    <div>
                      <label htmlFor="sp-lang" className={LABEL_CLS}>Languages Spoken</label>
                      <input id="sp-lang" type="text" value={formLanguages} onChange={(e) => setFormLanguages(e.target.value)} className={INPUT_CLS} placeholder="e.g. Nepali, English, Hindi" />
                    </div>
                    <div>
                      <label htmlFor="sp-gender" className={LABEL_CLS}>Gender</label>
                      <select id="sp-gender" value={formGender} onChange={(e) => setFormGender(e.target.value)} className={INPUT_CLS}>
                        <option value="">— Not specified —</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="sp-license" className={LABEL_CLS}>License / Registration No.</label>
                      <input id="sp-license" type="text" value={formLicenseNumber} onChange={(e) => setFormLicenseNumber(e.target.value)} className={INPUT_CLS} placeholder="NMC-12345" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="sp-pub-note" className={LABEL_CLS}>Public Note</label>
                    <textarea id="sp-pub-note" value={formPublicNote} onChange={(e) => setFormPublicNote(e.target.value)} className={TEXTAREA_CLS} rows={2} placeholder="Shown on public detail page (supports Markdown)" />
                  </div>
                  <div>
                    <label htmlFor="sp-prep" className={LABEL_CLS}>Preparation Note</label>
                    <textarea id="sp-prep" value={formPrepNote} onChange={(e) => setFormPrepNote(e.target.value)} className={TEXTAREA_CLS} rows={2} placeholder="What patients should bring or prepare (supports Markdown)" />
                  </div>
                </div>
              )}

              {formError && <p className="font-body text-sm text-danger">{formError}</p>}

              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="rounded-lg bg-primary px-5 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{saving ? "Saving..." : editingId ? "Update" : "Create"}</button>
                <button type="button" onClick={resetForm} className="rounded-lg border border-border px-5 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Loading */}
        {loading && <div className="text-center py-16"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}

        {/* Empty */}
        {!loading && specialists.length === 0 && (
          <div className="rounded-xl border border-border bg-white px-6 py-12 text-center"><p className="font-body text-base text-text-secondary">No specialist visits yet.</p></div>
        )}

        {/* List */}
        {!loading && specialists.length > 0 && (
          <div className="space-y-3">
            {specialists.map((s) => {
              const bsDisplay = s.visit_date_bs || formatBS(s.visit_date_ad);
              const isPast = s.visit_date_ad < new Date().toISOString().slice(0, 10);
              return (
                <div key={s.id} className={`rounded-xl border bg-white p-4 shadow-sm ${s.is_active ? "border-border" : "border-border/50 opacity-60"}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-body text-sm font-bold text-text-primary">{s.specialist_name}</h3>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-body text-xs font-semibold text-primary">{s.specialization}</span>
                        {!s.is_active && <span className="rounded-full bg-red-100 px-2 py-0.5 font-body text-xs font-semibold text-red-700">Inactive</span>}
                        {isPast && s.is_active && <span className="rounded-full bg-amber-100 px-2 py-0.5 font-body text-xs font-semibold text-amber-700">Past</span>}
                      </div>
                      <p className="font-body text-xs text-text-secondary mt-1">
                        {s.treatment_type} &middot; {bsDisplay} ({formatDate(s.visit_date_ad)}) &middot; {formatTime(s.available_from)}–{formatTime(s.available_to)}
                        {s.consultation_fee != null ? ` · NPR ${s.consultation_fee}` : " · Free"}
                        {s.visit_location ? ` · ${s.visit_location}` : ""}
                        {s.consultation_mode ? ` · ${modeLabel(s.consultation_mode)}` : ""}
                        {s.display_order ? ` · Order: ${s.display_order}` : ""}
                      </p>
                    </div>
                    {canManage && (
                      <div className="flex flex-shrink-0 gap-2">
                        <button onClick={() => openEdit(s)} className="rounded-lg border border-border px-3 py-1.5 font-body text-xs font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Edit</button>
                        <button onClick={() => toggleActive(s)} className={`rounded-lg px-3 py-1.5 font-body text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${s.is_active ? "border border-amber-300 text-amber-700 hover:bg-amber-50" : "border border-green-300 text-green-700 hover:bg-green-50"}`}>{s.is_active ? "Deactivate" : "Activate"}</button>
                        <button onClick={() => handleDelete(s)} className="rounded-lg border border-danger/40 px-3 py-1.5 font-body text-xs font-semibold text-danger hover:bg-danger/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger">Delete</button>
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
