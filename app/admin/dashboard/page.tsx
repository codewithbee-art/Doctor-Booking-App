"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStaffProfile } from "@/lib/useStaffProfile";
import AdminInactive from "@/components/AdminInactive";
import LogoutButton from "./LogoutButton";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Booking {
  id: string;
  patient_id: string | null;
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  problem: string;
  appointment_date_bs: string;
  appointment_date_ad: string;
  appointment_time: string;
  booking_type: string;
  specialist_id: string | null;
  status: string;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  visit_count: number;
  is_new_patient: boolean;
  has_visit: boolean;
}

const CANCEL_REASON_PRESETS = [
  "Patient requested cancellation",
  "Patient did not show up",
  "Doctor unavailable",
  "Duplicate booking",
  "Rescheduled to different date",
  "Clinic closed / holiday",
];

type FilterTab = "all" | "today" | "pending" | "confirmed" | "cancelled" | "completed";

interface AvailableSlot {
  id: string;
  slot_time: string;
  is_booked: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<string, string> = {
  pending:   "border-amber-300 bg-amber-50 text-amber-800",
  confirmed: "border-green-300 bg-green-50 text-green-800",
  cancelled: "border-red-300 bg-red-50 text-red-800",
  completed: "border-slate-300 bg-slate-100 text-slate-700",
};

const STAT_COLORS: Record<string, string> = {
  total:     "text-primary",
  pending:   "text-amber-700",
  confirmed: "text-green-700",
  cancelled: "text-red-700",
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function todayAD() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminDashboardPage() {
  const router = useRouter();
  const { loading: staffLoading, userEmail, profile: staffProfile, noSession, inactive } = useStaffProfile();
  const [checking, setChecking] = useState(true);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [restoreFailedIds, setRestoreFailedIds] = useState<Set<string>>(new Set());
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  // Cancel reason state
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelCustomReason, setCancelCustomReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Checkup state
  const [checkupBooking, setCheckupBooking] = useState<Booking | null>(null);
  const [checkupDate, setCheckupDate] = useState("");
  const [checkupComplaint, setCheckupComplaint] = useState("");
  const [checkupNotes, setCheckupNotes] = useState("");
  const [checkupMedicines, setCheckupMedicines] = useState("");
  const [checkupFollowUp, setCheckupFollowUp] = useState("");
  const [checkupCondition, setCheckupCondition] = useState("");
  const [savingCheckup, setSavingCheckup] = useState(false);
  const [checkupError, setCheckupError] = useState<string | null>(null);
  const [checkupSuccess, setCheckupSuccess] = useState<string | null>(null);

  /* ---- Auth + Role ---- */
  useEffect(() => {
    if (staffLoading) return;
    if (noSession) { router.replace("/admin/login"); return; }
    setChecking(false);
  }, [staffLoading, noSession, router]);

  /* ---- Fetch bookings ---- */
  useEffect(() => {
    if (checking) return;
    async function load() {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await fetch("/api/bookings");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load bookings");
        setBookings(json.bookings ?? []);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [checking]);

  /* ---- Derived data ---- */
  const stats = useMemo(() => ({
    total:     bookings.length,
    pending:   bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }), [bookings]);

  const filtered = useMemo(() => {
    const today = todayAD();
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (filter === "today"     && b.appointment_date_ad !== today)  return false;
      if (filter === "pending"   && b.status !== "pending")           return false;
      if (filter === "confirmed" && b.status !== "confirmed")         return false;
      if (filter === "cancelled" && b.status !== "cancelled")         return false;
      if (filter === "completed" && b.status !== "completed")         return false;
      if (q && !b.patient_name.toLowerCase().includes(q) && !b.patient_phone.includes(q)) return false;
      return true;
    });
  }, [bookings, filter, search]);

  /* ---- Status update (optimistic) ---- */
  const updateStatus = useCallback(async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    setUpdateError(null);

    const prev = bookings.find((b) => b.id === bookingId);
    if (!prev) return;

    // Optimistic: apply immediately
    setBookings((cur) => cur.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)));

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) {
        // Detect restore-from-cancelled failure due to slot conflict
        if (prev.status === "cancelled" && newStatus === "pending" && res.status === 409) {
          setRestoreFailedIds((cur) => new Set(cur).add(bookingId));
          throw new Error("Original slot is no longer available. Please reschedule this booking.");
        }
        throw new Error(json.error || "Update failed");
      }
      // Clear from restore-failed set on success
      setRestoreFailedIds((cur) => { const n = new Set(cur); n.delete(bookingId); return n; });
    } catch (err) {
      // Revert on failure
      setBookings((cur) => cur.map((b) => (b.id === bookingId ? { ...b, status: prev.status } : b)));
      setUpdateError(err instanceof Error ? err.message : "Failed to update status");
      setTimeout(() => setUpdateError(null), 6000);
    } finally {
      setUpdatingId(null);
    }
  }, [bookings]);

  /* ---- Reschedule: fetch available slots for chosen date ---- */
  useEffect(() => {
    if (!rescheduleDate) { setRescheduleSlots([]); return; }
    let cancelled = false;
    async function load() {
      setLoadingSlots(true);
      setRescheduleSlots([]);
      setRescheduleTime("");
      try {
        const res = await fetch(`/api/slots?date=${encodeURIComponent(rescheduleDate)}`);
        const json = await res.json();
        if (!cancelled && res.ok) setRescheduleSlots(json.slots ?? []);
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoadingSlots(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [rescheduleDate]);

  /* ---- Reschedule: open modal ---- */
  const openReschedule = useCallback((b: Booking) => {
    setRescheduleBooking(b);
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleSlots([]);
    setRescheduleError(null);
    setRescheduleSuccess(false);
  }, []);

  /* ---- Reschedule: submit ---- */
  const submitReschedule = useCallback(async () => {
    if (!rescheduleBooking || !rescheduleDate || !rescheduleTime) return;
    setRescheduling(true);
    setRescheduleError(null);
    try {
      const res = await fetch(`/api/bookings/${rescheduleBooking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_date_ad: rescheduleDate,
          appointment_time: rescheduleTime,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Reschedule failed");
      // Update local bookings
      const updated = json.booking as Booking;
      setBookings((cur) => cur.map((b) => (b.id === updated.id ? updated : b)));
      setRestoreFailedIds((cur) => { const n = new Set(cur); n.delete(updated.id); return n; });
      setRescheduleSuccess(true);
    } catch (err) {
      setRescheduleError(err instanceof Error ? err.message : "Reschedule failed");
    } finally {
      setRescheduling(false);
    }
  }, [rescheduleBooking, rescheduleDate, rescheduleTime]);

  /* ---- Refresh bookings ---- */
  const refreshBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings");
      const json = await res.json();
      if (res.ok) setBookings(json.bookings ?? []);
    } catch { /* ignore */ }
  }, []);

  /* ---- Cancel with reason: open ---- */
  const openCancel = useCallback((b: Booking) => {
    setCancelBooking(b);
    setCancelReason("");
    setCancelCustomReason("");
    setCancelError(null);
    setSelectedBooking(null);
  }, []);

  /* ---- Cancel with reason: submit ---- */
  const submitCancel = useCallback(async () => {
    if (!cancelBooking) return;
    setCancelling(true);
    setCancelError(null);
    const reason = cancelReason === "__custom__" ? cancelCustomReason.trim() : cancelReason;
    try {
      const res = await fetch(`/api/bookings/${cancelBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled", cancellation_reason: reason || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Cancel failed");
      setBookings((cur) => cur.map((b) => (b.id === cancelBooking.id ? { ...b, status: "cancelled", cancellation_reason: reason || null, cancelled_at: new Date().toISOString() } : b)));
      setCancelBooking(null);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  }, [cancelBooking, cancelReason, cancelCustomReason]);

  /* ---- Checkup: open ---- */
  const openCheckup = useCallback(async (b: Booking) => {
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

    // If a visit already exists for this booking, load it
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

  /* ---- Checkup: submit ---- */
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
      // Refresh bookings to reflect status change
      await refreshBookings();
    } catch (err) {
      setCheckupError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSavingCheckup(false);
    }
  }, [checkupBooking, checkupDate, checkupComplaint, checkupNotes, checkupMedicines, checkupFollowUp, checkupCondition, staffProfile, refreshBookings]);

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

  /* ---- Filter tab config ---- */
  const TABS: { key: FilterTab; label: string }[] = [
    { key: "all",       label: "All" },
    { key: "today",     label: "Today" },
    { key: "pending",   label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "cancelled", label: "Cancelled" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <main className="min-h-screen bg-bg-light">
      {/* ===== Header ===== */}
      <header className="bg-white border-b border-border px-4 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
            </div>
            <h1 className="font-heading text-xl font-bold text-text-primary">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/patients"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-1.053M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Patients
            </a>
            <a
              href="/admin/availability"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              Availability
            </a>
            {staffProfile?.role === "owner" && (
              <a
                href="/admin/staff"
                className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                Staff
              </a>
            )}
            {userEmail && (
              <span className="font-body text-sm text-text-secondary hidden md:inline">{userEmail}</span>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* ===== Stat Cards ===== */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
          {([
            { label: "Total Bookings", key: "total"     },
            { label: "Pending",        key: "pending"   },
            { label: "Confirmed",      key: "confirmed" },
            { label: "Cancelled",      key: "cancelled" },
          ] as const).map(({ label, key }) => (
            <div key={key} className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <p className="font-body text-sm text-text-secondary">{label}</p>
              <p className={`mt-1 font-heading text-2xl font-bold ${STAT_COLORS[key]}`}>
                {stats[key]}
              </p>
            </div>
          ))}
        </div>

        {/* ===== Filters + Search ===== */}
        <div className="rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-border px-4 py-4 sm:px-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter bookings">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={filter === key}
                  onClick={() => setFilter(key)}
                  className={[
                    "rounded-lg px-4 py-2 font-body text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    filter === key
                      ? "bg-primary text-white"
                      : "bg-bg-light text-text-secondary hover:bg-border hover:text-text-primary",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative">
              <label htmlFor="booking-search" className="sr-only">Search by patient name or phone</label>
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                id="booking-search"
                type="text"
                placeholder="Search name or phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 rounded-lg border border-border bg-white py-2 pl-9 pr-4 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* ===== Content area ===== */}
          <div className="p-4 sm:p-6">
            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <svg className="h-8 w-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="ml-3 font-body text-sm text-text-secondary">Loading bookings…</span>
              </div>
            )}

            {/* Error */}
            {!loading && fetchError && (
              <div className="rounded-xl border border-danger/40 bg-danger/10 p-6 text-center">
                <p className="font-body text-base font-semibold text-danger">Failed to load bookings</p>
                <p className="mt-1 font-body text-sm text-text-secondary">{fetchError}</p>
              </div>
            )}

            {/* Empty */}
            {!loading && !fetchError && filtered.length === 0 && (
              <div className="py-16 text-center">
                <svg className="mx-auto h-12 w-12 text-border" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                </svg>
                <p className="mt-3 font-body text-base font-semibold text-text-secondary">No bookings found</p>
                <p className="mt-1 font-body text-sm text-text-secondary">
                  {search.trim() ? "Try a different search term." : "Bookings will appear here once patients submit appointments."}
                </p>
              </div>
            )}

            {/* Table */}
            {!loading && !fetchError && filtered.length > 0 && (
              <div className="overflow-x-auto -mx-4 sm:-mx-6">
                <table className="w-full min-w-[600px] text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">#</th>
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">Patient</th>
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">Date &amp; Time</th>
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">Status</th>
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary sr-only sm:not-sr-only">Type</th>
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b, i) => (
                      <tr key={b.id} className="border-b border-border last:border-b-0 hover:bg-bg-light/60 transition-colors">
                        <td className="px-4 py-3 font-body text-sm text-text-secondary">{i + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-body text-sm font-semibold text-text-primary">{b.patient_name}</p>
                          <p className="font-body text-xs text-text-secondary">{b.patient_phone}</p>
                        </td>
                        <td className="px-4 py-3 font-body text-sm text-text-primary whitespace-nowrap">
                          {formatDate(b.appointment_date_ad)}<br />
                          <span className="text-text-secondary text-xs">{formatTime(b.appointment_time)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full border px-3 py-0.5 font-body text-xs font-semibold capitalize ${STATUS_STYLES[b.status] ?? "border-border bg-bg-light text-text-secondary"}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {b.is_new_patient ? (
                            <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 font-body text-xs font-semibold text-blue-700">New</span>
                          ) : (
                            <span className="inline-block rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 font-body text-xs font-semibold text-green-700">
                              Returning{b.visit_count > 0 ? ` (${b.visit_count})` : ""}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="rounded-md bg-primary/10 border border-primary/30 px-3 py-1.5 font-body text-xs font-semibold text-primary hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Update error toast */}
          {updateError && (
            <div className="mx-4 mb-4 sm:mx-6 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 flex items-center gap-2">
              <svg className="h-4 w-4 flex-shrink-0 text-danger" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="font-body text-sm text-danger">{updateError}</p>
            </div>
          )}

          {/* Footer count */}
          {!loading && !fetchError && (
            <div className="border-t border-border px-4 py-3 sm:px-6">
              <p className="font-body text-sm text-text-secondary">
                Showing {filtered.length} of {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>
      {/* ===== Reschedule Modal ===== */}
      {rescheduleBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !rescheduling && setRescheduleBooking(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Reschedule booking"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-text-primary">Reschedule Booking</h2>
              <button
                onClick={() => setRescheduleBooking(null)}
                disabled={rescheduling}
                aria-label="Close reschedule"
                className="rounded-lg p-1 text-text-secondary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {rescheduleSuccess ? (
              <div className="py-6 text-center">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-3 font-body text-base font-semibold text-text-primary">Booking rescheduled successfully</p>
                <p className="mt-1 font-body text-sm text-text-secondary">Patient notification will be added when email notifications are implemented.</p>
                <button
                  onClick={() => setRescheduleBooking(null)}
                  className="mt-5 rounded-lg border border-border bg-white px-5 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="font-body text-sm space-y-1 mb-5">
                  <p><span className="font-semibold text-text-secondary">Patient:</span> <span className="text-text-primary">{rescheduleBooking.patient_name}</span></p>
                  <p><span className="font-semibold text-text-secondary">Current:</span> <span className="text-text-primary">{formatDate(rescheduleBooking.appointment_date_ad)} at {formatTime(rescheduleBooking.appointment_time)}</span></p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="resched-date" className="block font-body text-sm font-semibold text-text-secondary mb-1">New Date</label>
                    <input
                      id="resched-date"
                      type="date"
                      value={rescheduleDate}
                      min={todayAD()}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      disabled={rescheduling}
                      className="w-full rounded-lg border border-border bg-white px-4 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="resched-time" className="block font-body text-sm font-semibold text-text-secondary mb-1">New Time</label>
                    {!rescheduleDate && (
                      <p className="font-body text-sm text-text-secondary">Select a date first.</p>
                    )}
                    {rescheduleDate && loadingSlots && (
                      <div className="flex items-center gap-2 py-2">
                        <svg className="h-4 w-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span className="font-body text-sm text-text-secondary">Loading slots…</span>
                      </div>
                    )}
                    {rescheduleDate && !loadingSlots && rescheduleSlots.length === 0 && (
                      <p className="font-body text-sm text-text-secondary">No available slots for this date.</p>
                    )}
                    {rescheduleDate && !loadingSlots && rescheduleSlots.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {rescheduleSlots.filter((s) => !s.is_booked).map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setRescheduleTime(s.slot_time)}
                            disabled={rescheduling}
                            className={[
                              "rounded-lg border px-3 py-2 font-body text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50",
                              rescheduleTime === s.slot_time
                                ? "border-primary bg-primary text-white"
                                : "border-border bg-white text-text-primary hover:bg-bg-light",
                            ].join(" ")}
                          >
                            {formatTime(s.slot_time)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {rescheduleError && (
                  <div className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                    <p className="font-body text-sm text-danger">{rescheduleError}</p>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setRescheduleBooking(null)}
                    disabled={rescheduling}
                    className="rounded-lg border border-border bg-white px-5 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReschedule}
                    disabled={rescheduling || !rescheduleDate || !rescheduleTime}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                  >
                    {rescheduling ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Rescheduling…
                      </>
                    ) : (
                      "Confirm Reschedule"
                    )}
                  </button>
                </div>
              </>
            )}
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
          aria-label="Booking details"
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
                className="rounded-lg p-1 text-text-secondary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Patient type badge */}
            <div className="mb-4">
              {selectedBooking.is_new_patient ? (
                <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 font-body text-xs font-semibold text-blue-700">New Patient</span>
              ) : (
                <span className="inline-block rounded-full border border-green-200 bg-green-50 px-3 py-0.5 font-body text-xs font-semibold text-green-700">
                  Returning Patient{selectedBooking.visit_count > 0 ? ` — ${selectedBooking.visit_count} visit${selectedBooking.visit_count !== 1 ? "s" : ""}` : ""}
                </span>
              )}
            </div>

            <dl className="space-y-3 font-body text-sm">
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Patient</dt><dd className="text-text-primary">{selectedBooking.patient_name}</dd></div>
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Phone</dt><dd className="text-text-primary">{selectedBooking.patient_phone}</dd></div>
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Email</dt><dd className="text-text-primary">{selectedBooking.patient_email || "—"}</dd></div>
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Problem</dt><dd className="text-text-primary whitespace-pre-wrap">{selectedBooking.problem}</dd></div>
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Date</dt><dd className="text-text-primary">{formatDate(selectedBooking.appointment_date_ad)}</dd></div>
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Time</dt><dd className="text-text-primary">{formatTime(selectedBooking.appointment_time)}</dd></div>
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Status</dt><dd><span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[selectedBooking.status] ?? "border-border bg-bg-light text-text-secondary"}`}>{selectedBooking.status}</span></dd></div>
              {selectedBooking.status === "cancelled" && selectedBooking.cancellation_reason && (
                <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Reason</dt><dd className="text-red-700">{selectedBooking.cancellation_reason}</dd></div>
              )}
              {selectedBooking.status === "cancelled" && selectedBooking.cancelled_at && (
                <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Cancelled</dt><dd className="text-text-primary">{new Date(selectedBooking.cancelled_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</dd></div>
              )}
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Created</dt><dd className="text-text-primary">{new Date(selectedBooking.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</dd></div>
            </dl>

            {/* Status-specific actions */}
            <div className="mt-6 border-t border-border pt-4">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">Actions</p>
              <div className="flex flex-wrap gap-2">
                {/* Pending: Confirm, Cancel, Reschedule */}
                {selectedBooking.status === "pending" && (
                  <>
                    <button
                      onClick={() => { updateStatus(selectedBooking.id, "confirmed"); setSelectedBooking(null); }}
                      disabled={updatingId !== null}
                      className="rounded-lg bg-green-50 border border-green-300 px-4 py-2 font-body text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => openCancel(selectedBooking)}
                      disabled={updatingId !== null}
                      className="rounded-lg bg-red-50 border border-red-300 px-4 py-2 font-body text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { setSelectedBooking(null); openReschedule(selectedBooking); }}
                      disabled={updatingId !== null}
                      className="rounded-lg bg-blue-50 border border-blue-300 px-4 py-2 font-body text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      Reschedule
                    </button>
                  </>
                )}

                {/* Confirmed: Start/Continue Checkup, Reschedule, Cancel */}
                {selectedBooking.status === "confirmed" && (
                  <>
                    <button
                      onClick={() => openCheckup(selectedBooking)}
                      className="rounded-lg bg-primary px-4 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {selectedBooking.has_visit ? "Continue Checkup" : "Start Checkup"}
                    </button>
                    <button
                      onClick={() => { setSelectedBooking(null); openReschedule(selectedBooking); }}
                      disabled={updatingId !== null}
                      className="rounded-lg bg-blue-50 border border-blue-300 px-4 py-2 font-body text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => openCancel(selectedBooking)}
                      disabled={updatingId !== null}
                      className="rounded-lg bg-red-50 border border-red-300 px-4 py-2 font-body text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {/* Completed: Edit Visit */}
                {selectedBooking.status === "completed" && selectedBooking.has_visit && (
                  <button
                    onClick={() => openCheckup(selectedBooking)}
                    className="rounded-lg bg-blue-50 border border-blue-300 px-4 py-2 font-body text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    View/Edit Visit
                  </button>
                )}

                {/* View Patient Record — for any booking with patient_id */}
                {selectedBooking.patient_id && (
                  <a
                    href={`/admin/patients?id=${selectedBooking.patient_id}`}
                    className="rounded-lg bg-primary/10 border border-primary/30 px-4 py-2 font-body text-sm font-semibold text-primary hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    View Patient Record
                  </a>
                )}

                {/* Cancelled: Restore, and Reschedule only after restore fails */}
                {selectedBooking.status === "cancelled" && (
                  <>
                    <button
                      onClick={() => { updateStatus(selectedBooking.id, "pending"); setSelectedBooking(null); }}
                      disabled={updatingId !== null}
                      className="rounded-lg bg-amber-50 border border-amber-300 px-4 py-2 font-body text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                      Restore
                    </button>
                    {restoreFailedIds.has(selectedBooking.id) && (
                      <button
                        onClick={() => { setSelectedBooking(null); openReschedule(selectedBooking); }}
                        disabled={updatingId !== null}
                        className="rounded-lg bg-blue-50 border border-blue-300 px-4 py-2 font-body text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        Reschedule
                      </button>
                    )}
                  </>
                )}

                {/* Link to Patient — for unlinked bookings */}
                {!selectedBooking.patient_id && (
                  <a
                    href={`/admin/patients`}
                    className="rounded-lg bg-amber-50 border border-amber-300 px-4 py-2 font-body text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    Link to Patient
                  </a>
                )}

                <button
                  onClick={() => setSelectedBooking(null)}
                  className="rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Checkup Modal ===== */}
      {checkupBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !savingCheckup && !checkupSuccess && setCheckupBooking(null)}
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
                {checkupBooking.has_visit ? (checkupBooking.status === "completed" ? "Edit Visit" : "Continue Checkup") : "Patient Checkup"}
              </h2>
              <button
                onClick={() => setCheckupBooking(null)}
                disabled={savingCheckup}
                aria-label="Close checkup"
                className="rounded-lg p-1 text-text-secondary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
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
                <button
                  onClick={() => setCheckupBooking(null)}
                  className="mt-5 rounded-lg border border-border bg-white px-5 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* Booking context */}
                <div className="font-body text-sm space-y-1 mb-5 rounded-lg bg-bg-light p-3 border border-border">
                  <p><span className="font-semibold text-text-secondary">Patient:</span> <span className="text-text-primary">{checkupBooking.patient_name}</span></p>
                  <p><span className="font-semibold text-text-secondary">Appointment:</span> <span className="text-text-primary">{formatDate(checkupBooking.appointment_date_ad)} at {formatTime(checkupBooking.appointment_time)}</span></p>
                </div>

                {/* Checkup form */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="checkup-date" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                      Visit Date <span className="text-danger">*</span>
                    </label>
                    <input
                      id="checkup-date"
                      type="date"
                      value={checkupDate}
                      onChange={(e) => setCheckupDate(e.target.value)}
                      disabled={savingCheckup}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkup-complaint" className="block font-body text-sm font-semibold text-text-secondary mb-1">Problem / Reason</label>
                    <input
                      id="checkup-complaint"
                      type="text"
                      value={checkupComplaint}
                      onChange={(e) => setCheckupComplaint(e.target.value)}
                      disabled={savingCheckup}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkup-notes" className="block font-body text-sm font-semibold text-text-secondary mb-1">Doctor Notes</label>
                    <textarea
                      id="checkup-notes"
                      rows={3}
                      value={checkupNotes}
                      onChange={(e) => setCheckupNotes(e.target.value)}
                      disabled={savingCheckup}
                      placeholder="Examination findings, diagnosis..."
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkup-medicines" className="block font-body text-sm font-semibold text-text-secondary mb-1">Prescribed Medicines</label>
                    <textarea
                      id="checkup-medicines"
                      rows={2}
                      value={checkupMedicines}
                      onChange={(e) => setCheckupMedicines(e.target.value)}
                      disabled={savingCheckup}
                      placeholder="Medicine name, dosage, duration..."
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkup-followup" className="block font-body text-sm font-semibold text-text-secondary mb-1">Follow-up Instructions</label>
                    <textarea
                      id="checkup-followup"
                      rows={2}
                      value={checkupFollowUp}
                      onChange={(e) => setCheckupFollowUp(e.target.value)}
                      disabled={savingCheckup}
                      placeholder="Return in 2 weeks, blood test..."
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkup-condition" className="block font-body text-sm font-semibold text-text-secondary mb-1">Condition / Status</label>
                    <input
                      id="checkup-condition"
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
                  <div className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                    <p className="font-body text-sm text-danger">{checkupError}</p>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    onClick={() => submitCheckup(false)}
                    disabled={savingCheckup || !checkupDate}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary bg-white px-4 py-2 font-body text-sm font-semibold text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                      className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-body text-sm font-semibold text-white hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {savingCheckup ? "Saving..." : "Save Visit & Complete"}
                    </button>
                  )}
                  <button
                    onClick={() => setCheckupBooking(null)}
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

      {/* ===== Cancel Reason Modal ===== */}
      {cancelBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !cancelling && setCancelBooking(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Cancel booking"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-red-300 bg-white p-6 shadow-xl"
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
                    disabled={cancelling}
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
                  disabled={cancelling}
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
                  <label htmlFor="cancel-custom" className="sr-only">Custom cancellation reason</label>
                  <textarea
                    id="cancel-custom"
                    rows={2}
                    value={cancelCustomReason}
                    onChange={(e) => setCancelCustomReason(e.target.value)}
                    disabled={cancelling}
                    placeholder="Enter reason…"
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y disabled:opacity-50"
                  />
                </div>
              )}
            </div>

            {cancelError && (
              <div className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                <p className="font-body text-sm text-danger">{cancelError}</p>
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <button
                onClick={submitCancel}
                disabled={cancelling}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-body text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {cancelling ? (
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
                disabled={cancelling}
                className="rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
