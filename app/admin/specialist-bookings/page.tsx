"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStaffProfile } from "@/lib/useStaffProfile";
import AdminInactive from "@/components/AdminInactive";
import AdminPageHeader from "@/components/AdminPageHeader";
import { formatBS } from "@/lib/dateConvert";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SpecialistSummary {
  id: string;
  name: string;
  specialization: string;
  treatment_type: string;
  visit_date_ad: string;
  visit_date_bs: string;
  available_from: string;
  available_to: string;
  visit_location: string | null;
  consultation_fee: number | null;
  consultation_mode: string | null;
  is_active: boolean;
  slot_duration_minutes: number;
  max_patients: number | null;
}

interface SpecialistBooking {
  id: string;
  patient_id: string | null;
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  problem: string | null;
  appointment_date_bs: string;
  appointment_date_ad: string;
  appointment_time: string;
  booking_type: string;
  specialist_id: string | null;
  status: string;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  has_visit: boolean;
  booking_source: string | null;
}

interface SpecialistGroup {
  specialist: SpecialistSummary;
  bookings: SpecialistBooking[];
  counts: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
}

type DateRange = "today" | "upcoming" | "past" | "all";

const CANCEL_REASON_PRESETS = [
  "Patient requested cancellation",
  "Patient did not show up",
  "Specialist unavailable",
  "Duplicate booking",
  "Rescheduled to different time",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<string, string> = {
  pending: "border-amber-300 bg-amber-50 text-amber-800",
  confirmed: "border-green-300 bg-green-50 text-green-800",
  cancelled: "border-red-300 bg-red-50 text-red-800",
  completed: "border-slate-300 bg-slate-100 text-slate-700",
};

function todayAD() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function generateSlots(from: string, to: string, durationMinutes: number): string[] {
  const [fh, fm] = from.split(":").map(Number);
  const [th, tm] = to.split(":").map(Number);
  const startMin = fh * 60 + fm;
  const endMin = th * 60 + tm;
  const slots: string[] = [];
  for (let m = startMin; m + durationMinutes <= endMin; m += durationMinutes) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }
  return slots;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminSpecialistBookingsPage() {
  const router = useRouter();
  const { loading: staffLoading, profile: staffProfile, noSession, inactive } = useStaffProfile();
  const [checking, setChecking] = useState(true);

  // Data
  const [groups, setGroups] = useState<SpecialistGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters
  const [filterSpecialist, setFilterSpecialist] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterRange, setFilterRange] = useState<DateRange>("upcoming");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // Actions
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Cancel modal
  const [cancelBooking, setCancelBooking] = useState<SpecialistBooking | null>(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASON_PRESETS[0]);
  const [cancelCustom, setCancelCustom] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Reschedule modal
  const [rescheduleBooking, setRescheduleBooking] = useState<SpecialistBooking | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Detail modal
  const [selectedBooking, setSelectedBooking] = useState<SpecialistBooking | null>(null);

  // Checkup modal
  const [checkupBooking, setCheckupBooking] = useState<SpecialistBooking | null>(null);
  const [checkupDate, setCheckupDate] = useState("");
  const [checkupComplaint, setCheckupComplaint] = useState("");
  const [checkupNotes, setCheckupNotes] = useState("");
  const [checkupMedicines, setCheckupMedicines] = useState("");
  const [checkupFollowUp, setCheckupFollowUp] = useState("");
  const [checkupCondition, setCheckupCondition] = useState("");
  const [savingCheckup, setSavingCheckup] = useState(false);
  const [checkupError, setCheckupError] = useState<string | null>(null);
  const [checkupSuccess, setCheckupSuccess] = useState<string | null>(null);

  // Walk-in modal state
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInSpecialistId, setWalkInSpecialistId] = useState("");
  const [walkInPatientMode, setWalkInPatientMode] = useState<"search" | "new">("search");
  const [walkInSearchQuery, setWalkInSearchQuery] = useState("");
  const [walkInSearchResults, setWalkInSearchResults] = useState<{ id: string; name: string; phone: string; email: string | null }[]>([]);
  const [walkInSearching, setWalkInSearching] = useState(false);
  const [walkInSelectedPatient, setWalkInSelectedPatient] = useState<{ id: string; name: string; phone: string; email: string | null } | null>(null);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInEmail, setWalkInEmail] = useState("");
  const [walkInDob, setWalkInDob] = useState("");
  const [walkInGeneralNotes, setWalkInGeneralNotes] = useState("");
  const [walkInIdentityNotes, setWalkInIdentityNotes] = useState("");
  const [walkInProblem, setWalkInProblem] = useState("");
  const [walkInTime, setWalkInTime] = useState("");
  const [walkInSaving, setWalkInSaving] = useState(false);
  const [walkInError, setWalkInError] = useState<string | null>(null);
  const [walkInSuccess, setWalkInSuccess] = useState<string | null>(null);
  const [walkInCreatedBookingId, setWalkInCreatedBookingId] = useState<string | null>(null);
  const [walkInCreatedPatientId, setWalkInCreatedPatientId] = useState<string | null>(null);
  const [walkInIncludeVisit, setWalkInIncludeVisit] = useState(false);
  const [walkInVisitDate, setWalkInVisitDate] = useState("");
  const [walkInVisitNotes, setWalkInVisitNotes] = useState("");
  const [walkInVisitMedicines, setWalkInVisitMedicines] = useState("");
  const [walkInVisitFollowUp, setWalkInVisitFollowUp] = useState("");
  const [walkInVisitCondition, setWalkInVisitCondition] = useState("");

  // ---- Auth check ----
  useEffect(() => {
    if (!staffLoading) {
      if (noSession) { router.push("/admin/login"); return; }
      setChecking(false);
    }
  }, [staffLoading, noSession, router]);

  // ---- Fetch data ----
  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (filterSpecialist) params.set("specialist_id", filterSpecialist);
      if (filterDate) params.set("date", filterDate);
      else params.set("range", filterRange);
      if (filterStatus) params.set("status", filterStatus);
      if (filterSearch.trim()) params.set("search", filterSearch.trim());

      const res = await fetch(`/api/admin/specialist-bookings?${params.toString()}`);
      const data = await res.json();
      if (!data.success) {
        setFetchError(data.error || "Failed to load data.");
      } else {
        setGroups(data.groups ?? []);
      }
    } catch {
      setFetchError("Network error.");
    } finally {
      setLoading(false);
    }
  }, [filterSpecialist, filterDate, filterRange, filterStatus, filterSearch]);

  useEffect(() => {
    if (!checking) fetchData();
  }, [checking, fetchData]);

  // ---- Unique specialists for filter dropdown ----
  const specialistOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of groups) {
      map.set(g.specialist.id, g.specialist.name);
    }
    return Array.from(map.entries());
  }, [groups]);

  // ---- Status actions ----
  const updateStatus = async (bookingId: string, newStatus: string, reason?: string) => {
    setUpdatingId(bookingId);
    setActionError(null);
    setActionSuccess(null);
    try {
      const payload: Record<string, string> = { status: newStatus };
      if (reason) payload.cancellation_reason = reason;

      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        setActionError(data.error || "Failed to update status.");
        return false;
      }
      setActionSuccess(`Booking ${newStatus} successfully.`);
      fetchData();
      return true;
    } catch {
      setActionError("Network error.");
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirm = (b: SpecialistBooking) => updateStatus(b.id, "confirmed");
  const handleRestore = (b: SpecialistBooking) => updateStatus(b.id, "pending");

  // Cancel with reason
  const submitCancel = async () => {
    if (!cancelBooking) return;
    setCancelling(true);
    const reason = cancelReason === "Other" ? cancelCustom.trim() : cancelReason;
    const ok = await updateStatus(cancelBooking.id, "cancelled", reason);
    setCancelling(false);
    if (ok) setCancelBooking(null);
  };

  // Reschedule
  const submitReschedule = async () => {
    if (!rescheduleBooking || !rescheduleTime) return;
    setRescheduling(true);
    setRescheduleError(null);
    try {
      const res = await fetch(`/api/bookings/${rescheduleBooking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_date_ad: rescheduleBooking.appointment_date_ad,
          appointment_date_bs: rescheduleBooking.appointment_date_bs,
          appointment_time: rescheduleTime,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setRescheduleError(data.error || "Failed to reschedule.");
      } else {
        setRescheduleBooking(null);
        setActionSuccess("Booking rescheduled successfully.");
        fetchData();
      }
    } catch {
      setRescheduleError("Network error.");
    } finally {
      setRescheduling(false);
    }
  };

  // Get available slots for reschedule
  const getRescheduleSlots = (booking: SpecialistBooking): string[] => {
    const group = groups.find((g) => g.specialist.id === booking.specialist_id);
    if (!group) return [];
    const allSlots = generateSlots(
      group.specialist.available_from,
      group.specialist.available_to,
      group.specialist.slot_duration_minutes || 30
    );
    const bookedTimes = new Set(
      group.bookings
        .filter((b) => b.id !== booking.id && b.status !== "cancelled")
        .map((b) => b.appointment_time.slice(0, 5))
    );
    return allSlots.filter((s) => !bookedTimes.has(s));
  };

  // ---- Checkup: open ----
  const openCheckup = useCallback(async (b: SpecialistBooking) => {
    setCheckupBooking(b);
    setCheckupDate(todayAD());
    setCheckupComplaint(b.problem || "");
    setCheckupNotes("");
    setCheckupMedicines("");
    setCheckupFollowUp("");
    setCheckupCondition("");
    setCheckupError(null);
    setCheckupSuccess(null);
    setSelectedBooking(null);

    if (b.has_visit) {
      try {
        const res = await fetch(`/api/admin/bookings/${b.id}/checkup`);
        const json = await res.json();
        if (json.visit) {
          setCheckupDate(json.visit.visit_date_ad || todayAD());
          setCheckupComplaint(json.visit.chief_complaint || "");
          setCheckupNotes(json.visit.visit_notes || "");
          setCheckupMedicines(json.visit.prescribed_medicines || "");
          setCheckupFollowUp(json.visit.follow_up_instructions || "");
          setCheckupCondition(json.visit.condition_summary || "");
        }
      } catch { /* use defaults */ }
    }
  }, []);

  // ---- Checkup: submit ----
  const submitCheckup = useCallback(async (completeBooking: boolean) => {
    if (!checkupBooking || !checkupDate) return;
    setSavingCheckup(true);
    setCheckupError(null);
    setCheckupSuccess(null);
    try {
      const res = await fetch(`/api/admin/bookings/${checkupBooking.id}/checkup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visit_date_ad: checkupDate,
          chief_complaint: checkupComplaint.trim() || null,
          visit_notes: checkupNotes.trim() || null,
          prescribed_medicines: checkupMedicines.trim() || null,
          follow_up_instructions: checkupFollowUp.trim() || null,
          condition_summary: checkupCondition.trim() || null,
          doctor_id: staffProfile?.id || null,
          doctor_name_snapshot: staffProfile?.full_name || null,
          complete_booking: completeBooking,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save visit.");
      setCheckupSuccess(completeBooking ? "Visit saved and appointment completed." : "Visit record saved.");
      await fetchData();
    } catch (err) {
      setCheckupError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSavingCheckup(false);
    }
  }, [checkupBooking, checkupDate, checkupComplaint, checkupNotes, checkupMedicines, checkupFollowUp, checkupCondition, staffProfile, fetchData]);

  // ---- Walk-in: open modal ----
  const openWalkIn = useCallback((specialistId?: string) => {
    setWalkInOpen(true);
    setWalkInSpecialistId(specialistId || "");
    setWalkInPatientMode("search");
    setWalkInSearchQuery("");
    setWalkInSearchResults([]);
    setWalkInSelectedPatient(null);
    setWalkInName("");
    setWalkInPhone("");
    setWalkInEmail("");
    setWalkInDob("");
    setWalkInGeneralNotes("");
    setWalkInIdentityNotes("");
    setWalkInProblem("");
    // Default time = now
    const now = new Date();
    setWalkInTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
    setWalkInSaving(false);
    setWalkInError(null);
    setWalkInSuccess(null);
    setWalkInCreatedBookingId(null);
    setWalkInCreatedPatientId(null);
    setWalkInIncludeVisit(false);
    setWalkInVisitDate(todayAD());
    setWalkInVisitNotes("");
    setWalkInVisitMedicines("");
    setWalkInVisitFollowUp("");
    setWalkInVisitCondition("");
  }, []);

  // ---- Walk-in: search patients ----
  const searchPatients = useCallback(async () => {
    const q = walkInSearchQuery.trim();
    if (q.length < 2) return;
    setWalkInSearching(true);
    try {
      const res = await fetch(`/api/admin/patients?search=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.patients) {
        setWalkInSearchResults(
          data.patients.slice(0, 20).map((p: { id: string; name: string; phone: string; email?: string | null }) => ({
            id: p.id,
            name: p.name,
            phone: p.phone,
            email: p.email || null,
          }))
        );
      }
    } catch { /* ignore */ }
    setWalkInSearching(false);
  }, [walkInSearchQuery]);

  // ---- Walk-in: submit ----
  const submitWalkIn = useCallback(async (completeBooking?: boolean) => {
    if (!walkInSpecialistId) {
      setWalkInError("Please select a specialist visit.");
      return;
    }
    setWalkInSaving(true);
    setWalkInError(null);
    try {
      const payload: Record<string, string | boolean | undefined> = {
        specialist_id: walkInSpecialistId,
        problem: walkInProblem.trim() || undefined,
        appointment_time: walkInTime || undefined,
      };
      if (walkInSelectedPatient) {
        payload.patient_id = walkInSelectedPatient.id;
      } else {
        payload.patient_name = walkInName;
        payload.patient_phone = walkInPhone;
        payload.patient_email = walkInEmail || undefined;
        payload.date_of_birth = walkInDob || undefined;
        payload.general_notes = walkInGeneralNotes || undefined;
        payload.identity_notes = walkInIdentityNotes || undefined;
      }

      // Include visit fields if toggled on
      if (walkInIncludeVisit) {
        payload.include_visit = true;
        payload.visit_date_ad = walkInVisitDate || todayAD();
        payload.chief_complaint = walkInProblem.trim() || undefined;
        payload.visit_notes = walkInVisitNotes.trim() || undefined;
        payload.prescribed_medicines = walkInVisitMedicines.trim() || undefined;
        payload.follow_up_instructions = walkInVisitFollowUp.trim() || undefined;
        payload.condition_summary = walkInVisitCondition.trim() || undefined;
        payload.doctor_id = staffProfile?.id || undefined;
        payload.doctor_name_snapshot = staffProfile?.full_name || undefined;
        if (completeBooking) payload.complete_booking = true;
      }

      const res = await fetch("/api/admin/specialist-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        setWalkInError(data.error || "Failed to add walk-in.");
      } else {
        setWalkInCreatedBookingId(data.booking_id || null);
        setWalkInCreatedPatientId(data.patient_id || null);
        const visitMsg = walkInIncludeVisit ? (completeBooking ? " Visit saved and booking completed." : " Visit record saved.") : "";
        setWalkInSuccess(`Walk-in patient added to ${data.specialist_name || "specialist"} queue.${visitMsg}`);
        await fetchData();
      }
    } catch {
      setWalkInError("Network error.");
    } finally {
      setWalkInSaving(false);
    }
  }, [walkInSpecialistId, walkInProblem, walkInTime, walkInSelectedPatient, walkInName, walkInPhone, walkInEmail, walkInDob, walkInGeneralNotes, walkInIdentityNotes, walkInIncludeVisit, walkInVisitDate, walkInVisitNotes, walkInVisitMedicines, walkInVisitFollowUp, walkInVisitCondition, staffProfile, fetchData]);

  // ---- Walk-in: open checkup for created booking ----
  const openCheckupForWalkIn = useCallback(() => {
    if (!walkInCreatedBookingId || !walkInSpecialistId) return;

    // Build a synthetic SpecialistBooking from the walk-in data
    const group = groups.find((g) => g.specialist.id === walkInSpecialistId);
    const patientName = walkInSelectedPatient?.name || walkInName || "Walk-in Patient";
    const patientPhone = walkInSelectedPatient?.phone || walkInPhone || "";
    const patientEmail = walkInSelectedPatient?.email || walkInEmail || null;

    const syntheticBooking: SpecialistBooking = {
      id: walkInCreatedBookingId,
      patient_id: walkInCreatedPatientId,
      patient_name: patientName,
      patient_phone: patientPhone,
      patient_email: patientEmail,
      problem: walkInProblem.trim() || null,
      appointment_date_bs: group?.specialist.visit_date_bs || "",
      appointment_date_ad: group?.specialist.visit_date_ad || "",
      appointment_time: walkInTime ? (walkInTime.length === 5 ? `${walkInTime}:00` : walkInTime) : "",
      booking_type: "specialist",
      specialist_id: walkInSpecialistId,
      status: "confirmed",
      cancellation_reason: null,
      cancelled_at: null,
      created_at: new Date().toISOString(),
      has_visit: false,
      booking_source: "walk_in",
    };

    // Close walk-in modal and open checkup
    setWalkInOpen(false);
    openCheckup(syntheticBooking);
  }, [walkInCreatedBookingId, walkInCreatedPatientId, walkInSpecialistId, walkInSelectedPatient, walkInName, walkInPhone, walkInEmail, walkInProblem, walkInTime, groups, openCheckup]);

  // ---- Render guards ----
  if (checking || staffLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-light">
        <div className="flex items-center gap-3">
          <svg className="h-6 w-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="font-body text-base text-text-secondary">Loading…</span>
        </div>
      </div>
    );
  }
  if (inactive) return <AdminInactive />;

  return (
    <>
      <AdminPageHeader title="Specialist Bookings" description="View and manage bookings for visiting specialists.">
        <button
          onClick={() => openWalkIn()}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-body text-sm font-semibold text-white hover:bg-green-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Walk-in
        </button>
      </AdminPageHeader>

      <div className="mx-auto max-w-7xl">
        {/* Date Range Tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {([
            { key: "today", label: "Today" },
            { key: "upcoming", label: "Upcoming" },
            { key: "past", label: "Past" },
            { key: "all", label: "All" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setFilterRange(key); setFilterDate(""); }}
              className={[
                "rounded-lg px-4 py-2 font-body text-sm font-semibold transition-colors",
                filterRange === key && !filterDate
                  ? "bg-primary text-white"
                  : "border border-border bg-white text-text-primary hover:bg-bg-light",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block font-body text-xs font-semibold text-text-secondary mb-1">Specialist</label>
            <select
              value={filterSpecialist}
              onChange={(e) => setFilterSpecialist(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Specialists</option>
              {specialistOptions.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-body text-xs font-semibold text-text-secondary mb-1">Visit Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block font-body text-xs font-semibold text-text-secondary mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block font-body text-xs font-semibold text-text-secondary mb-1">Search Patient</label>
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Name or phone…"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Status messages */}
        {actionError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="font-body text-sm text-red-700">{actionError}</p>
          </div>
        )}
        {actionSuccess && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <p className="font-body text-sm text-green-700">{actionSuccess}</p>
          </div>
        )}

        {/* Loading / Error / Empty */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <svg className="h-6 w-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="ml-3 font-body text-sm text-text-secondary">Loading specialist bookings…</span>
          </div>
        )}
        {!loading && fetchError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center">
            <p className="font-body text-sm text-red-700">{fetchError}</p>
            <button onClick={fetchData} className="mt-3 rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors">
              Retry
            </button>
          </div>
        )}
        {!loading && !fetchError && groups.length === 0 && (
          <div className="rounded-xl border border-border bg-white px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-text-secondary/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
            </svg>
            <p className="mt-4 font-body text-base font-semibold text-text-primary">No specialist bookings found</p>
            <p className="mt-1 font-body text-sm text-text-secondary">
              {filterRange === "upcoming" ? "No upcoming specialist visits with bookings. Try \"All\" or \"Past\"." : "Adjust filters or wait for new specialist bookings."}
            </p>
          </div>
        )}

        {/* ===== Specialist Groups ===== */}
        {!loading && !fetchError && groups.length > 0 && (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.specialist.id} className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
                {/* Specialist Header Card */}
                <div className="border-b border-border bg-gradient-to-r from-purple-50 to-white p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-heading text-lg font-bold text-text-primary truncate">{group.specialist.name}</h2>
                        {!group.specialist.is_active && (
                          <span className="inline-block rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">Inactive</span>
                        )}
                      </div>
                      <p className="font-body text-sm text-text-secondary">
                        {group.specialist.specialization} &middot; {group.specialist.treatment_type}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-body text-xs text-text-secondary">
                        <span>{formatBS(group.specialist.visit_date_ad)} ({formatDate(group.specialist.visit_date_ad)})</span>
                        <span>{formatTime(group.specialist.available_from)} – {formatTime(group.specialist.available_to)}</span>
                        {group.specialist.visit_location && <span>{group.specialist.visit_location}</span>}
                        <span>{group.specialist.consultation_fee != null ? `NPR ${group.specialist.consultation_fee}` : "Free Consultation"}</span>
                      </div>
                    </div>
                    {/* Walk-in + Counts */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => openWalkIn(group.specialist.id)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-green-50 border border-green-300 px-3 py-1.5 font-body text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Walk-in
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      <div className="text-center px-2">
                        <p className="font-heading text-lg font-bold text-primary">{group.counts.total}</p>
                        <p className="font-body text-[10px] text-text-secondary uppercase">Total</p>
                      </div>
                      <div className="text-center px-2">
                        <p className="font-heading text-lg font-bold text-amber-700">{group.counts.pending}</p>
                        <p className="font-body text-[10px] text-text-secondary uppercase">Pending</p>
                      </div>
                      <div className="text-center px-2">
                        <p className="font-heading text-lg font-bold text-green-700">{group.counts.confirmed}</p>
                        <p className="font-body text-[10px] text-text-secondary uppercase">Confirmed</p>
                      </div>
                      <div className="text-center px-2">
                        <p className="font-heading text-lg font-bold text-slate-600">{group.counts.completed}</p>
                        <p className="font-body text-[10px] text-text-secondary uppercase">Done</p>
                      </div>
                      <div className="text-center px-2">
                        <p className="font-heading text-lg font-bold text-red-600">{group.counts.cancelled}</p>
                        <p className="font-body text-[10px] text-text-secondary uppercase">Cancelled</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bookings List — separated by source */}
                {(() => {
                  const onlineBookings = group.bookings.filter((b) => b.booking_source !== "walk_in");
                  const walkInBookings = group.bookings.filter((b) => b.booking_source === "walk_in");
                  if (onlineBookings.length === 0 && walkInBookings.length === 0) {
                    return (
                      <div className="p-4 text-center">
                        <p className="font-body text-sm text-text-secondary">No bookings match current filters.</p>
                      </div>
                    );
                  }

                  const renderBookingRow = (b: SpecialistBooking) => (
                    <div key={b.id} className="p-4 hover:bg-bg-light/40 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        {/* Patient Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-body text-sm font-semibold text-text-primary truncate">{b.patient_name}</p>
                            <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLES[b.status] ?? ""}`}>
                              {b.status}
                            </span>
                            {b.booking_source === "walk_in" && (
                              <span className="inline-block rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700">Walk-in</span>
                            )}
                          </div>
                          <p className="font-body text-xs text-text-secondary">{b.patient_phone} &middot; {formatTime(b.appointment_time)}</p>
                          {b.problem && <p className="font-body text-xs text-text-secondary truncate mt-0.5">{b.problem}</p>}
                          {b.status === "cancelled" && b.cancellation_reason && (
                            <p className="font-body text-xs text-red-600 mt-0.5 truncate" title={b.cancellation_reason}>{b.cancellation_reason}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 flex-shrink-0">
                          {/* View detail */}
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="rounded-md border border-border bg-white px-3 py-1.5 font-body text-xs font-semibold text-text-primary hover:bg-bg-light transition-colors"
                          >
                            View
                          </button>

                          {/* Confirm */}
                          {b.status === "pending" && (
                            <button
                              onClick={() => handleConfirm(b)}
                              disabled={updatingId === b.id}
                              className="rounded-md bg-green-50 border border-green-300 px-3 py-1.5 font-body text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              Confirm
                            </button>
                          )}

                          {/* Confirmed: Start/Continue Checkup */}
                          {b.status === "confirmed" && b.patient_id && (
                            <button
                              onClick={() => openCheckup(b)}
                              className="rounded-md bg-primary/10 border border-primary/30 px-3 py-1.5 font-body text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                            >
                              {b.has_visit ? "Continue Checkup" : "Start Checkup"}
                            </button>
                          )}

                          {/* Completed with visit: View/Edit Visit */}
                          {b.status === "completed" && b.has_visit && (
                            <button
                              onClick={() => openCheckup(b)}
                              className="rounded-md bg-blue-50 border border-blue-300 px-3 py-1.5 font-body text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                              View/Edit Visit
                            </button>
                          )}

                          {/* Cancel */}
                          {(b.status === "pending" || b.status === "confirmed") && (
                            <button
                              onClick={() => { setCancelBooking(b); setCancelReason(CANCEL_REASON_PRESETS[0]); setCancelCustom(""); }}
                              disabled={updatingId === b.id}
                              className="rounded-md bg-red-50 border border-red-300 px-3 py-1.5 font-body text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}

                          {/* Restore */}
                          {b.status === "cancelled" && (
                            <button
                              onClick={() => handleRestore(b)}
                              disabled={updatingId === b.id}
                              className="rounded-md bg-amber-50 border border-amber-300 px-3 py-1.5 font-body text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                            >
                              Restore
                            </button>
                          )}

                          {/* Reschedule */}
                          {b.status === "cancelled" && (
                            <button
                              onClick={() => { setRescheduleBooking(b); setRescheduleTime(""); setRescheduleError(null); }}
                              className="rounded-md bg-purple-50 border border-purple-300 px-3 py-1.5 font-body text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
                            >
                              Reschedule
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <>
                      {/* Online Appointments Section */}
                      {onlineBookings.length > 0 && (
                        <div>
                          <div className="border-b border-border bg-blue-50/50 px-4 py-2">
                            <h3 className="font-body text-xs font-bold uppercase tracking-wider text-blue-800">
                              Online Appointments [{onlineBookings.length}]
                            </h3>
                          </div>
                          <div className="divide-y divide-border">
                            {onlineBookings.map(renderBookingRow)}
                          </div>
                        </div>
                      )}

                      {/* Walk-in Queue Section */}
                      {walkInBookings.length > 0 && (
                        <div>
                          <div className="border-b border-border bg-orange-50/50 px-4 py-2 flex items-center justify-between">
                            <h3 className="font-body text-xs font-bold uppercase tracking-wider text-orange-800">
                              Walk-in Queue [{walkInBookings.length}]
                            </h3>
                          </div>
                          <div className="divide-y divide-border">
                            {walkInBookings.map(renderBookingRow)}
                          </div>
                        </div>
                      )}

                      {/* Edge case: both empty after filter */}
                      {onlineBookings.length === 0 && walkInBookings.length === 0 && (
                        <div className="p-4 text-center">
                          <p className="font-body text-sm text-text-secondary">No bookings match current filters.</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div className="h-4" />
      </div>

      {/* ===== Checkup Modal ===== */}
      {checkupBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !savingCheckup && !checkupSuccess && setCheckupBooking(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Specialist checkup"
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-text-primary">
                {checkupBooking.has_visit ? (checkupBooking.status === "completed" ? "View/Edit Visit" : "Continue Checkup") : "Specialist Checkup"}
              </h2>
              <button
                onClick={() => setCheckupBooking(null)}
                disabled={savingCheckup}
                aria-label="Close checkup"
                className="rounded-lg p-1 text-text-secondary hover:bg-bg-light transition-colors disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Success state */}
            {checkupSuccess ? (
              <div className="py-6 text-center">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-3 font-body text-base font-semibold text-text-primary">{checkupSuccess}</p>
                <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
                  {checkupBooking.patient_id && (
                    <a
                      href={`/admin/patients?id=${checkupBooking.patient_id}`}
                      className="rounded-lg bg-primary px-5 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                    >
                      View Patient Record
                    </a>
                  )}
                  <button
                    onClick={() => setCheckupBooking(null)}
                    className="rounded-lg border border-border bg-white px-5 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Booking context */}
                {(() => {
                  const g = groups.find((gr) => gr.specialist.id === checkupBooking.specialist_id);
                  const sp = g?.specialist;
                  const isWalkInBooking = checkupBooking.booking_source === "walk_in";
                  return (
                    <div className="font-body text-sm space-y-1.5 mb-5 rounded-lg bg-bg-light p-3 border border-border">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-text-secondary">Patient:</span>
                        <span className="text-text-primary font-semibold">{checkupBooking.patient_name}</span>
                        {isWalkInBooking && (
                          <span className="inline-block rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700">Walk-in</span>
                        )}
                      </div>
                      <p><span className="font-semibold text-text-secondary">Appointment:</span> <span className="text-text-primary">{formatDate(checkupBooking.appointment_date_ad)} at {formatTime(checkupBooking.appointment_time)}</span></p>
                      {sp && (
                        <>
                          <p><span className="font-semibold text-text-secondary">Specialist:</span> <span className="text-purple-700 font-semibold">{sp.name}</span></p>
                          <p className="text-xs text-text-secondary">{sp.specialization} · {sp.treatment_type}</p>
                          {sp.visit_location && <p className="text-xs text-text-secondary">Location: {sp.visit_location}</p>}
                          {sp.consultation_mode && <p className="text-xs text-text-secondary">Mode: {sp.consultation_mode === "in_person" ? "In-person" : sp.consultation_mode === "online" ? "Online" : sp.consultation_mode === "both" ? "In-person / Online" : sp.consultation_mode}</p>}
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* Checkup form */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="sp-checkup-date" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                      Visit Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="sp-checkup-date"
                      type="date"
                      value={checkupDate}
                      onChange={(e) => setCheckupDate(e.target.value)}
                      disabled={savingCheckup}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="sp-checkup-complaint" className="block font-body text-sm font-semibold text-text-secondary mb-1">Problem / Reason</label>
                    <input
                      id="sp-checkup-complaint"
                      type="text"
                      value={checkupComplaint}
                      onChange={(e) => setCheckupComplaint(e.target.value)}
                      disabled={savingCheckup}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="sp-checkup-notes" className="block font-body text-sm font-semibold text-text-secondary mb-1">Doctor Notes</label>
                    <textarea
                      id="sp-checkup-notes"
                      rows={3}
                      value={checkupNotes}
                      onChange={(e) => setCheckupNotes(e.target.value)}
                      disabled={savingCheckup}
                      placeholder="Examination findings, diagnosis..."
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="sp-checkup-medicines" className="block font-body text-sm font-semibold text-text-secondary mb-1">Prescribed Medicines</label>
                    <textarea
                      id="sp-checkup-medicines"
                      rows={2}
                      value={checkupMedicines}
                      onChange={(e) => setCheckupMedicines(e.target.value)}
                      disabled={savingCheckup}
                      placeholder="Medicine name, dosage, duration..."
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="sp-checkup-followup" className="block font-body text-sm font-semibold text-text-secondary mb-1">Follow-up Instructions</label>
                    <textarea
                      id="sp-checkup-followup"
                      rows={2}
                      value={checkupFollowUp}
                      onChange={(e) => setCheckupFollowUp(e.target.value)}
                      disabled={savingCheckup}
                      placeholder="Return in 2 weeks, blood test..."
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="sp-checkup-condition" className="block font-body text-sm font-semibold text-text-secondary mb-1">Condition / Status</label>
                    <input
                      id="sp-checkup-condition"
                      type="text"
                      value={checkupCondition}
                      onChange={(e) => setCheckupCondition(e.target.value)}
                      disabled={savingCheckup}
                      placeholder="e.g. Improving, Stable"
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />
                  </div>
                </div>

                {checkupError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <p className="font-body text-sm text-red-700">{checkupError}</p>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    onClick={() => submitCheckup(false)}
                    disabled={savingCheckup || !checkupDate}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary bg-white px-4 py-2 font-body text-sm font-semibold text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingCheckup ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Saving...
                      </>
                    ) : "Save Visit"}
                  </button>
                  {checkupBooking.status !== "completed" && (
                    <button
                      onClick={() => submitCheckup(true)}
                      disabled={savingCheckup || !checkupDate}
                      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-body text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingCheckup ? "Saving..." : "Save Visit & Complete"}
                    </button>
                  )}
                  <button
                    onClick={() => setCheckupBooking(null)}
                    disabled={savingCheckup}
                    className="rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== Cancel Modal ===== */}
      {cancelBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !cancelling && setCancelBooking(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Cancel specialist booking"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-lg font-bold text-text-primary mb-4">Cancel Specialist Booking</h2>
            <div className="font-body text-sm space-y-1 mb-4">
              <p><span className="font-semibold text-text-secondary">Patient:</span> {cancelBooking.patient_name}</p>
              <p><span className="font-semibold text-text-secondary">Time:</span> {formatTime(cancelBooking.appointment_time)}</p>
            </div>

            <div className="space-y-3">
              <label className="block font-body text-sm font-semibold text-text-secondary">Reason</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                disabled={cancelling}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                {CANCEL_REASON_PRESETS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
                <option value="Other">Other</option>
              </select>
              {cancelReason === "Other" && (
                <input
                  type="text"
                  value={cancelCustom}
                  onChange={(e) => setCancelCustom(e.target.value)}
                  placeholder="Enter reason…"
                  disabled={cancelling}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setCancelBooking(null)}
                disabled={cancelling}
                className="rounded-lg border border-border bg-white px-5 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={submitCancel}
                disabled={cancelling || (cancelReason === "Other" && !cancelCustom.trim())}
                className="rounded-lg bg-red-600 px-5 py-2 font-body text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Reschedule Modal ===== */}
      {rescheduleBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !rescheduling && setRescheduleBooking(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Reschedule specialist booking"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-lg font-bold text-text-primary mb-4">Reschedule Specialist Booking</h2>
            <div className="font-body text-sm space-y-1 mb-4">
              <p><span className="font-semibold text-text-secondary">Patient:</span> {rescheduleBooking.patient_name}</p>
              <p><span className="font-semibold text-text-secondary">Current Time:</span> {formatTime(rescheduleBooking.appointment_time)}</p>
            </div>

            <div className="space-y-3">
              <label className="block font-body text-sm font-semibold text-text-secondary">Select New Time</label>
              {(() => {
                const available = getRescheduleSlots(rescheduleBooking);
                if (available.length === 0) {
                  return <p className="font-body text-sm text-text-secondary">No available time slots for this specialist session.</p>;
                }
                return (
                  <div className="grid grid-cols-3 gap-2">
                    {available.map((t) => (
                      <button
                        key={t}
                        onClick={() => setRescheduleTime(t)}
                        disabled={rescheduling}
                        className={[
                          "rounded-lg border px-3 py-2 font-body text-sm font-semibold transition-colors disabled:opacity-50",
                          rescheduleTime === t
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-white text-text-primary hover:bg-bg-light",
                        ].join(" ")}
                      >
                        {formatTime(t + ":00")}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>

            {rescheduleError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <p className="font-body text-sm text-red-700">{rescheduleError}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setRescheduleBooking(null)}
                disabled={rescheduling}
                className="rounded-lg border border-border bg-white px-5 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={submitReschedule}
                disabled={rescheduling || !rescheduleTime}
                className="rounded-lg bg-primary px-5 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {rescheduling ? "Rescheduling…" : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Detail Modal ===== */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedBooking(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Specialist booking details"
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-text-primary">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                aria-label="Close details"
                className="rounded-lg p-1 text-text-secondary hover:bg-bg-light transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Badges */}
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-block rounded-full border border-purple-200 bg-purple-50 px-3 py-0.5 font-body text-xs font-semibold text-purple-700">Specialist Booking</span>
              <span className={`inline-block rounded-full border px-3 py-0.5 font-body text-xs font-semibold capitalize ${STATUS_STYLES[selectedBooking.status] ?? ""}`}>
                {selectedBooking.status}
              </span>
            </div>

            {/* Specialist Info */}
            {(() => {
              const group = groups.find((g) => g.specialist.id === selectedBooking.specialist_id);
              if (!group) return null;
              return (
                <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-3 mb-4 space-y-1">
                  <p className="font-semibold text-purple-800 text-xs uppercase tracking-wide">Specialist</p>
                  <p className="text-text-primary font-semibold">{group.specialist.name}</p>
                  <p className="text-text-secondary text-xs">{group.specialist.specialization} &middot; {group.specialist.treatment_type}</p>
                  {group.specialist.visit_location && <p className="text-text-secondary text-xs">Location: {group.specialist.visit_location}</p>}
                  <p className="text-text-secondary text-xs">Fee: {group.specialist.consultation_fee != null ? `NPR ${group.specialist.consultation_fee}` : "Free Consultation"}</p>
                </div>
              );
            })()}

            <dl className="space-y-3 font-body text-sm">
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Patient</dt><dd className="text-text-primary">{selectedBooking.patient_name}</dd></div>
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Phone</dt><dd className="text-text-primary">{selectedBooking.patient_phone}</dd></div>
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Email</dt><dd className="text-text-primary">{selectedBooking.patient_email || "—"}</dd></div>
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Problem</dt><dd className="text-text-primary whitespace-pre-wrap">{selectedBooking.problem || "—"}</dd></div>
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Date</dt><dd className="text-text-primary">{formatBS(selectedBooking.appointment_date_ad)} <span className="text-text-secondary text-xs">({formatDate(selectedBooking.appointment_date_ad)})</span></dd></div>
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Time</dt><dd className="text-text-primary">{formatTime(selectedBooking.appointment_time)}</dd></div>
              {selectedBooking.status === "cancelled" && selectedBooking.cancellation_reason && (
                <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Reason</dt><dd className="text-red-700">{selectedBooking.cancellation_reason}</dd></div>
              )}
              {selectedBooking.cancelled_at && (
                <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Cancelled</dt><dd className="text-text-primary">{new Date(selectedBooking.cancelled_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</dd></div>
              )}
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Created</dt><dd className="text-text-primary">{new Date(selectedBooking.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</dd></div>
            </dl>

            {/* Actions in modal */}
            <div className="mt-6 border-t border-border pt-4 flex flex-wrap gap-2">
              {selectedBooking.patient_id && (
                <a
                  href={`/admin/patients?id=${selectedBooking.patient_id}`}
                  className="rounded-lg bg-primary/10 border border-primary/30 px-4 py-2 font-body text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
                >
                  View Patient Record
                </a>
              )}
              {selectedBooking.status === "confirmed" && selectedBooking.patient_id && (
                <button
                  onClick={() => openCheckup(selectedBooking)}
                  className="rounded-lg bg-primary px-4 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                >
                  {selectedBooking.has_visit ? "Continue Checkup" : "Start Checkup"}
                </button>
              )}
              {selectedBooking.status === "completed" && selectedBooking.has_visit && (
                <button
                  onClick={() => openCheckup(selectedBooking)}
                  className="rounded-lg bg-blue-50 border border-blue-300 px-4 py-2 font-body text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  View/Edit Visit
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== Walk-in Modal ===== */}
      {walkInOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !walkInSaving && !walkInSuccess && setWalkInOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Add specialist walk-in patient"
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-text-primary">
                {walkInPatientMode === "new" && walkInIncludeVisit ? "New Walk-in Patient + Visit" : "Add Specialist Walk-in"}
              </h2>
              <button
                onClick={() => setWalkInOpen(false)}
                disabled={walkInSaving}
                aria-label="Close walk-in"
                className="rounded-lg p-1 text-text-secondary hover:bg-bg-light transition-colors disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Success state */}
            {walkInSuccess ? (
              <div className="py-6 text-center">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-3 font-body text-base font-semibold text-text-primary">{walkInSuccess}</p>
                <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
                  {walkInCreatedBookingId && walkInCreatedPatientId && (
                    <button
                      onClick={openCheckupForWalkIn}
                      className="rounded-lg bg-primary px-5 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                    >
                      Start Checkup
                    </button>
                  )}
                  <button
                    onClick={() => { setWalkInSuccess(null); openWalkIn(walkInSpecialistId || undefined); }}
                    className="rounded-lg bg-green-600 px-5 py-2 font-body text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                  >
                    Add Another Walk-in
                  </button>
                  <button
                    onClick={() => setWalkInOpen(false)}
                    className="rounded-lg border border-border bg-white px-5 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Specialist Selection */}
                <div className="mb-5">
                  <label htmlFor="walkin-specialist" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                    Specialist Visit <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="walkin-specialist"
                    value={walkInSpecialistId}
                    onChange={(e) => setWalkInSpecialistId(e.target.value)}
                    disabled={walkInSaving}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  >
                    <option value="">Select specialist visit…</option>
                    {groups.map((g) => (
                      <option key={g.specialist.id} value={g.specialist.id}>
                        {g.specialist.name} — {formatDate(g.specialist.visit_date_ad)} ({formatTime(g.specialist.available_from)}–{formatTime(g.specialist.available_to)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specialist details card */}
                {(() => {
                  const sg = groups.find((g) => g.specialist.id === walkInSpecialistId);
                  if (!sg) return null;
                  const sp = sg.specialist;
                  return (
                    <div className="mb-5 rounded-lg border border-purple-200 bg-purple-50/50 p-3 space-y-1 font-body text-xs text-text-secondary">
                      <p className="font-semibold text-purple-800 text-xs uppercase tracking-wide">Specialist Details</p>
                      <p className="text-text-primary font-semibold text-sm">{sp.name}</p>
                      <p>{sp.specialization} · {sp.treatment_type}</p>
                      <p>{formatBS(sp.visit_date_ad)} ({formatDate(sp.visit_date_ad)}) · {formatTime(sp.available_from)} – {formatTime(sp.available_to)}</p>
                      {sp.visit_location && <p>Location: {sp.visit_location}</p>}
                      <p>Fee: {sp.consultation_fee != null ? `NPR ${sp.consultation_fee}` : "Free Consultation"}</p>
                      {sp.consultation_mode && <p>Mode: {sp.consultation_mode === "in_person" ? "In-person" : sp.consultation_mode === "online" ? "Online" : sp.consultation_mode === "both" ? "In-person / Online" : sp.consultation_mode}</p>}
                    </div>
                  );
                })()}

                {/* Patient: Search or New tabs */}
                <div className="mb-4">
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => { setWalkInPatientMode("search"); setWalkInSelectedPatient(null); }}
                      className={`rounded-lg px-4 py-2 font-body text-sm font-semibold transition-colors ${walkInPatientMode === "search" ? "bg-primary text-white" : "border border-border bg-white text-text-primary hover:bg-bg-light"}`}
                    >
                      Search Existing
                    </button>
                    <button
                      onClick={() => { setWalkInPatientMode("new"); setWalkInSelectedPatient(null); }}
                      className={`rounded-lg px-4 py-2 font-body text-sm font-semibold transition-colors ${walkInPatientMode === "new" ? "bg-primary text-white" : "border border-border bg-white text-text-primary hover:bg-bg-light"}`}
                    >
                      New Patient
                    </button>
                  </div>

                  {walkInPatientMode === "search" && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={walkInSearchQuery}
                          onChange={(e) => setWalkInSearchQuery(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); searchPatients(); } }}
                          placeholder="Search by name, phone, or email…"
                          disabled={walkInSaving}
                          className="flex-1 rounded-lg border border-border bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                        />
                        <button
                          onClick={searchPatients}
                          disabled={walkInSearching || walkInSearchQuery.trim().length < 2}
                          className="rounded-lg bg-primary px-4 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          {walkInSearching ? "…" : "Search"}
                        </button>
                      </div>

                      {walkInSelectedPatient && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-center justify-between">
                          <div>
                            <p className="font-body text-sm font-semibold text-green-800">{walkInSelectedPatient.name}</p>
                            <p className="font-body text-xs text-green-700">{walkInSelectedPatient.phone}{walkInSelectedPatient.email ? ` · ${walkInSelectedPatient.email}` : ""}</p>
                          </div>
                          <button
                            onClick={() => setWalkInSelectedPatient(null)}
                            className="rounded-md border border-green-300 bg-white px-2 py-1 font-body text-xs font-semibold text-green-700 hover:bg-green-100"
                          >
                            Change
                          </button>
                        </div>
                      )}

                      {!walkInSelectedPatient && walkInSearchResults.length > 0 && (
                        <div className="max-h-40 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                          {walkInSearchResults.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => setWalkInSelectedPatient(p)}
                              className="w-full text-left px-3 py-2 hover:bg-bg-light transition-colors"
                            >
                              <p className="font-body text-sm font-semibold text-text-primary">{p.name}</p>
                              <p className="font-body text-xs text-text-secondary">{p.phone}{p.email ? ` · ${p.email}` : ""}</p>
                            </button>
                          ))}
                        </div>
                      )}

                      {!walkInSelectedPatient && walkInSearchResults.length === 0 && walkInSearchQuery.trim().length >= 2 && !walkInSearching && (
                        <p className="font-body text-xs text-text-secondary">No patients found. <button onClick={() => setWalkInPatientMode("new")} className="text-primary font-semibold hover:underline">Create new patient</button></p>
                      )}
                    </div>
                  )}

                  {walkInPatientMode === "new" && !walkInSelectedPatient && (
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="walkin-name" className="block font-body text-xs font-semibold text-text-secondary mb-1">Full Name <span className="text-red-600">*</span></label>
                        <input id="walkin-name" type="text" value={walkInName} onChange={(e) => setWalkInName(e.target.value)} disabled={walkInSaving} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                      </div>
                      <div>
                        <label htmlFor="walkin-phone" className="block font-body text-xs font-semibold text-text-secondary mb-1">Phone <span className="text-red-600">*</span></label>
                        <input id="walkin-phone" type="tel" value={walkInPhone} onChange={(e) => setWalkInPhone(e.target.value)} disabled={walkInSaving} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                      </div>
                      <div>
                        <label htmlFor="walkin-email" className="block font-body text-xs font-semibold text-text-secondary mb-1">Email (optional)</label>
                        <input id="walkin-email" type="email" value={walkInEmail} onChange={(e) => setWalkInEmail(e.target.value)} disabled={walkInSaving} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                      </div>
                      <div>
                        <label htmlFor="walkin-dob" className="block font-body text-xs font-semibold text-text-secondary mb-1">Date of Birth (optional)</label>
                        <input id="walkin-dob" type="date" value={walkInDob} onChange={(e) => setWalkInDob(e.target.value)} disabled={walkInSaving} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                      </div>
                      <div>
                        <label htmlFor="walkin-general-notes" className="block font-body text-xs font-semibold text-text-secondary mb-1">General Patient Notes</label>
                        <textarea id="walkin-general-notes" rows={2} value={walkInGeneralNotes} onChange={(e) => setWalkInGeneralNotes(e.target.value)} disabled={walkInSaving} placeholder="Medical history, allergies, etc." className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50" />
                      </div>
                      <div>
                        <label htmlFor="walkin-identity-notes" className="block font-body text-xs font-semibold text-text-secondary mb-1">Identity / Contact Notes</label>
                        <textarea id="walkin-identity-notes" rows={2} value={walkInIdentityNotes} onChange={(e) => setWalkInIdentityNotes(e.target.value)} disabled={walkInSaving} placeholder="e.g. Uses son's phone number" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Problem / Reason */}
                <div className="mb-4">
                  <label htmlFor="walkin-problem" className="block font-body text-sm font-semibold text-text-secondary mb-1">Problem / Reason for Visit</label>
                  <input
                    id="walkin-problem"
                    type="text"
                    value={walkInProblem}
                    onChange={(e) => setWalkInProblem(e.target.value)}
                    disabled={walkInSaving}
                    placeholder="e.g. Knee pain, follow-up consultation"
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                </div>

                {/* Walk-in Time */}
                <div className="mb-4">
                  <label htmlFor="walkin-time" className="block font-body text-sm font-semibold text-text-secondary mb-1">Walk-in Time</label>
                  <input
                    id="walkin-time"
                    type="time"
                    value={walkInTime}
                    onChange={(e) => setWalkInTime(e.target.value)}
                    disabled={walkInSaving}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                  <p className="mt-1 font-body text-xs text-text-secondary">Defaults to current time. Adjust if needed.</p>
                </div>

                {/* Walk-in Visit Record Toggle */}
                <div className="mb-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={walkInIncludeVisit}
                      onChange={(e) => setWalkInIncludeVisit(e.target.checked)}
                      disabled={walkInSaving}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
                    />
                    <span className="font-body text-sm font-semibold text-text-primary">Include Walk-in Visit Record</span>
                  </label>
                  <p className="mt-1 font-body text-xs text-text-secondary">Enable to enter checkup details now instead of later.</p>
                </div>

                {/* Walk-in Visit Record Fields */}
                {walkInIncludeVisit && (
                  <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50/30 p-4 space-y-3">
                    <p className="font-body text-xs font-bold uppercase tracking-wider text-orange-800">Walk-in Visit Record</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="walkin-visit-date" className="block font-body text-xs font-semibold text-text-secondary mb-1">Visit Date <span className="text-red-600">*</span></label>
                        <input id="walkin-visit-date" type="date" value={walkInVisitDate} onChange={(e) => setWalkInVisitDate(e.target.value)} disabled={walkInSaving} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                      </div>
                      <div>
                        <label className="block font-body text-xs font-semibold text-text-secondary mb-1">Visit Time</label>
                        <p className="rounded-lg border border-border bg-bg-light px-3 py-2 font-body text-sm text-text-secondary">{walkInTime ? formatTime(walkInTime + ":00") : "—"}</p>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="walkin-v-notes" className="block font-body text-xs font-semibold text-text-secondary mb-1">Doctor Notes</label>
                      <textarea id="walkin-v-notes" rows={3} value={walkInVisitNotes} onChange={(e) => setWalkInVisitNotes(e.target.value)} disabled={walkInSaving} placeholder="Examination findings, diagnosis..." className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50" />
                    </div>
                    <div>
                      <label htmlFor="walkin-v-medicines" className="block font-body text-xs font-semibold text-text-secondary mb-1">Prescribed Medicines</label>
                      <textarea id="walkin-v-medicines" rows={2} value={walkInVisitMedicines} onChange={(e) => setWalkInVisitMedicines(e.target.value)} disabled={walkInSaving} placeholder="Medicine name, dosage, duration..." className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50" />
                    </div>
                    <div>
                      <label htmlFor="walkin-v-followup" className="block font-body text-xs font-semibold text-text-secondary mb-1">Follow-up Instructions</label>
                      <textarea id="walkin-v-followup" rows={2} value={walkInVisitFollowUp} onChange={(e) => setWalkInVisitFollowUp(e.target.value)} disabled={walkInSaving} placeholder="Return in 2 weeks, blood test..." className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50" />
                    </div>
                    <div>
                      <label htmlFor="walkin-v-condition" className="block font-body text-xs font-semibold text-text-secondary mb-1">Condition / Status</label>
                      <input id="walkin-v-condition" type="text" value={walkInVisitCondition} onChange={(e) => setWalkInVisitCondition(e.target.value)} disabled={walkInSaving} placeholder="e.g. Improving, Stable" className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                    </div>
                  </div>
                )}

                {walkInError && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <p className="font-body text-sm text-red-700">{walkInError}</p>
                  </div>
                )}

                {/* Actions */}
                {(() => {
                  const formDisabled = walkInSaving || !walkInSpecialistId || (!walkInSelectedPatient && walkInPatientMode === "search") || (walkInPatientMode === "new" && (!walkInName.trim() || !walkInPhone.trim()));
                  const queueLabel = walkInPatientMode === "new" ? "Create Patient & Add to Queue" : "Add to Queue";
                  const savingSpinner = (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Saving…
                    </>
                  );

                  return (
                    <div className="flex flex-wrap gap-2">
                      {!walkInIncludeVisit ? (
                        <button
                          onClick={() => submitWalkIn()}
                          disabled={formDisabled}
                          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 font-body text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {walkInSaving ? savingSpinner : queueLabel}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => submitWalkIn()}
                            disabled={formDisabled || !walkInVisitDate}
                            className="inline-flex items-center gap-2 rounded-lg border border-primary bg-white px-4 py-2 font-body text-sm font-semibold text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {walkInSaving ? savingSpinner : (walkInPatientMode === "new" ? "Create Patient & Save Visit" : "Save Visit")}
                          </button>
                          <button
                            onClick={() => submitWalkIn(true)}
                            disabled={formDisabled || !walkInVisitDate}
                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-body text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {walkInSaving ? "Saving…" : "Save Visit & Complete"}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setWalkInOpen(false)}
                        disabled={walkInSaving}
                        className="rounded-lg border border-border bg-white px-5 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
