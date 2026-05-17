"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStaffProfile } from "@/lib/useStaffProfile";
import AdminInactive from "@/components/AdminInactive";
import LogoutButton from "../dashboard/LogoutButton";
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
  const { loading: staffLoading, userEmail, profile: staffProfile, noSession, inactive } = useStaffProfile();
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
    <div className="min-h-screen bg-bg-light">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/admin/dashboard" className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-light transition-colors" aria-label="Back to dashboard">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </a>
            <h1 className="font-heading text-xl font-bold text-text-primary">Specialist Bookings</h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/dashboard"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
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
                    {/* Counts */}
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

                {/* Bookings List */}
                {group.bookings.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="font-body text-sm text-text-secondary">No bookings match current filters.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {group.bookings.map((b) => (
                      <div key={b.id} className="p-4 hover:bg-bg-light/40 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          {/* Patient Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-body text-sm font-semibold text-text-primary truncate">{b.patient_name}</p>
                              <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLES[b.status] ?? ""}`}>
                                {b.status}
                              </span>
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

                            {/* Confirmed: Start/Continue Checkup (primary action — no standalone Complete) */}
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
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Future: Specialist Walk-in Patients */}
        <div className="mt-8 rounded-xl border border-dashed border-border bg-white/50 p-6 text-center">
          <p className="font-body text-sm text-text-secondary">Specialist walk-in patient registration will be available in Phase 9D.</p>
        </div>
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
                <div className="font-body text-sm space-y-1 mb-5 rounded-lg bg-bg-light p-3 border border-border">
                  <p><span className="font-semibold text-text-secondary">Patient:</span> <span className="text-text-primary">{checkupBooking.patient_name}</span></p>
                  <p><span className="font-semibold text-text-secondary">Appointment:</span> <span className="text-text-primary">{formatDate(checkupBooking.appointment_date_ad)} at {formatTime(checkupBooking.appointment_time)}</span></p>
                  {(() => {
                    const g = groups.find((gr) => gr.specialist.id === checkupBooking.specialist_id);
                    if (!g) return null;
                    return (
                      <p><span className="font-semibold text-text-secondary">Specialist:</span> <span className="text-purple-700">{g.specialist.name}</span></p>
                    );
                  })()}
                </div>

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
    </div>
  );
}
