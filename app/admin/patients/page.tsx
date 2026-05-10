"use client";

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LogoutButton from "../dashboard/LogoutButton";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PatientListItem {
  id: string;
  phone: string;
  email: string | null;
  name: string;
  created_at: string;
  updated_at: string;
}

interface PatientDetail {
  id: string;
  phone: string;
  email: string | null;
  name: string;
  date_of_birth: string | null;
  notes: string | null;
  identity_notes: string | null;
  identity_status: string;
  created_at: string;
  updated_at: string;
}

interface DuplicatePatient {
  id: string;
  phone: string;
  email: string | null;
  name: string;
  date_of_birth: string | null;
  identity_notes: string | null;
  created_at: string;
}

interface PatientBooking {
  id: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  problem: string;
  appointment_date_bs: string;
  appointment_date_ad: string;
  appointment_time: string;
  booking_type: string;
  status: string;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
}

const CANCEL_REASON_PRESETS = [
  "Patient requested cancellation",
  "Patient did not show up",
  "Doctor unavailable",
  "Duplicate booking",
  "Rescheduled to different date",
  "Clinic closed / holiday",
];

interface PatientVisit {
  id: string;
  booking_id: string | null;
  visit_date_ad: string;
  visit_date_bs: string;
  chief_complaint: string | null;
  visit_notes: string | null;
  prescribed_medicines: string | null;
  follow_up_instructions: string | null;
  condition_summary: string | null;
  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function formatDateTime(isoStr: string) {
  return new Date(isoStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_STYLES: Record<string, string> = {
  pending: "border-amber-300 bg-amber-50 text-amber-800",
  confirmed: "border-green-300 bg-green-50 text-green-800",
  cancelled: "border-red-300 bg-red-50 text-red-800",
  completed: "border-slate-300 bg-slate-100 text-slate-700",
};

function todayAD() {
  return new Date().toISOString().split("T")[0];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminPatientsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="font-body text-base text-text-secondary">Loading…</span>
        </div>
      </main>
    }>
      <AdminPatientsContent />
    </Suspense>
  );
}

function AdminPatientsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // List state
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Detail state
  const [selectedPatient, setSelectedPatient] = useState<PatientDetail | null>(null);
  const [patientBookings, setPatientBookings] = useState<PatientBooking[]>([]);
  const [patientVisits, setPatientVisits] = useState<PatientVisit[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Visit form state (Add Visit for general/manual entries)
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [visitComplaint, setVisitComplaint] = useState("");
  const [visitNotes, setVisitNotes] = useState("");
  const [visitMedicines, setVisitMedicines] = useState("");
  const [visitFollowUp, setVisitFollowUp] = useState("");
  const [visitCondition, setVisitCondition] = useState("");
  const [savingVisit, setSavingVisit] = useState(false);
  const [visitSaveError, setVisitSaveError] = useState<string | null>(null);
  const [visitSaveSuccess, setVisitSaveSuccess] = useState(false);

  // Edit visit state
  const [editingVisit, setEditingVisit] = useState<PatientVisit | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editComplaint, setEditComplaint] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editMedicines, setEditMedicines] = useState("");
  const [editFollowUp, setEditFollowUp] = useState("");
  const [editCondition, setEditCondition] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Checkup from booking state
  const [checkupBookingId, setCheckupBookingId] = useState<string | null>(null);
  const [checkupDate, setCheckupDate] = useState("");
  const [checkupComplaint, setCheckupComplaint] = useState("");
  const [checkupNotes, setCheckupNotes] = useState("");
  const [checkupMedicines, setCheckupMedicines] = useState("");
  const [checkupFollowUp, setCheckupFollowUp] = useState("");
  const [checkupCondition, setCheckupCondition] = useState("");
  const [savingCheckup, setSavingCheckup] = useState(false);
  const [checkupError, setCheckupError] = useState<string | null>(null);
  const [checkupSuccess, setCheckupSuccess] = useState<string | null>(null);
  const [checkupHasVisit, setCheckupHasVisit] = useState(false);

  // Edit patient profile state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [epName, setEpName] = useState("");
  const [epPhone, setEpPhone] = useState("");
  const [epEmail, setEpEmail] = useState("");
  const [epDob, setEpDob] = useState("");
  const [epNotes, setEpNotes] = useState("");
  const [epIdentityNotes, setEpIdentityNotes] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Add Patient modal state
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [apName, setApName] = useState("");
  const [apPhone, setApPhone] = useState("");
  const [apEmail, setApEmail] = useState("");
  const [apDob, setApDob] = useState("");
  const [apNotes, setApNotes] = useState("");
  const [apIdentityNotes, setApIdentityNotes] = useState("");
  const [savingNewPatient, setSavingNewPatient] = useState(false);
  const [addPatientError, setAddPatientError] = useState<string | null>(null);
  // Walk-in visit fields (shown after patient creation or in walk-in flow)
  const [apAddVisit, setApAddVisit] = useState(false);
  const [apVisitDate, setApVisitDate] = useState("");
  const [apVisitComplaint, setApVisitComplaint] = useState("");
  const [apVisitNotes, setApVisitNotes] = useState("");
  const [apVisitMedicines, setApVisitMedicines] = useState("");
  const [apVisitFollowUp, setApVisitFollowUp] = useState("");
  const [apVisitCondition, setApVisitCondition] = useState("");
  // Walk-in Visit for existing patient
  const [showWalkinSearch, setShowWalkinSearch] = useState(false);
  const [walkinSearchInput, setWalkinSearchInput] = useState("");
  const [walkinSearchResults, setWalkinSearchResults] = useState<PatientListItem[]>([]);
  const [walkinSearching, setWalkinSearching] = useState(false);

  // View Booking modal state (inside patient record)
  const [viewBooking, setViewBooking] = useState<PatientBooking | null>(null);
  const [viewBookingUpdating, setViewBookingUpdating] = useState(false);
  const [viewBookingError, setViewBookingError] = useState<string | null>(null);
  const [restoreFailedIds, setRestoreFailedIds] = useState<Set<string>>(new Set());

  // Cancel reason state (from View Booking modal)
  const [cancelBooking, setCancelBooking] = useState<PatientBooking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelCustomReason, setCancelCustomReason] = useState("");
  const [cancellingBooking, setCancellingBooking] = useState(false);
  const [cancelBookingError, setCancelBookingError] = useState<string | null>(null);

  // Duplicate detection state
  const [duplicates, setDuplicates] = useState<DuplicatePatient[]>([]);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);

  // Duplicate manual search state
  const [dupSearchInput, setDupSearchInput] = useState("");
  const [dupSearchResults, setDupSearchResults] = useState<DuplicatePatient[]>([]);
  const [dupSearching, setDupSearching] = useState(false);

  // Merge state
  const [mergeTarget, setMergeTarget] = useState<DuplicatePatient | null>(null);
  const [mergingPatient, setMergingPatient] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [mergeSuccess, setMergeSuccess] = useState<string | null>(null);

  // Link booking state
  const [linkingBookingId, setLinkingBookingId] = useState<string | null>(null);
  const [linkPatientSearch, setLinkPatientSearch] = useState("");
  const [linkSearchResults, setLinkSearchResults] = useState<PatientListItem[]>([]);
  const [linkingInProgress, setLinkingInProgress] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/admin/login"); return; }
      setUserEmail(session.user.email ?? null);
      setChecking(false);
    }
    checkSession();
  }, [router]);

  // Fetch patients
  const fetchPatients = useCallback(async (term: string) => {
    setLoading(true);
    setFetchError(null);
    try {
      const url = term
        ? `/api/admin/patients?search=${encodeURIComponent(term)}`
        : "/api/admin/patients";
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch patients.");
      setPatients(json.patients ?? []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load patients on mount + search change
  useEffect(() => {
    if (checking) return;
    fetchPatients(search);
  }, [checking, search, fetchPatients]);

  // Fetch patient detail
  const openDetail = useCallback(async (id: string) => {
    setLoadingDetail(true);
    setDetailError(null);
    setSelectedPatient(null);
    setPatientBookings([]);
    setPatientVisits([]);
    try {
      const res = await fetch(`/api/admin/patients?id=${encodeURIComponent(id)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load patient.");
      setSelectedPatient(json.patient);
      setPatientBookings(json.bookings ?? []);
      setPatientVisits(json.visits ?? []);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // Reset visit form
  const resetVisitForm = useCallback(() => {
    setVisitDate("");
    setVisitComplaint("");
    setVisitNotes("");
    setVisitMedicines("");
    setVisitFollowUp("");
    setVisitCondition("");
    setVisitSaveError(null);
    setVisitSaveSuccess(false);
  }, []);

  // Submit new visit
  const submitVisit = useCallback(async () => {
    if (!selectedPatient || !visitDate) return;
    setSavingVisit(true);
    setVisitSaveError(null);
    setVisitSaveSuccess(false);
    try {
      const res = await fetch("/api/admin/patients/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          visit_date_ad: visitDate,
          chief_complaint: visitComplaint.trim() || null,
          visit_notes: visitNotes.trim() || null,
          prescribed_medicines: visitMedicines.trim() || null,
          follow_up_instructions: visitFollowUp.trim() || null,
          condition_summary: visitCondition.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save visit.");
      resetVisitForm();
      setShowVisitForm(false);
      setVisitSaveSuccess(true);
      // Refresh detail
      openDetail(selectedPatient.id);
    } catch (err) {
      setVisitSaveError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSavingVisit(false);
    }
  }, [selectedPatient, visitDate, visitComplaint, visitNotes, visitMedicines, visitFollowUp, visitCondition, resetVisitForm, openDetail]);

  // Auto-open patient from URL ?id= param
  useEffect(() => {
    if (checking) return;
    const idParam = searchParams.get("id");
    if (idParam) {
      openDetail(idParam);
    }
  }, [checking, searchParams, openDetail]);

  // Active bookings: pending or confirmed
  const activeBookings = useMemo(
    () => patientBookings.filter((b) => b.status === "pending" || b.status === "confirmed"),
    [patientBookings]
  );

  // Open edit visit
  const openEditVisit = useCallback((v: PatientVisit) => {
    setEditingVisit(v);
    setEditDate(v.visit_date_ad);
    setEditComplaint(v.chief_complaint || "");
    setEditNotes(v.visit_notes || "");
    setEditMedicines(v.prescribed_medicines || "");
    setEditFollowUp(v.follow_up_instructions || "");
    setEditCondition(v.condition_summary || "");
    setEditError(null);
  }, []);

  // Submit edit visit
  const submitEditVisit = useCallback(async () => {
    if (!editingVisit || !editDate || !selectedPatient) return;
    setSavingEdit(true);
    setEditError(null);
    try {
      const res = await fetch("/api/admin/patients/visits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visit_id: editingVisit.id,
          visit_date_ad: editDate,
          chief_complaint: editComplaint.trim() || null,
          visit_notes: editNotes.trim() || null,
          prescribed_medicines: editMedicines.trim() || null,
          follow_up_instructions: editFollowUp.trim() || null,
          condition_summary: editCondition.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update visit.");
      setEditingVisit(null);
      openDetail(selectedPatient.id);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSavingEdit(false);
    }
  }, [editingVisit, editDate, editComplaint, editNotes, editMedicines, editFollowUp, editCondition, selectedPatient, openDetail]);

  // Open checkup from active booking
  const openCheckupFromBooking = useCallback(async (booking: PatientBooking) => {
    setCheckupBookingId(booking.id);
    setCheckupDate(todayAD());
    setCheckupComplaint(booking.problem || "");
    setCheckupNotes("");
    setCheckupMedicines("");
    setCheckupFollowUp("");
    setCheckupCondition("");
    setCheckupError(null);
    setCheckupSuccess(null);
    setCheckupHasVisit(false);

    // Check if visit already exists
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/checkup`);
      const json = await res.json();
      if (json.visit) {
        setCheckupHasVisit(true);
        setCheckupDate(json.visit.visit_date_ad || todayAD());
        setCheckupComplaint(json.visit.chief_complaint || "");
        setCheckupNotes(json.visit.visit_notes || "");
        setCheckupMedicines(json.visit.prescribed_medicines || "");
        setCheckupFollowUp(json.visit.follow_up_instructions || "");
        setCheckupCondition(json.visit.condition_summary || "");
      }
    } catch { /* use defaults */ }
  }, []);

  // Submit checkup from booking
  const submitCheckupFromBooking = useCallback(async (completeBooking: boolean) => {
    if (!checkupBookingId || !checkupDate) return;
    setSavingCheckup(true);
    setCheckupError(null);
    setCheckupSuccess(null);
    try {
      const res = await fetch(`/api/admin/bookings/${checkupBookingId}/checkup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visit_date_ad: checkupDate,
          chief_complaint: checkupComplaint.trim() || null,
          visit_notes: checkupNotes.trim() || null,
          prescribed_medicines: checkupMedicines.trim() || null,
          follow_up_instructions: checkupFollowUp.trim() || null,
          condition_summary: checkupCondition.trim() || null,
          complete_booking: completeBooking,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save visit.");
      setCheckupSuccess(completeBooking ? "Visit saved and appointment completed." : "Visit record saved.");
      // Refresh detail
      if (selectedPatient) openDetail(selectedPatient.id);
    } catch (err) {
      setCheckupError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSavingCheckup(false);
    }
  }, [checkupBookingId, checkupDate, checkupComplaint, checkupNotes, checkupMedicines, checkupFollowUp, checkupCondition, selectedPatient, openDetail]);

  // Open edit profile
  const openEditProfile = useCallback(() => {
    if (!selectedPatient) return;
    setEpName(selectedPatient.name);
    setEpPhone(selectedPatient.phone);
    setEpEmail(selectedPatient.email || "");
    setEpDob(selectedPatient.date_of_birth || "");
    setEpNotes(selectedPatient.notes || "");
    setEpIdentityNotes(selectedPatient.identity_notes || "");
    setProfileError(null);
    setShowEditProfile(true);
  }, [selectedPatient]);

  // Submit edit profile
  const submitEditProfile = useCallback(async () => {
    if (!selectedPatient) return;
    setSavingProfile(true);
    setProfileError(null);
    try {
      const res = await fetch("/api/admin/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPatient.id,
          name: epName.trim(),
          phone: epPhone.trim(),
          email: epEmail.trim() || null,
          date_of_birth: epDob || null,
          notes: epNotes.trim() || null,
          identity_notes: epIdentityNotes.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update patient.");
      setShowEditProfile(false);
      openDetail(selectedPatient.id);
      fetchPatients(search);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSavingProfile(false);
    }
  }, [selectedPatient, epName, epPhone, epEmail, epDob, epNotes, epIdentityNotes, openDetail, fetchPatients, search]);

  // Find duplicates
  const findDuplicates = useCallback(async () => {
    if (!selectedPatient) return;
    setLoadingDuplicates(true);
    setDuplicates([]);
    setShowDuplicates(true);
    setMergeSuccess(null);
    try {
      const res = await fetch(`/api/admin/patients?duplicates=${encodeURIComponent(selectedPatient.id)}`);
      const json = await res.json();
      if (res.ok) setDuplicates(json.duplicates ?? []);
    } catch { /* ignore */ } finally {
      setLoadingDuplicates(false);
    }
  }, [selectedPatient]);

  // Merge patients (source into current selected as target)
  const confirmMerge = useCallback(async () => {
    if (!selectedPatient || !mergeTarget) return;
    setMergingPatient(true);
    setMergeError(null);
    setMergeSuccess(null);
    try {
      const res = await fetch("/api/admin/patients/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_id: selectedPatient.id,
          source_id: mergeTarget.id,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to merge patients.");
      setMergeSuccess(json.message || "Patients merged successfully.");
      setMergeTarget(null);
      openDetail(selectedPatient.id);
      fetchPatients(search);
    } catch (err) {
      setMergeError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setMergingPatient(false);
    }
  }, [selectedPatient, mergeTarget, openDetail, fetchPatients, search]);

  // Search patients for linking
  const searchForLink = useCallback(async (term: string) => {
    if (!term.trim()) { setLinkSearchResults([]); return; }
    try {
      const res = await fetch(`/api/admin/patients?search=${encodeURIComponent(term.trim())}`);
      const json = await res.json();
      if (res.ok) setLinkSearchResults(json.patients ?? []);
    } catch { /* ignore */ }
  }, []);

  // Link booking to patient
  const linkBookingToPatient = useCallback(async (patientId: string) => {
    if (!linkingBookingId) return;
    setLinkingInProgress(true);
    setLinkError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${linkingBookingId}/link`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to link booking.");
      setLinkingBookingId(null);
      setLinkPatientSearch("");
      setLinkSearchResults([]);
      if (selectedPatient) openDetail(selectedPatient.id);
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLinkingInProgress(false);
    }
  }, [linkingBookingId, selectedPatient, openDetail]);

  // Update booking status from View Booking modal
  const updateBookingStatusFromModal = useCallback(async (bookingId: string, newStatus: string) => {
    setViewBookingUpdating(true);
    setViewBookingError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 409 && newStatus === "pending") {
          setRestoreFailedIds((cur) => new Set(cur).add(bookingId));
          throw new Error("Original slot is no longer available. Use Reschedule instead.");
        }
        throw new Error(json.error || "Update failed.");
      }
      setRestoreFailedIds((cur) => { const n = new Set(cur); n.delete(bookingId); return n; });
      setViewBooking(null);
      if (selectedPatient) openDetail(selectedPatient.id);
    } catch (err) {
      setViewBookingError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setViewBookingUpdating(false);
    }
  }, [selectedPatient, openDetail]);

  // Open cancel booking with reason
  const openCancelBooking = useCallback((b: PatientBooking) => {
    setCancelBooking(b);
    setCancelReason("");
    setCancelCustomReason("");
    setCancelBookingError(null);
    setViewBooking(null);
  }, []);

  // Submit cancel booking with reason
  const submitCancelBooking = useCallback(async () => {
    if (!cancelBooking) return;
    setCancellingBooking(true);
    setCancelBookingError(null);
    const reason = cancelReason === "__custom__" ? cancelCustomReason.trim() : cancelReason;
    try {
      const res = await fetch(`/api/bookings/${cancelBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled", cancellation_reason: reason || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Cancel failed.");
      setCancelBooking(null);
      if (selectedPatient) openDetail(selectedPatient.id);
    } catch (err) {
      setCancelBookingError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setCancellingBooking(false);
    }
  }, [cancelBooking, cancelReason, cancelCustomReason, selectedPatient, openDetail]);

  // Manual patient search inside duplicate review
  const searchDuplicatesManually = useCallback(async (term: string) => {
    if (!term.trim() || !selectedPatient) {
      setDupSearchResults([]);
      return;
    }
    setDupSearching(true);
    try {
      const res = await fetch(`/api/admin/patients?search=${encodeURIComponent(term.trim())}`);
      const json = await res.json();
      if (res.ok) {
        // Filter out the current patient from results
        const results = (json.patients ?? [])
          .filter((p: PatientListItem) => p.id !== selectedPatient.id)
          .map((p: PatientListItem) => ({
            id: p.id,
            phone: p.phone,
            email: p.email,
            name: p.name,
            date_of_birth: null,
            identity_notes: null,
            created_at: p.created_at,
          }));
        setDupSearchResults(results);
      }
    } catch { /* ignore */ } finally {
      setDupSearching(false);
    }
  }, [selectedPatient]);

  // Open Add Patient modal
  const openAddPatient = useCallback((withVisit: boolean) => {
    setShowAddPatient(true);
    setApName(""); setApPhone(""); setApEmail(""); setApDob("");
    setApNotes(""); setApIdentityNotes("");
    setAddPatientError(null);
    setSavingNewPatient(false);
    setApAddVisit(withVisit);
    setApVisitDate(withVisit ? todayAD() : "");
    setApVisitComplaint(""); setApVisitNotes(""); setApVisitMedicines("");
    setApVisitFollowUp(""); setApVisitCondition("");
    setShowWalkinSearch(false);
  }, []);

  // Submit new patient (+ optional walk-in visit)
  const submitAddPatient = useCallback(async () => {
    setSavingNewPatient(true);
    setAddPatientError(null);
    try {
      const res = await fetch("/api/admin/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: apName.trim(),
          phone: apPhone.trim(),
          email: apEmail.trim() || null,
          date_of_birth: apDob || null,
          notes: apNotes.trim() || null,
          identity_notes: apIdentityNotes.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create patient.");
      const newPatientId = json.patient.id;

      // If walk-in visit is included, create it
      if (apAddVisit && apVisitDate) {
        const vRes = await fetch("/api/admin/patients/visits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_id: newPatientId,
            visit_date_ad: apVisitDate,
            chief_complaint: apVisitComplaint.trim() || null,
            visit_notes: apVisitNotes.trim() || null,
            prescribed_medicines: apVisitMedicines.trim() || null,
            follow_up_instructions: apVisitFollowUp.trim() || null,
            condition_summary: apVisitCondition.trim() || null,
          }),
        });
        const vJson = await vRes.json();
        if (!vRes.ok) throw new Error(vJson.error || "Patient created but failed to save visit.");
      }

      setShowAddPatient(false);
      fetchPatients(search);
      openDetail(newPatientId);
    } catch (err) {
      setAddPatientError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSavingNewPatient(false);
    }
  }, [apName, apPhone, apEmail, apDob, apNotes, apIdentityNotes, apAddVisit, apVisitDate, apVisitComplaint, apVisitNotes, apVisitMedicines, apVisitFollowUp, apVisitCondition, fetchPatients, search, openDetail]);

  // Search for existing patient in walk-in flow
  const searchWalkinPatient = useCallback(async (term: string) => {
    if (!term.trim()) { setWalkinSearchResults([]); return; }
    setWalkinSearching(true);
    try {
      const res = await fetch(`/api/admin/patients?search=${encodeURIComponent(term.trim())}`);
      const json = await res.json();
      if (res.ok) setWalkinSearchResults(json.patients ?? []);
    } catch { /* ignore */ } finally {
      setWalkinSearching(false);
    }
  }, []);

  // Select existing patient for walk-in visit → open their record and show visit form
  const openWalkinVisitForPatient = useCallback(async (patientId: string) => {
    setShowWalkinSearch(false);
    setWalkinSearchInput("");
    setWalkinSearchResults([]);
    await openDetail(patientId);
    // After opening detail, show the visit form
    resetVisitForm();
    setVisitDate(todayAD());
    setShowVisitForm(true);
  }, [openDetail, resetVisitForm]);

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="font-body text-base text-text-secondary">Loading…</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-light">
      {/* ===== Header ===== */}
      <header className="bg-white border-b border-border px-4 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-1.053M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h1 className="font-heading text-xl font-bold text-text-primary">Patient Records</h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/dashboard"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              Dashboard
            </a>
            {userEmail && (
              <span className="font-body text-sm text-text-secondary hidden md:inline">{userEmail}</span>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ===== Left: Patient List ===== */}
          <div className="lg:col-span-1">
            {/* Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <label htmlFor="patient-search" className="sr-only">Search patients</label>
              <div className="relative">
                <input
                  id="patient-search"
                  type="text"
                  placeholder="Search by name, phone, or email…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2.5 pl-10 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
            </form>

            {/* Action buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => openAddPatient(false)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
                Add Patient
              </button>
              <button
                onClick={() => setShowWalkinSearch(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 font-body text-sm font-semibold text-white hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Walk-in Visit
              </button>
            </div>

            {/* Error */}
            {fetchError && (
              <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                <p className="font-body text-sm text-danger">{fetchError}</p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <svg className="h-5 w-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="ml-2 font-body text-sm text-text-secondary">Loading patients…</span>
              </div>
            )}

            {/* Empty state */}
            {!loading && !fetchError && patients.length === 0 && (
              <div className="rounded-2xl border border-border bg-white p-8 text-center">
                <svg className="mx-auto h-10 w-10 text-text-secondary/50" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-1.053M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                <p className="mt-3 font-body text-sm text-text-secondary">
                  {search ? "No patients match your search." : "No patients yet."}
                </p>
                {search && (
                  <button
                    onClick={() => { setSearchInput(""); setSearch(""); }}
                    className="mt-3 font-body text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}

            {/* Patient list */}
            {!loading && patients.length > 0 && (
              <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {patients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => openDetail(p.id)}
                    className={[
                      "w-full text-left rounded-xl border bg-white p-4 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      selectedPatient?.id === p.id ? "border-primary bg-primary/5" : "border-border",
                    ].join(" ")}
                  >
                    <p className="font-body text-sm font-semibold text-text-primary truncate">{p.name}</p>
                    <p className="font-body text-xs text-text-secondary mt-0.5">{p.phone}</p>
                    {p.email && <p className="font-body text-xs text-text-secondary truncate">{p.email}</p>}
                    <p className="font-body text-xs text-text-secondary/70 mt-1">Registered {formatDateTime(p.created_at)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== Right: Patient Detail ===== */}
          <div className="lg:col-span-2">
            {/* No selection */}
            {!selectedPatient && !loadingDetail && !detailError && (
              <div className="rounded-2xl border border-border bg-white p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-text-secondary/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <p className="mt-3 font-body text-base text-text-secondary">Select a patient to view details</p>
              </div>
            )}

            {/* Loading detail */}
            {loadingDetail && (
              <div className="rounded-2xl border border-border bg-white p-12 flex items-center justify-center">
                <svg className="h-5 w-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="ml-2 font-body text-sm text-text-secondary">Loading patient details…</span>
              </div>
            )}

            {/* Detail error */}
            {detailError && (
              <div className="rounded-2xl border border-danger/40 bg-danger/10 p-6">
                <p className="font-body text-sm text-danger">{detailError}</p>
              </div>
            )}

            {/* Patient detail */}
            {selectedPatient && !loadingDetail && (
              <div className="space-y-6">
                {/* Profile card */}
                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-lg font-bold text-text-primary">Patient Profile</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={openEditProfile}
                        className="rounded-md border border-border bg-white px-2.5 py-1 font-body text-xs font-semibold text-text-secondary hover:text-primary hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={findDuplicates}
                        disabled={loadingDuplicates}
                        className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 font-body text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                      >
                        {loadingDuplicates ? "Searching…" : "Find Duplicates"}
                      </button>
                    </div>
                  </div>
                  {/* Identity status badge */}
                  {selectedPatient.identity_status && selectedPatient.identity_status !== "normal" && (
                    <div className="mb-4">
                      {selectedPatient.identity_status === "shared_contact" && (
                        <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 font-body text-xs font-semibold text-blue-700">Shared Phone</span>
                      )}
                      {selectedPatient.identity_status === "possible_duplicate" && (
                        <span className="inline-block rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 font-body text-xs font-semibold text-amber-700">Possible Duplicate</span>
                      )}
                      {selectedPatient.identity_status === "needs_review" && (
                        <span className="inline-block rounded-full border border-red-200 bg-red-50 px-3 py-0.5 font-body text-xs font-semibold text-red-700">Needs Review</span>
                      )}
                    </div>
                  )}

                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 font-body text-sm">
                    <div>
                      <dt className="font-semibold text-text-secondary">Name</dt>
                      <dd className="text-text-primary mt-0.5">{selectedPatient.name}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-text-secondary">Phone</dt>
                      <dd className="text-text-primary mt-0.5">{selectedPatient.phone}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-text-secondary">Email</dt>
                      <dd className="text-text-primary mt-0.5">{selectedPatient.email || "—"}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-text-secondary">Date of Birth</dt>
                      <dd className="text-text-primary mt-0.5">
                        {selectedPatient.date_of_birth ? formatDate(selectedPatient.date_of_birth) : "—"}
                      </dd>
                    </div>
                    {selectedPatient.notes && (
                      <div className="sm:col-span-2">
                        <dt className="font-semibold text-text-secondary">General Patient Notes</dt>
                        <dd className="text-text-primary mt-0.5 whitespace-pre-wrap">{selectedPatient.notes}</dd>
                      </div>
                    )}
                    {selectedPatient.identity_notes && (
                      <div className="sm:col-span-2">
                        <dt className="font-semibold text-amber-700">Identity / Contact Notes</dt>
                        <dd className="text-text-primary mt-0.5 whitespace-pre-wrap">{selectedPatient.identity_notes}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="font-semibold text-text-secondary">Registered</dt>
                      <dd className="text-text-primary mt-0.5">{formatDateTime(selectedPatient.created_at)}</dd>
                    </div>
                  </dl>
                </div>

                {/* Duplicates panel */}
                {showDuplicates && (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="font-heading text-base font-bold text-amber-800">Duplicate Review</h2>
                      <button onClick={() => { setShowDuplicates(false); setMergeSuccess(null); setDupSearchInput(""); setDupSearchResults([]); }} className="rounded p-1 text-amber-700 hover:bg-amber-100 transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <p className="font-body text-xs text-amber-700 mb-4">
                      These are <strong>suggestions only</strong>. The system does not automatically merge records. Review each match carefully and decide whether to merge or keep separate.
                    </p>
                    {mergeSuccess && (
                      <div className="mb-3 rounded-lg border border-green-300 bg-green-50 px-4 py-3">
                        <p className="font-body text-sm text-green-800">{mergeSuccess}</p>
                      </div>
                    )}
                    {mergeError && (
                      <div className="mb-3 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                        <p className="font-body text-sm text-danger">{mergeError}</p>
                      </div>
                    )}

                    {/* Auto-detected duplicates */}
                    <p className="font-body text-xs font-semibold uppercase tracking-wider text-amber-800 mb-2">Auto-detected matches</p>
                    {loadingDuplicates ? (
                      <p className="font-body text-sm text-amber-700 mb-4">Searching…</p>
                    ) : duplicates.length === 0 ? (
                      <p className="font-body text-sm text-amber-700 mb-4">No potential duplicates found automatically.</p>
                    ) : (
                      <div className="space-y-3 mb-4">
                        {duplicates.map((d) => (
                          <div key={d.id} className="rounded-xl border border-amber-200 bg-white p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="font-body text-sm font-semibold text-text-primary">{d.name}</p>
                                <p className="font-body text-xs text-text-secondary">{d.phone}{d.email ? ` · ${d.email}` : ""}</p>
                                {d.date_of_birth && <p className="font-body text-xs text-text-secondary">DOB: {formatDate(d.date_of_birth)}</p>}
                                {d.identity_notes && <p className="font-body text-xs text-amber-700 mt-0.5">{d.identity_notes}</p>}
                              </div>
                              <div className="flex flex-shrink-0 gap-2">
                                <a
                                  href={`/admin/patients?id=${d.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-lg bg-primary/10 border border-primary/30 px-2.5 py-1.5 font-body text-xs font-semibold text-primary hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                  Compare
                                </a>
                                <button
                                  onClick={() => { setMergeTarget(d); setMergeError(null); }}
                                  disabled={mergingPatient}
                                  className="rounded-lg bg-red-50 border border-red-300 px-2.5 py-1.5 font-body text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                >
                                  Merge
                                </button>
                              </div>
                            </div>
                            {/* Comparison summary */}
                            {selectedPatient && (
                              <div className="mt-2 pt-2 border-t border-amber-100 grid grid-cols-2 gap-x-4 gap-y-1 font-body text-xs">
                                <div><span className="font-semibold text-text-secondary">This patient:</span></div>
                                <div><span className="font-semibold text-text-secondary">Match:</span></div>
                                <div className="text-text-primary">{selectedPatient.name}</div>
                                <div className="text-text-primary">{d.name}</div>
                                <div className="text-text-primary">{selectedPatient.phone}</div>
                                <div className="text-text-primary">{d.phone}</div>
                                <div className="text-text-primary">{selectedPatient.email || "—"}</div>
                                <div className="text-text-primary">{d.email || "—"}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Manual patient search */}
                    <div className="border-t border-amber-200 pt-4">
                      <p className="font-body text-xs font-semibold uppercase tracking-wider text-amber-800 mb-2">Manual search</p>
                      <p className="font-body text-xs text-amber-700 mb-2">Search by name, phone, email, or date of birth to find a specific patient to compare or merge.</p>
                      <div className="flex gap-2 mb-3">
                        <label htmlFor="dup-search" className="sr-only">Search patients</label>
                        <input
                          id="dup-search"
                          type="text"
                          value={dupSearchInput}
                          onChange={(e) => setDupSearchInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") searchDuplicatesManually(dupSearchInput); }}
                          placeholder="Name, phone, email, DOB…"
                          className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-1.5 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          onClick={() => searchDuplicatesManually(dupSearchInput)}
                          disabled={dupSearching || !dupSearchInput.trim()}
                          className="rounded-lg bg-amber-600 px-3 py-1.5 font-body text-xs font-semibold text-white hover:bg-amber-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        >
                          {dupSearching ? "Searching…" : "Search"}
                        </button>
                      </div>
                      {dupSearchResults.length > 0 && (
                        <div className="space-y-2">
                          {dupSearchResults.map((d) => (
                            <div key={d.id} className="rounded-xl border border-amber-200 bg-white p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <p className="font-body text-sm font-semibold text-text-primary">{d.name}</p>
                                  <p className="font-body text-xs text-text-secondary">{d.phone}{d.email ? ` · ${d.email}` : ""}</p>
                                </div>
                                <div className="flex flex-shrink-0 gap-2">
                                  <a
                                    href={`/admin/patients?id=${d.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg bg-primary/10 border border-primary/30 px-2.5 py-1.5 font-body text-xs font-semibold text-primary hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                  >
                                    Compare
                                  </a>
                                  <button
                                    onClick={() => { setMergeTarget(d); setMergeError(null); }}
                                    disabled={mergingPatient}
                                    className="rounded-lg bg-red-50 border border-red-300 px-2.5 py-1.5 font-body text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                  >
                                    Merge
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {dupSearchInput.trim() && !dupSearching && dupSearchResults.length === 0 && (
                        <p className="font-body text-sm text-amber-700">No patients found for this search.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Active Bookings */}
                {activeBookings.length > 0 && (
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
                    <h2 className="font-heading text-lg font-bold text-text-primary mb-4">Active Bookings</h2>
                    {activeBookings.length > 1 && (
                      <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2">
                        <p className="font-body text-xs font-semibold text-amber-700">This patient has {activeBookings.length} active bookings. Review for possible duplicates.</p>
                      </div>
                    )}
                    <div className="space-y-3">
                      {activeBookings.map((b) => {
                        const hasLinkedVisit = patientVisits.some((v) => v.booking_id === b.id);
                        return (
                          <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-4">
                            <div className="min-w-0 flex-1">
                              <p className="font-body text-sm font-semibold text-text-primary">
                                {formatDate(b.appointment_date_ad)} at {formatTime(b.appointment_time)}
                              </p>
                              <p className="font-body text-xs text-text-secondary truncate">{b.problem}</p>
                              <span className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[b.status] || ""}`}>
                                {b.status}
                              </span>
                            </div>
                            <div className="flex flex-shrink-0 gap-2">
                              {b.status === "confirmed" && (
                                <button
                                  onClick={() => openCheckupFromBooking(b)}
                                  className="rounded-lg bg-primary px-3 py-1.5 font-body text-xs font-semibold text-white hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                  {hasLinkedVisit ? "Continue Checkup" : "Start Checkup"}
                                </button>
                              )}
                              <button
                                onClick={() => { setViewBooking(b); setViewBookingError(null); }}
                                className="rounded-lg border border-border bg-white px-3 py-1.5 font-body text-xs font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Booking history */}
                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                  <h2 className="font-heading text-lg font-bold text-text-primary mb-4">Booking History</h2>
                  {patientBookings.length === 0 ? (
                    <p className="font-body text-sm text-text-secondary">No linked bookings yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-body text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="pb-2 pr-4 font-semibold text-text-secondary">Date</th>
                            <th className="pb-2 pr-4 font-semibold text-text-secondary">Time</th>
                            <th className="pb-2 pr-4 font-semibold text-text-secondary">Problem</th>
                            <th className="pb-2 font-semibold text-text-secondary">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patientBookings.map((b) => (
                            <tr key={b.id} className="border-b border-border/50 last:border-0">
                              <td className="py-2 pr-4 text-text-primary whitespace-nowrap">{formatDate(b.appointment_date_ad)}</td>
                              <td className="py-2 pr-4 text-text-primary whitespace-nowrap">{formatTime(b.appointment_time)}</td>
                              <td className="py-2 pr-4 text-text-primary max-w-[200px] truncate">{b.problem}</td>
                              <td className="py-2">
                                <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[b.status] || ""}`}>
                                  {b.status}
                                </span>
                                {b.status === "cancelled" && b.cancellation_reason && (
                                  <p className="mt-0.5 text-xs text-red-600 max-w-[180px] truncate" title={b.cancellation_reason}>{b.cancellation_reason}</p>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Visit history */}
                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-lg font-bold text-text-primary">Visit History</h2>
                    {!showVisitForm && (
                      <button
                        onClick={() => { resetVisitForm(); setShowVisitForm(true); }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add Visit
                      </button>
                    )}
                  </div>

                  {/* Visit save success */}
                  {visitSaveSuccess && (
                    <div className="mb-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3">
                      <p className="font-body text-sm text-green-800">Visit record saved successfully.</p>
                    </div>
                  )}

                  {/* Add visit form */}
                  {showVisitForm && (
                    <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-5">
                      <h3 className="font-heading text-base font-bold text-text-primary mb-4">New Visit Record</h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="visit-date" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                            Visit Date <span className="text-danger">*</span>
                          </label>
                          <input
                            id="visit-date"
                            type="date"
                            value={visitDate}
                            onChange={(e) => setVisitDate(e.target.value)}
                            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label htmlFor="visit-complaint" className="block font-body text-sm font-semibold text-text-secondary mb-1">Problem / Reason for Visit</label>
                          <input
                            id="visit-complaint"
                            type="text"
                            value={visitComplaint}
                            onChange={(e) => setVisitComplaint(e.target.value)}
                            placeholder="e.g. Headache, follow-up check"
                            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label htmlFor="visit-notes" className="block font-body text-sm font-semibold text-text-secondary mb-1">Doctor Notes</label>
                          <textarea
                            id="visit-notes"
                            rows={3}
                            value={visitNotes}
                            onChange={(e) => setVisitNotes(e.target.value)}
                            placeholder="Examination findings, diagnosis…"
                            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                          />
                        </div>
                        <div>
                          <label htmlFor="visit-medicines" className="block font-body text-sm font-semibold text-text-secondary mb-1">Prescribed Medicines</label>
                          <textarea
                            id="visit-medicines"
                            rows={2}
                            value={visitMedicines}
                            onChange={(e) => setVisitMedicines(e.target.value)}
                            placeholder="Medicine name, dosage, duration…"
                            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                          />
                        </div>
                        <div>
                          <label htmlFor="visit-followup" className="block font-body text-sm font-semibold text-text-secondary mb-1">Follow-up Instructions</label>
                          <textarea
                            id="visit-followup"
                            rows={2}
                            value={visitFollowUp}
                            onChange={(e) => setVisitFollowUp(e.target.value)}
                            placeholder="Return in 2 weeks, blood test before next visit…"
                            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                          />
                        </div>
                        <div>
                          <label htmlFor="visit-condition" className="block font-body text-sm font-semibold text-text-secondary mb-1">Condition / Status Update</label>
                          <input
                            id="visit-condition"
                            type="text"
                            value={visitCondition}
                            onChange={(e) => setVisitCondition(e.target.value)}
                            placeholder="e.g. Improving, Stable, Needs further tests"
                            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        {visitSaveError && (
                          <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-2">
                            <p className="font-body text-sm text-danger">{visitSaveError}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={submitVisit}
                            disabled={savingVisit || !visitDate}
                            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-body text-sm font-semibold text-white hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          >
                            {savingVisit ? (
                              <>
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Saving…
                              </>
                            ) : "Save Visit"}
                          </button>
                          <button
                            onClick={() => { setShowVisitForm(false); resetVisitForm(); }}
                            disabled={savingVisit}
                            className="rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {patientVisits.length === 0 && !showVisitForm ? (
                    <p className="font-body text-sm text-text-secondary">No visit records yet.</p>
                  ) : patientVisits.length > 0 ? (
                    <div className="space-y-4">
                      {patientVisits.map((v) => (
                        <div key={v.id} className="rounded-xl border border-border p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-body text-sm font-semibold text-text-primary">
                                {formatDate(v.visit_date_ad)}
                              </span>
                              {v.booking_id ? (
                                <span className="ml-2 inline-block rounded border border-primary/30 bg-primary/5 px-1.5 py-0.5 font-body text-xs text-primary">Linked to booking</span>
                              ) : (
                                <span className="ml-2 inline-block rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 font-body text-xs text-amber-700">Walk-in</span>
                              )}
                            </div>
                            <button
                              onClick={() => openEditVisit(v)}
                              className="rounded-md border border-border bg-white px-2.5 py-1 font-body text-xs font-semibold text-text-secondary hover:text-primary hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              Edit
                            </button>
                          </div>
                          <dl className="space-y-2 font-body text-sm">
                            {v.chief_complaint && (
                              <div>
                                <dt className="font-semibold text-text-secondary">Main Problem / Reason for Visit</dt>
                                <dd className="text-text-primary mt-0.5">{v.chief_complaint}</dd>
                              </div>
                            )}
                            {v.visit_notes && (
                              <div>
                                <dt className="font-semibold text-text-secondary">Visit Notes</dt>
                                <dd className="text-text-primary mt-0.5 whitespace-pre-wrap">{v.visit_notes}</dd>
                              </div>
                            )}
                            {v.prescribed_medicines && (
                              <div>
                                <dt className="font-semibold text-text-secondary">Prescribed Medicines</dt>
                                <dd className="text-text-primary mt-0.5 whitespace-pre-wrap">{v.prescribed_medicines}</dd>
                              </div>
                            )}
                            {v.follow_up_instructions && (
                              <div>
                                <dt className="font-semibold text-text-secondary">Follow-up Instructions</dt>
                                <dd className="text-text-primary mt-0.5 whitespace-pre-wrap">{v.follow_up_instructions}</dd>
                              </div>
                            )}
                            {v.condition_summary && (
                              <div>
                                <dt className="font-semibold text-text-secondary">Condition Summary</dt>
                                <dd className="text-text-primary mt-0.5 whitespace-pre-wrap">{v.condition_summary}</dd>
                              </div>
                            )}
                            {!v.chief_complaint && !v.visit_notes && !v.prescribed_medicines && !v.follow_up_instructions && !v.condition_summary && (
                              <p className="text-text-secondary italic">No notes recorded for this visit.</p>
                            )}
                          </dl>
                          {v.updated_at && v.updated_at !== v.created_at && (
                            <p className="mt-2 font-body text-xs text-text-secondary/70">
                              Last updated: {new Date(v.updated_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Edit Visit Modal ===== */}
      {editingVisit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !savingEdit && setEditingVisit(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Edit visit"
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-text-primary">Edit Visit</h2>
              <button
                onClick={() => setEditingVisit(null)}
                disabled={savingEdit}
                aria-label="Close"
                className="rounded-lg p-1 text-text-secondary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-visit-date" className="block font-body text-sm font-semibold text-text-secondary mb-1">Visit Date <span className="text-danger">*</span></label>
                <input id="edit-visit-date" type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} disabled={savingEdit} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="edit-visit-complaint" className="block font-body text-sm font-semibold text-text-secondary mb-1">Problem / Reason</label>
                <input id="edit-visit-complaint" type="text" value={editComplaint} onChange={(e) => setEditComplaint(e.target.value)} disabled={savingEdit} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="edit-visit-notes" className="block font-body text-sm font-semibold text-text-secondary mb-1">Doctor Notes</label>
                <textarea id="edit-visit-notes" rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} disabled={savingEdit} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="edit-visit-medicines" className="block font-body text-sm font-semibold text-text-secondary mb-1">Prescribed Medicines</label>
                <textarea id="edit-visit-medicines" rows={2} value={editMedicines} onChange={(e) => setEditMedicines(e.target.value)} disabled={savingEdit} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="edit-visit-followup" className="block font-body text-sm font-semibold text-text-secondary mb-1">Follow-up Instructions</label>
                <textarea id="edit-visit-followup" rows={2} value={editFollowUp} onChange={(e) => setEditFollowUp(e.target.value)} disabled={savingEdit} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="edit-visit-condition" className="block font-body text-sm font-semibold text-text-secondary mb-1">Condition / Status</label>
                <input id="edit-visit-condition" type="text" value={editCondition} onChange={(e) => setEditCondition(e.target.value)} disabled={savingEdit} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
            </div>
            {editError && (
              <div className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                <p className="font-body text-sm text-danger">{editError}</p>
              </div>
            )}
            <div className="mt-6 flex gap-2">
              <button
                onClick={submitEditVisit}
                disabled={savingEdit || !editDate}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-body text-sm font-semibold text-white hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {savingEdit ? "Saving…" : "Save Changes"}
              </button>
              <button
                onClick={() => setEditingVisit(null)}
                disabled={savingEdit}
                className="rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Checkup from Booking Modal ===== */}
      {checkupBookingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !savingCheckup && !checkupSuccess && setCheckupBookingId(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Patient checkup"
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-text-primary">
                {checkupHasVisit ? "Continue Checkup" : "Start Checkup"}
              </h2>
              <button
                onClick={() => setCheckupBookingId(null)}
                disabled={savingCheckup}
                aria-label="Close"
                className="rounded-lg p-1 text-text-secondary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {checkupSuccess ? (
              <div className="py-6 text-center">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-3 font-body text-base font-semibold text-text-primary">{checkupSuccess}</p>
                <button onClick={() => setCheckupBookingId(null)} className="mt-5 rounded-lg border border-border bg-white px-5 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Close</button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="bk-checkup-date" className="block font-body text-sm font-semibold text-text-secondary mb-1">Visit Date <span className="text-danger">*</span></label>
                    <input id="bk-checkup-date" type="date" value={checkupDate} onChange={(e) => setCheckupDate(e.target.value)} disabled={savingCheckup} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                  </div>
                  <div>
                    <label htmlFor="bk-checkup-complaint" className="block font-body text-sm font-semibold text-text-secondary mb-1">Problem / Reason</label>
                    <input id="bk-checkup-complaint" type="text" value={checkupComplaint} onChange={(e) => setCheckupComplaint(e.target.value)} disabled={savingCheckup} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                  </div>
                  <div>
                    <label htmlFor="bk-checkup-notes" className="block font-body text-sm font-semibold text-text-secondary mb-1">Doctor Notes</label>
                    <textarea id="bk-checkup-notes" rows={3} value={checkupNotes} onChange={(e) => setCheckupNotes(e.target.value)} disabled={savingCheckup} placeholder="Examination findings, diagnosis…" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50" />
                  </div>
                  <div>
                    <label htmlFor="bk-checkup-medicines" className="block font-body text-sm font-semibold text-text-secondary mb-1">Prescribed Medicines</label>
                    <textarea id="bk-checkup-medicines" rows={2} value={checkupMedicines} onChange={(e) => setCheckupMedicines(e.target.value)} disabled={savingCheckup} placeholder="Medicine name, dosage, duration…" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50" />
                  </div>
                  <div>
                    <label htmlFor="bk-checkup-followup" className="block font-body text-sm font-semibold text-text-secondary mb-1">Follow-up Instructions</label>
                    <textarea id="bk-checkup-followup" rows={2} value={checkupFollowUp} onChange={(e) => setCheckupFollowUp(e.target.value)} disabled={savingCheckup} placeholder="Return in 2 weeks…" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50" />
                  </div>
                  <div>
                    <label htmlFor="bk-checkup-condition" className="block font-body text-sm font-semibold text-text-secondary mb-1">Condition / Status</label>
                    <input id="bk-checkup-condition" type="text" value={checkupCondition} onChange={(e) => setCheckupCondition(e.target.value)} disabled={savingCheckup} placeholder="e.g. Improving, Stable" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                  </div>
                </div>
                {checkupError && (
                  <div className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                    <p className="font-body text-sm text-danger">{checkupError}</p>
                  </div>
                )}
                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    onClick={() => submitCheckupFromBooking(false)}
                    disabled={savingCheckup || !checkupDate}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary bg-white px-4 py-2 font-body text-sm font-semibold text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {savingCheckup ? "Saving…" : "Save Visit"}
                  </button>
                  <button
                    onClick={() => submitCheckupFromBooking(true)}
                    disabled={savingCheckup || !checkupDate}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-body text-sm font-semibold text-white hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {savingCheckup ? "Saving…" : "Save Visit & Complete"}
                  </button>
                  <button
                    onClick={() => setCheckupBookingId(null)}
                    disabled={savingCheckup}
                    className="rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== Edit Profile Modal ===== */}
      {showEditProfile && selectedPatient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !savingProfile && setShowEditProfile(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Edit patient profile"
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-text-primary">Edit Patient Profile</h2>
              <button onClick={() => setShowEditProfile(false)} disabled={savingProfile} aria-label="Close" className="rounded-lg p-1 text-text-secondary hover:bg-bg-light transition-colors disabled:opacity-50">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="ep-name" className="block font-body text-sm font-semibold text-text-secondary mb-1">Name <span className="text-danger">*</span></label>
                <input id="ep-name" type="text" value={epName} onChange={(e) => setEpName(e.target.value)} disabled={savingProfile} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="ep-phone" className="block font-body text-sm font-semibold text-text-secondary mb-1">Phone <span className="text-danger">*</span></label>
                <input id="ep-phone" type="text" value={epPhone} onChange={(e) => setEpPhone(e.target.value)} disabled={savingProfile} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="ep-email" className="block font-body text-sm font-semibold text-text-secondary mb-1">Email</label>
                <input id="ep-email" type="email" value={epEmail} onChange={(e) => setEpEmail(e.target.value)} disabled={savingProfile} placeholder="Optional" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="ep-dob" className="block font-body text-sm font-semibold text-text-secondary mb-1">Date of Birth</label>
                <input id="ep-dob" type="date" value={epDob} onChange={(e) => setEpDob(e.target.value)} disabled={savingProfile} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="ep-notes" className="block font-body text-sm font-semibold text-text-secondary mb-1">General Patient Notes</label>
                <textarea id="ep-notes" rows={2} value={epNotes} onChange={(e) => setEpNotes(e.target.value)} disabled={savingProfile} placeholder="General medical notes about this patient" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="ep-identity-notes" className="block font-body text-sm font-semibold text-text-secondary mb-1">Identity / Contact Notes</label>
                <textarea id="ep-identity-notes" rows={2} value={epIdentityNotes} onChange={(e) => setEpIdentityNotes(e.target.value)} disabled={savingProfile} placeholder="e.g. Uses son's phone number" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50" />
              </div>
            </div>
            {profileError && (
              <div className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                <p className="font-body text-sm text-danger">{profileError}</p>
              </div>
            )}
            <div className="mt-6 flex gap-2">
              <button onClick={submitEditProfile} disabled={savingProfile || !epName.trim() || !epPhone.trim()} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-body text-sm font-semibold text-white hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                {savingProfile ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={() => setShowEditProfile(false)} disabled={savingProfile} className="rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Merge Confirmation Modal ===== */}
      {mergeTarget && selectedPatient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !mergingPatient && setMergeTarget(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm merge"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-red-300 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 rounded-full bg-red-100 p-2">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="font-heading text-lg font-bold text-text-primary">Confirm Patient Merge</h2>
            </div>
            <div className="space-y-3 font-body text-sm text-text-primary">
              <p>This will merge <strong>{mergeTarget.name}</strong> ({mergeTarget.phone}) into <strong>{selectedPatient.name}</strong> ({selectedPatient.phone}).</p>
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                <p className="font-semibold text-amber-800 mb-1">What will happen:</p>
                <ul className="list-disc list-inside text-amber-700 space-y-1 text-xs">
                  <li>All bookings from <strong>{mergeTarget.name}</strong> will be moved to <strong>{selectedPatient.name}</strong></li>
                  <li>All visit records from <strong>{mergeTarget.name}</strong> will be moved to <strong>{selectedPatient.name}</strong></li>
                  <li>The duplicate patient record (<strong>{mergeTarget.name}</strong>) will be deleted</li>
                  <li>No medical history will be lost</li>
                </ul>
              </div>
              <p className="text-red-600 font-semibold">This action cannot be undone.</p>
            </div>
            {mergeError && (
              <div className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                <p className="font-body text-sm text-danger">{mergeError}</p>
              </div>
            )}
            <div className="mt-6 flex gap-2">
              <button
                onClick={confirmMerge}
                disabled={mergingPatient}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-body text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {mergingPatient ? "Merging…" : "Yes, Merge Patients"}
              </button>
              <button
                onClick={() => setMergeTarget(null)}
                disabled={mergingPatient}
                className="rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Link Booking Modal ===== */}
      {linkingBookingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !linkingInProgress && setLinkingBookingId(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Link booking to patient"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-text-primary">Link Booking to Patient</h2>
              <button onClick={() => setLinkingBookingId(null)} disabled={linkingInProgress} aria-label="Close" className="rounded-lg p-1 text-text-secondary hover:bg-bg-light transition-colors disabled:opacity-50">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="mb-4">
              <label htmlFor="link-search" className="block font-body text-sm font-semibold text-text-secondary mb-1">Search Patient</label>
              <input
                id="link-search"
                type="text"
                value={linkPatientSearch}
                onChange={(e) => { setLinkPatientSearch(e.target.value); searchForLink(e.target.value); }}
                disabled={linkingInProgress}
                placeholder="Name, phone, or email…"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>
            {linkError && (
              <div className="mb-3 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                <p className="font-body text-sm text-danger">{linkError}</p>
              </div>
            )}
            {linkSearchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {linkSearchResults.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-light p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-sm font-semibold text-text-primary">{p.name}</p>
                      <p className="font-body text-xs text-text-secondary">{p.phone}{p.email ? ` · ${p.email}` : ""}</p>
                    </div>
                    <button
                      onClick={() => linkBookingToPatient(p.id)}
                      disabled={linkingInProgress}
                      className="flex-shrink-0 rounded-lg bg-primary px-3 py-1.5 font-body text-xs font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {linkingInProgress ? "Linking…" : "Link"}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {linkPatientSearch.trim() && linkSearchResults.length === 0 && (
              <p className="font-body text-sm text-text-secondary">No patients found.</p>
            )}
          </div>
        </div>
      )}

      {/* ===== View Booking Modal (inside patient record) ===== */}
      {viewBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !viewBookingUpdating && setViewBooking(null)}
          role="dialog"
          aria-modal="true"
          aria-label="View booking"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-text-primary">Booking Details</h2>
              <button onClick={() => setViewBooking(null)} disabled={viewBookingUpdating} aria-label="Close" className="rounded-lg p-1 text-text-secondary hover:bg-bg-light transition-colors disabled:opacity-50">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <dl className="space-y-2 font-body text-sm mb-4">
              <div className="flex gap-3"><dt className="w-24 flex-shrink-0 font-semibold text-text-secondary">Patient</dt><dd className="text-text-primary">{viewBooking.patient_name}</dd></div>
              <div className="flex gap-3"><dt className="w-24 flex-shrink-0 font-semibold text-text-secondary">Phone</dt><dd className="text-text-primary">{viewBooking.patient_phone}</dd></div>
              <div className="flex gap-3"><dt className="w-24 flex-shrink-0 font-semibold text-text-secondary">Problem</dt><dd className="text-text-primary">{viewBooking.problem}</dd></div>
              <div className="flex gap-3"><dt className="w-24 flex-shrink-0 font-semibold text-text-secondary">Date</dt><dd className="text-text-primary">{formatDate(viewBooking.appointment_date_ad)}</dd></div>
              <div className="flex gap-3"><dt className="w-24 flex-shrink-0 font-semibold text-text-secondary">Time</dt><dd className="text-text-primary">{formatTime(viewBooking.appointment_time)}</dd></div>
              <div className="flex gap-3"><dt className="w-24 flex-shrink-0 font-semibold text-text-secondary">Status</dt><dd><span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[viewBooking.status] || ""}`}>{viewBooking.status}</span></dd></div>
              {viewBooking.status === "cancelled" && viewBooking.cancellation_reason && (
                <div className="flex gap-3"><dt className="w-24 flex-shrink-0 font-semibold text-text-secondary">Reason</dt><dd className="text-red-700">{viewBooking.cancellation_reason}</dd></div>
              )}
              {viewBooking.status === "cancelled" && viewBooking.cancelled_at && (
                <div className="flex gap-3"><dt className="w-24 flex-shrink-0 font-semibold text-text-secondary">Cancelled</dt><dd className="text-text-primary">{new Date(viewBooking.cancelled_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</dd></div>
              )}
            </dl>

            {viewBookingError && (
              <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                <p className="font-body text-sm text-danger">{viewBookingError}</p>
              </div>
            )}

            {/* Status-specific actions — no View Patient Record since we are inside the record */}
            <div className="border-t border-border pt-4">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">Actions</p>
              <div className="flex flex-wrap gap-2">
                {/* Pending: Confirm, Cancel, Reschedule */}
                {viewBooking.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateBookingStatusFromModal(viewBooking.id, "confirmed")}
                      disabled={viewBookingUpdating}
                      className="rounded-lg bg-green-50 border border-green-300 px-4 py-2 font-body text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => openCancelBooking(viewBooking)}
                      disabled={viewBookingUpdating}
                      className="rounded-lg bg-red-50 border border-red-300 px-4 py-2 font-body text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      Cancel Booking
                    </button>
                  </>
                )}

                {/* Confirmed: Reschedule, Cancel */}
                {viewBooking.status === "confirmed" && (
                  <>
                    <button
                      onClick={() => openCancelBooking(viewBooking)}
                      disabled={viewBookingUpdating}
                      className="rounded-lg bg-red-50 border border-red-300 px-4 py-2 font-body text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      Cancel Booking
                    </button>
                  </>
                )}

                {/* Completed: View/Edit Visit */}
                {viewBooking.status === "completed" && patientVisits.some((v) => v.booking_id === viewBooking.id) && (
                  <button
                    onClick={() => {
                      const visit = patientVisits.find((v) => v.booking_id === viewBooking.id);
                      if (visit) { openEditVisit(visit); setViewBooking(null); }
                    }}
                    className="rounded-lg bg-blue-50 border border-blue-300 px-4 py-2 font-body text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    View/Edit Visit
                  </button>
                )}

                {/* Cancelled: Restore, and Reschedule only after restore fails */}
                {viewBooking.status === "cancelled" && (
                  <>
                    <button
                      onClick={() => updateBookingStatusFromModal(viewBooking.id, "pending")}
                      disabled={viewBookingUpdating}
                      className="rounded-lg bg-amber-50 border border-amber-300 px-4 py-2 font-body text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                      Restore
                    </button>
                    {restoreFailedIds.has(viewBooking.id) && (
                      <p className="font-body text-xs text-text-secondary self-center">Slot unavailable. Use Dashboard to reschedule.</p>
                    )}
                  </>
                )}

                <button
                  onClick={() => setViewBooking(null)}
                  className="rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Cancel Booking with Reason Modal ===== */}
      {cancelBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !cancellingBooking && setCancelBooking(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Cancel booking"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-red-300 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 rounded-full bg-red-100 p-2">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="font-heading text-lg font-bold text-text-primary">Cancel Booking</h2>
            </div>

            <div className="font-body text-sm space-y-1 mb-5">
              <p><span className="font-semibold text-text-secondary">Patient:</span> <span className="text-text-primary">{cancelBooking.patient_name}</span></p>
              <p><span className="font-semibold text-text-secondary">Date:</span> <span className="text-text-primary">{formatDate(cancelBooking.appointment_date_ad)} at {formatTime(cancelBooking.appointment_time)}</span></p>
            </div>

            <div className="space-y-3">
              <label className="block font-body text-sm font-semibold text-text-secondary">Reason for cancellation</label>
              <div className="flex flex-wrap gap-2">
                {CANCEL_REASON_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => { setCancelReason(preset); setCancelCustomReason(""); }}
                    disabled={cancellingBooking}
                    className={[
                      "rounded-lg border px-3 py-1.5 font-body text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50",
                      cancelReason === preset
                        ? "border-red-400 bg-red-50 text-red-700"
                        : "border-border bg-white text-text-secondary hover:bg-bg-light",
                    ].join(" ")}
                  >
                    {preset}
                  </button>
                ))}
                <button
                  onClick={() => setCancelReason("__custom__")}
                  disabled={cancellingBooking}
                  className={[
                    "rounded-lg border px-3 py-1.5 font-body text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50",
                    cancelReason === "__custom__"
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-border bg-white text-text-secondary hover:bg-bg-light",
                  ].join(" ")}
                >
                  Other reason…
                </button>
              </div>

              {cancelReason === "__custom__" && (
                <div>
                  <label htmlFor="cancel-custom-patient" className="sr-only">Custom cancellation reason</label>
                  <textarea
                    id="cancel-custom-patient"
                    rows={2}
                    value={cancelCustomReason}
                    onChange={(e) => setCancelCustomReason(e.target.value)}
                    disabled={cancellingBooking}
                    placeholder="Enter reason…"
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50"
                  />
                </div>
              )}
            </div>

            {cancelBookingError && (
              <div className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                <p className="font-body text-sm text-danger">{cancelBookingError}</p>
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <button
                onClick={submitCancelBooking}
                disabled={cancellingBooking}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-body text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {cancellingBooking ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Cancelling…
                  </>
                ) : "Confirm Cancellation"}
              </button>
              <button
                onClick={() => setCancelBooking(null)}
                disabled={cancellingBooking}
                className="rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Add Patient Modal ===== */}
      {showAddPatient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !savingNewPatient && setShowAddPatient(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Add patient"
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-text-primary">
                {apAddVisit ? "New Walk-in Patient + Visit" : "Add Patient"}
              </h2>
              <button
                onClick={() => setShowAddPatient(false)}
                disabled={savingNewPatient}
                aria-label="Close"
                className="rounded-lg p-1 text-text-secondary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Patient Profile Fields */}
            <div className="space-y-4">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">Patient Information</p>
              <div>
                <label htmlFor="ap-name" className="block font-body text-sm font-semibold text-text-secondary mb-1">Full Name <span className="text-danger">*</span></label>
                <input id="ap-name" type="text" value={apName} onChange={(e) => setApName(e.target.value)} disabled={savingNewPatient} placeholder="Patient full name" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="ap-phone" className="block font-body text-sm font-semibold text-text-secondary mb-1">Phone <span className="text-danger">*</span></label>
                <input id="ap-phone" type="tel" value={apPhone} onChange={(e) => setApPhone(e.target.value)} disabled={savingNewPatient} placeholder="+977-98XXXXXXXX" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="ap-email" className="block font-body text-sm font-semibold text-text-secondary mb-1">Email <span className="font-normal text-text-secondary/60">(optional)</span></label>
                <input id="ap-email" type="email" value={apEmail} onChange={(e) => setApEmail(e.target.value)} disabled={savingNewPatient} placeholder="patient@example.com" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="ap-dob" className="block font-body text-sm font-semibold text-text-secondary mb-1">Date of Birth <span className="font-normal text-text-secondary/60">(optional)</span></label>
                <input id="ap-dob" type="date" value={apDob} onChange={(e) => setApDob(e.target.value)} disabled={savingNewPatient} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="ap-notes" className="block font-body text-sm font-semibold text-text-secondary mb-1">General Patient Notes <span className="font-normal text-text-secondary/60">(optional)</span></label>
                <textarea id="ap-notes" rows={2} value={apNotes} onChange={(e) => setApNotes(e.target.value)} disabled={savingNewPatient} placeholder="Allergies, chronic conditions, etc." className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="ap-id-notes" className="block font-body text-sm font-semibold text-text-secondary mb-1">Identity / Contact Notes <span className="font-normal text-text-secondary/60">(optional)</span></label>
                <textarea id="ap-id-notes" rows={2} value={apIdentityNotes} onChange={(e) => setApIdentityNotes(e.target.value)} disabled={savingNewPatient} placeholder="Alternate contacts, family member details…" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50" />
              </div>
            </div>

            {/* Toggle walk-in visit */}
            {!apAddVisit && (
              <button
                onClick={() => { setApAddVisit(true); setApVisitDate(todayAD()); }}
                disabled={savingNewPatient}
                className="mt-4 inline-flex items-center gap-1.5 font-body text-sm font-semibold text-accent hover:text-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Also add a walk-in visit record
              </button>
            )}

            {/* Walk-in Visit Fields */}
            {apAddVisit && (
              <div className="mt-5 pt-5 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">Walk-in Visit Record</p>
                  <button
                    onClick={() => setApAddVisit(false)}
                    disabled={savingNewPatient}
                    className="font-body text-xs text-text-secondary hover:text-danger transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
                <div>
                  <label htmlFor="ap-v-date" className="block font-body text-sm font-semibold text-text-secondary mb-1">Visit Date <span className="text-danger">*</span></label>
                  <input id="ap-v-date" type="date" value={apVisitDate} onChange={(e) => setApVisitDate(e.target.value)} disabled={savingNewPatient} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                </div>
                <div>
                  <label htmlFor="ap-v-complaint" className="block font-body text-sm font-semibold text-text-secondary mb-1">Problem / Reason for Visit</label>
                  <input id="ap-v-complaint" type="text" value={apVisitComplaint} onChange={(e) => setApVisitComplaint(e.target.value)} disabled={savingNewPatient} placeholder="e.g. Headache, follow-up" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                </div>
                <div>
                  <label htmlFor="ap-v-notes" className="block font-body text-sm font-semibold text-text-secondary mb-1">Doctor Notes</label>
                  <textarea id="ap-v-notes" rows={2} value={apVisitNotes} onChange={(e) => setApVisitNotes(e.target.value)} disabled={savingNewPatient} placeholder="Examination findings, diagnosis…" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50" />
                </div>
                <div>
                  <label htmlFor="ap-v-medicines" className="block font-body text-sm font-semibold text-text-secondary mb-1">Prescribed Medicines</label>
                  <textarea id="ap-v-medicines" rows={2} value={apVisitMedicines} onChange={(e) => setApVisitMedicines(e.target.value)} disabled={savingNewPatient} placeholder="Medicine name, dosage, duration…" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50" />
                </div>
                <div>
                  <label htmlFor="ap-v-followup" className="block font-body text-sm font-semibold text-text-secondary mb-1">Follow-up Instructions</label>
                  <textarea id="ap-v-followup" rows={2} value={apVisitFollowUp} onChange={(e) => setApVisitFollowUp(e.target.value)} disabled={savingNewPatient} placeholder="Return in 2 weeks…" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50" />
                </div>
                <div>
                  <label htmlFor="ap-v-condition" className="block font-body text-sm font-semibold text-text-secondary mb-1">Condition / Status</label>
                  <input id="ap-v-condition" type="text" value={apVisitCondition} onChange={(e) => setApVisitCondition(e.target.value)} disabled={savingNewPatient} placeholder="e.g. Improving, Stable" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                </div>
              </div>
            )}

            {addPatientError && (
              <div className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                <p className="font-body text-sm text-danger">{addPatientError}</p>
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <button
                onClick={submitAddPatient}
                disabled={savingNewPatient || !apName.trim() || !apPhone.trim() || (apAddVisit && !apVisitDate)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {savingNewPatient ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving…
                  </>
                ) : apAddVisit ? "Create Patient & Save Visit" : "Create Patient"}
              </button>
              <button
                onClick={() => setShowAddPatient(false)}
                disabled={savingNewPatient}
                className="rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Walk-in Visit Search Modal ===== */}
      {showWalkinSearch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowWalkinSearch(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Walk-in visit"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-text-primary">Walk-in Visit</h2>
              <button
                onClick={() => setShowWalkinSearch(false)}
                aria-label="Close"
                className="rounded-lg p-1 text-text-secondary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="font-body text-sm text-text-secondary mb-4">Search for an existing patient, or create a new patient record with a walk-in visit.</p>

            {/* Search existing */}
            <div className="mb-4">
              <label htmlFor="walkin-search" className="block font-body text-sm font-semibold text-text-secondary mb-1">Search Existing Patient</label>
              <div className="flex gap-2">
                <input
                  id="walkin-search"
                  type="text"
                  value={walkinSearchInput}
                  onChange={(e) => setWalkinSearchInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") searchWalkinPatient(walkinSearchInput); }}
                  placeholder="Name, phone, email, DOB…"
                  className="flex-1 rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => searchWalkinPatient(walkinSearchInput)}
                  disabled={walkinSearching || !walkinSearchInput.trim()}
                  className="rounded-lg bg-primary px-3 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {walkinSearching ? "…" : "Search"}
                </button>
              </div>
            </div>

            {/* Search results */}
            {walkinSearchResults.length > 0 && (
              <div className="mb-4 space-y-2 max-h-48 overflow-y-auto">
                {walkinSearchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => openWalkinVisitForPatient(p.id)}
                    className="w-full text-left rounded-xl border border-border bg-white p-3 hover:border-primary/40 hover:bg-primary/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <p className="font-body text-sm font-semibold text-text-primary">{p.name}</p>
                    <p className="font-body text-xs text-text-secondary">{p.phone}{p.email ? ` · ${p.email}` : ""}</p>
                  </button>
                ))}
              </div>
            )}
            {walkinSearchInput.trim() && !walkinSearching && walkinSearchResults.length === 0 && (
              <p className="mb-4 font-body text-sm text-text-secondary">No existing patients found.</p>
            )}

            {/* Create new patient option */}
            <div className="border-t border-border pt-4">
              <p className="font-body text-xs text-text-secondary mb-3">Patient not found? Create a new record with a walk-in visit.</p>
              <button
                onClick={() => { setShowWalkinSearch(false); openAddPatient(true); }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 font-body text-sm font-semibold text-white hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
                New Patient + Walk-in Visit
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
