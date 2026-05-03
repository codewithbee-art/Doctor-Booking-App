"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LogoutButton from "./LogoutButton";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Booking {
  id: string;
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
  created_at: string;
}

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
  const [userEmail, setUserEmail] = useState<string | null>(null);
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

  /* ---- Auth ---- */
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/admin/login"); return; }
      setUserEmail(session.user.email ?? null);
      setChecking(false);
    }
    checkSession();
  }, [router]);

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
              href="/admin/availability"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              Availability
            </a>
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
                <table className="w-full min-w-[850px] text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">#</th>
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">Patient</th>
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">Phone</th>
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">Problem</th>
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">Date</th>
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">Time</th>
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">Status</th>
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b, i) => (
                      <tr key={b.id} className="border-b border-border last:border-b-0 hover:bg-bg-light/60 transition-colors">
                        <td className="px-4 py-3 font-body text-sm text-text-secondary">{i + 1}</td>
                        <td className="px-4 py-3 font-body text-sm font-semibold text-text-primary">{b.patient_name}</td>
                        <td className="px-4 py-3 font-body text-sm text-text-primary">{b.patient_phone}</td>
                        <td className="px-4 py-3 font-body text-sm text-text-secondary max-w-[200px]">
                          <span className="block truncate" title={b.problem}>{b.problem}</span>
                        </td>
                        <td className="px-4 py-3 font-body text-sm text-text-primary whitespace-nowrap">{formatDate(b.appointment_date_ad)}</td>
                        <td className="px-4 py-3 font-body text-sm text-text-primary whitespace-nowrap">{formatTime(b.appointment_time)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full border px-3 py-0.5 font-body text-xs font-semibold capitalize ${STATUS_STYLES[b.status] ?? "border-border bg-bg-light text-text-secondary"}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="rounded-md bg-primary/10 border border-primary/30 px-2.5 py-1 font-body text-xs font-semibold text-primary hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              View
                            </button>
                            {b.status === "pending" && (
                              <>
                                <button
                                  onClick={() => updateStatus(b.id, "confirmed")}
                                  disabled={updatingId !== null}
                                  className="rounded-md bg-green-50 border border-green-300 px-2.5 py-1 font-body text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => openReschedule(b)}
                                  disabled={updatingId !== null}
                                  className="rounded-md bg-blue-50 border border-blue-300 px-2.5 py-1 font-body text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                >
                                  Reschedule
                                </button>
                                <button
                                  onClick={() => updateStatus(b.id, "cancelled")}
                                  disabled={updatingId !== null}
                                  className="rounded-md bg-red-50 border border-red-300 px-2.5 py-1 font-body text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {b.status === "confirmed" && (
                              <>
                                <button
                                  onClick={() => updateStatus(b.id, "completed")}
                                  disabled={updatingId !== null}
                                  className="rounded-md bg-slate-50 border border-slate-300 px-2.5 py-1 font-body text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => openReschedule(b)}
                                  disabled={updatingId !== null}
                                  className="rounded-md bg-blue-50 border border-blue-300 px-2.5 py-1 font-body text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                >
                                  Reschedule
                                </button>
                                <button
                                  onClick={() => updateStatus(b.id, "cancelled")}
                                  disabled={updatingId !== null}
                                  className="rounded-md bg-red-50 border border-red-300 px-2.5 py-1 font-body text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {b.status === "cancelled" && (
                              <>
                                <button
                                  onClick={() => updateStatus(b.id, "pending")}
                                  disabled={updatingId !== null}
                                  className="rounded-md bg-amber-50 border border-amber-300 px-2.5 py-1 font-body text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                >
                                  Restore
                                </button>
                                {restoreFailedIds.has(b.id) && (
                                  <button
                                    onClick={() => openReschedule(b)}
                                    disabled={updatingId !== null}
                                    className="rounded-md bg-blue-50 border border-blue-300 px-2.5 py-1 font-body text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                  >
                                    Reschedule
                                  </button>
                                )}
                              </>
                            )}
                          </div>
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
            className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-xl"
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
            <dl className="space-y-3 font-body text-sm">
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Patient</dt><dd className="text-text-primary">{selectedBooking.patient_name}</dd></div>
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Phone</dt><dd className="text-text-primary">{selectedBooking.patient_phone}</dd></div>
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Email</dt><dd className="text-text-primary">{selectedBooking.patient_email || "—"}</dd></div>
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Problem</dt><dd className="text-text-primary whitespace-pre-wrap">{selectedBooking.problem}</dd></div>
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Date</dt><dd className="text-text-primary">{formatDate(selectedBooking.appointment_date_ad)}</dd></div>
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Time</dt><dd className="text-text-primary">{formatTime(selectedBooking.appointment_time)}</dd></div>
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Status</dt><dd><span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[selectedBooking.status] ?? "border-border bg-bg-light text-text-secondary"}`}>{selectedBooking.status}</span></dd></div>
              <div className="flex gap-3"><dt className="w-28 flex-shrink-0 font-semibold text-text-secondary">Created</dt><dd className="text-text-primary">{new Date(selectedBooking.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</dd></div>
            </dl>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg border border-border bg-white px-5 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
