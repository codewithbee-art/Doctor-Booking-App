"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStaffProfile } from "@/lib/useStaffProfile";
import AdminAccessDenied from "@/components/AdminAccessDenied";
import AdminInactive from "@/components/AdminInactive";
import LogoutButton from "../dashboard/LogoutButton";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BookingSummary {
  id: string;
  patient_name: string;
  patient_phone: string;
  status: string;
  appointment_time: string;
}

interface Slot {
  id: string;
  slot_date_ad: string;
  slot_date_bs: string;
  slot_time: string;
  is_booked: boolean;
  is_blocked: boolean;
  blocked_reason: string | null;
  booking_summary: BookingSummary | null;
}

interface FreeSlot {
  id: string;
  slot_time: string;
  is_booked: boolean;
}

const BLOCK_REASONS = [
  "Doctor unavailable",
  "Emergency",
  "Holiday",
  "Lunch break",
  "Training",
  "Other",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function todayAD() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDisplayDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminAvailabilityPage() {
  const router = useRouter();
  const { loading: staffLoading, userEmail, profile: staffProfile, noSession, inactive, hasRole } = useStaffProfile();
  const [checking, setChecking] = useState(true);

  const [selectedDate, setSelectedDate] = useState(todayAD());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [blockingDay, setBlockingDay] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [blockReason, setBlockReason] = useState(BLOCK_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [dayReason, setDayReason] = useState(BLOCK_REASONS[0]);
  const [dayCustomReason, setDayCustomReason] = useState("");

  const [viewingSlot, setViewingSlot] = useState<Slot | null>(null);

  const [reschedPatientSlot, setReschedPatientSlot] = useState<Slot | null>(null);
  const [reschedDate, setReschedDate] = useState("");
  const [reschedTime, setReschedTime] = useState("");
  const [reschedFreeSlots, setReschedFreeSlots] = useState<FreeSlot[]>([]);
  const [loadingFreeSlots, setLoadingFreeSlots] = useState(false);
  const [reschedulingPatient, setReschedulingPatient] = useState(false);
  const [reschedError, setReschedError] = useState<string | null>(null);
  const [reschedSuccess, setReschedSuccess] = useState(false);

  /* ---- Auth + Role ---- */
  useEffect(() => {
    if (staffLoading) return;
    if (noSession) { router.replace("/admin/login"); return; }
    setChecking(false);
  }, [staffLoading, noSession, router]);

  /* ---- Fetch slots for selected date ---- */
  const fetchSlots = useCallback(async (date: string) => {
    setLoadingSlots(true);
    setSlotsError(null);
    try {
      const res = await fetch(`/api/admin/slots?date=${encodeURIComponent(date)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load slots");
      setSlots(json.slots ?? []);
    } catch (err) {
      setSlotsError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (!checking) fetchSlots(selectedDate);
  }, [checking, selectedDate, fetchSlots]);

  /* ---- Block / unblock single slot ---- */
  const toggleSlot = useCallback(async (slot: Slot) => {
    setUpdatingId(slot.id);
    setActionError(null);

    const newBlocked = !slot.is_blocked;
    const reason = newBlocked
      ? (blockReason === "Other" ? customReason.trim() : blockReason)
      : null;

    // Optimistic update
    setSlots((cur) =>
      cur.map((s) =>
        s.id === slot.id ? { ...s, is_blocked: newBlocked, blocked_reason: reason } : s
      )
    );

    try {
      const res = await fetch("/api/admin/slots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slot.id, is_blocked: newBlocked, blocked_reason: reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update slot");
    } catch (err) {
      // Revert
      setSlots((cur) =>
        cur.map((s) =>
          s.id === slot.id ? { ...s, is_blocked: slot.is_blocked, blocked_reason: slot.blocked_reason } : s
        )
      );
      setActionError(err instanceof Error ? err.message : "Failed to update slot");
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setUpdatingId(null);
    }
  }, [blockReason, customReason]);

  /* ---- Block full day ---- */
  const blockFullDay = useCallback(async () => {
    setBlockingDay(true);
    setActionError(null);
    const reason = dayReason === "Other" ? dayCustomReason.trim() : dayReason;

    try {
      const res = await fetch("/api/admin/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, blocked_reason: reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to block day");
      // Refresh
      await fetchSlots(selectedDate);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to block day");
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setBlockingDay(false);
    }
  }, [selectedDate, dayReason, dayCustomReason, fetchSlots]);

  /* ---- Reschedule patient: fetch free slots when date changes ---- */
  useEffect(() => {
    if (!reschedDate) { setReschedFreeSlots([]); return; }
    let cancelled = false;
    async function load() {
      setLoadingFreeSlots(true);
      setReschedFreeSlots([]);
      setReschedTime("");
      try {
        const res = await fetch(`/api/slots?date=${encodeURIComponent(reschedDate)}`);
        const json = await res.json();
        if (!cancelled && res.ok) setReschedFreeSlots(json.slots ?? []);
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoadingFreeSlots(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [reschedDate]);

  /* ---- Open Reschedule Patient modal ---- */
  const openReschedPatient = useCallback((slot: Slot) => {
    setReschedPatientSlot(slot);
    setReschedDate("");
    setReschedTime("");
    setReschedFreeSlots([]);
    setReschedError(null);
    setReschedSuccess(false);
  }, []);

  /* ---- Submit Reschedule Patient ---- */
  const submitReschedPatient = useCallback(async () => {
    if (!reschedPatientSlot || !reschedDate || !reschedTime) return;
    if (!reschedPatientSlot.booking_summary) {
      setReschedError("Booking details not available. Cannot reschedule.");
      return;
    }
    const bookingId = reschedPatientSlot.booking_summary.id;
    const originalSlotId = reschedPatientSlot.id;
    const reason = blockReason === "Other" ? customReason.trim() : blockReason;

    setReschedulingPatient(true);
    setReschedError(null);

    try {
      // 1. Reschedule the booking
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_date_ad: reschedDate,
          appointment_time: reschedTime,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to reschedule booking");

      // 2. Block the original slot
      await fetch("/api/admin/slots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: originalSlotId, is_blocked: true, blocked_reason: reason }),
      });

      // 3. Refresh slots
      await fetchSlots(selectedDate);
      setReschedSuccess(true);
    } catch (err) {
      setReschedError(err instanceof Error ? err.message : "Reschedule failed");
    } finally {
      setReschedulingPatient(false);
    }
  }, [reschedPatientSlot, reschedDate, reschedTime, blockReason, customReason, selectedDate, fetchSlots]);

  /* ---- Auth gate ---- */
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

  /* ---- Role guard: owner, doctor, receptionist can access availability ---- */
  if (staffProfile && !hasRole("owner", "doctor", "receptionist")) {
    return <AdminAccessDenied message="Your role does not have access to availability management." />;
  }

  const blockedCount = slots.filter((s) => s.is_blocked).length;
  const availableCount = slots.filter((s) => !s.is_blocked && !s.is_booked).length;
  const bookedCount = slots.filter((s) => s.is_booked && !s.is_blocked).length;

  return (
    <main className="min-h-screen bg-bg-light">
      {/* ===== Header ===== */}
      <header className="bg-white border-b border-border px-4 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-text-primary">Availability Management</h1>
              <p className="font-body text-sm text-text-secondary hidden sm:block">Block and manage time slots</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/admin/dashboard"
              className="inline-flex items-center gap-1 sm:gap-2 rounded-lg border border-border bg-white px-2.5 sm:px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              <span className="hidden sm:inline">Dashboard</span>
            </a>
            {userEmail && (
              <span className="font-body text-sm text-text-secondary hidden md:inline">{userEmail}</span>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* ===== Date Picker + Stats ===== */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <label htmlFor="slot-date" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                Select Date
              </label>
              <input
                id="slot-date"
                type="date"
                value={selectedDate}
                min={todayAD()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-border bg-white px-4 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {selectedDate && (
                <p className="mt-1 font-body text-xs text-text-secondary">{formatDisplayDate(selectedDate)}</p>
              )}
            </div>
            {!loadingSlots && slots.length > 0 && (
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-body text-xs font-semibold text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  {availableCount} available
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-body text-xs font-semibold text-amber-700">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  {bookedCount} booked
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 font-body text-xs font-semibold text-red-700">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  {blockedCount} blocked
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ===== Block Full Day ===== */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-heading text-base font-bold text-text-primary mb-4">Block Entire Day</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="day-reason" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                Reason
              </label>
              <select
                id="day-reason"
                value={dayReason}
                onChange={(e) => setDayReason(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-4 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {BLOCK_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            {dayReason === "Other" && (
              <div className="flex-1">
                <label htmlFor="day-custom-reason" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                  Custom reason
                </label>
                <input
                  id="day-custom-reason"
                  type="text"
                  value={dayCustomReason}
                  onChange={(e) => setDayCustomReason(e.target.value)}
                  placeholder="Enter reason…"
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
            <button
              onClick={blockFullDay}
              disabled={blockingDay || loadingSlots || slots.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 font-body text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {blockingDay ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Blocking…
                </>
              ) : (
                "Block All Slots"
              )}
            </button>
          </div>
        </div>

        {/* ===== Per-slot Reason ===== */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-heading text-base font-bold text-text-primary mb-4">Block / Unblock Individual Slots</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end mb-5">
            <div className="flex-1">
              <label htmlFor="slot-reason" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                Reason for blocking
              </label>
              <select
                id="slot-reason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-4 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {BLOCK_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            {blockReason === "Other" && (
              <div className="flex-1">
                <label htmlFor="custom-reason" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                  Custom reason
                </label>
                <input
                  id="custom-reason"
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter reason…"
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>

          {/* Slots grid */}
          {loadingSlots && (
            <div className="flex items-center justify-center py-12">
              <svg className="h-7 w-7 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="ml-3 font-body text-sm text-text-secondary">Loading slots…</span>
            </div>
          )}

          {!loadingSlots && slotsError && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 p-5 text-center">
              <p className="font-body text-sm font-semibold text-danger">{slotsError}</p>
            </div>
          )}

          {!loadingSlots && !slotsError && slots.length === 0 && (
            <div className="py-12 text-center">
              <p className="font-body text-sm text-text-secondary">No slots found for this date. Add slots in Supabase first.</p>
            </div>
          )}

          {!loadingSlots && !slotsError && slots.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {slots.map((slot) => {
                const isUpdating = updatingId === slot.id;
                const isBookedActive = slot.is_booked && !slot.is_blocked;
                return (
                  <div
                    key={slot.id}
                    className={[
                      "rounded-xl border p-3 transition-colors flex flex-col gap-2",
                      slot.is_blocked
                        ? "border-red-300 bg-red-50"
                        : isBookedActive
                        ? "border-amber-300 bg-amber-50"
                        : "border-border bg-white",
                    ].join(" ")}
                  >
                    <div>
                      <p className={`font-body text-sm font-bold ${slot.is_blocked ? "text-red-700" : isBookedActive ? "text-amber-700" : "text-text-primary"}`}>
                        {formatTime(slot.slot_time)}
                      </p>
                      <p className={`font-body text-xs mt-0.5 ${slot.is_blocked ? "text-red-600" : isBookedActive ? "text-amber-600" : "text-text-secondary"}`}>
                        {slot.is_blocked
                          ? slot.blocked_reason || "Blocked"
                          : isBookedActive
                          ? "Booked"
                          : "Available"}
                      </p>
                      {isBookedActive && slot.booking_summary && (
                        <div className="mt-1.5 space-y-0.5">
                          <p className="font-body text-xs font-semibold text-amber-800 truncate">{slot.booking_summary.patient_name}</p>
                          <p className="font-body text-xs text-amber-700">{slot.booking_summary.patient_phone}</p>
                          <span className="inline-block rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 font-body text-xs font-semibold text-amber-800 capitalize">{slot.booking_summary.status}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {isBookedActive ? (
                      <div className="flex flex-col gap-1.5 mt-auto">
                        <button
                          onClick={() => setViewingSlot(slot)}
                          disabled={updatingId !== null}
                          className="w-full rounded-md border border-amber-400 bg-amber-100 px-2 py-1 font-body text-xs font-semibold text-amber-800 hover:bg-amber-200 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        >
                          View Booking
                        </button>
                        <button
                          onClick={() => openReschedPatient(slot)}
                          disabled={updatingId !== null}
                          className="w-full rounded-md border border-blue-300 bg-blue-50 px-2 py-1 font-body text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          Reschedule Patient
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleSlot(slot)}
                        disabled={isUpdating || updatingId !== null}
                        aria-label={slot.is_blocked ? `Unblock ${formatTime(slot.slot_time)}` : `Block ${formatTime(slot.slot_time)}`}
                        className={[
                          "mt-auto w-full rounded-md px-2 py-1 font-body text-xs font-semibold transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2",
                          slot.is_blocked
                            ? "border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 focus-visible:ring-green-500"
                            : "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:ring-red-500",
                        ].join(" ")}
                      >
                        {isUpdating ? (
                          <span className="flex items-center justify-center gap-1">
                            <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                          </span>
                        ) : slot.is_blocked ? "Unblock" : "Block"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== Action Error Toast ===== */}
        {actionError && (
          <div className="rounded-xl border border-danger/40 bg-danger/10 px-5 py-4 flex items-center gap-3">
            <svg className="h-5 w-5 flex-shrink-0 text-danger" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="font-body text-sm text-danger">{actionError}</p>
          </div>
        )}

        {/* ===== Legend ===== */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-body text-sm font-semibold text-text-secondary mb-3">Legend</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-border bg-white" />
              <span className="font-body text-sm text-text-secondary">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-amber-300 bg-amber-50" />
              <span className="font-body text-sm text-text-secondary">Booked by patient</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-red-300 bg-red-50" />
              <span className="font-body text-sm text-text-secondary">Blocked by admin</span>
            </div>
          </div>
        </div>
      </div>
      {/* ===== View Booking Modal ===== */}
      {viewingSlot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setViewingSlot(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Booking details"
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-text-primary">Booking Details</h2>
              <button
                onClick={() => setViewingSlot(null)}
                aria-label="Close"
                className="rounded-lg p-1 text-text-secondary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {viewingSlot.booking_summary ? (
              <dl className="space-y-3 font-body text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold text-text-secondary">Patient</dt>
                  <dd className="text-text-primary text-right">{viewingSlot.booking_summary.patient_name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold text-text-secondary">Phone</dt>
                  <dd className="text-text-primary text-right">{viewingSlot.booking_summary.patient_phone}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold text-text-secondary">Date</dt>
                  <dd className="text-text-primary text-right">{formatDisplayDate(viewingSlot.slot_date_ad)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold text-text-secondary">Time</dt>
                  <dd className="text-text-primary text-right">{formatTime(viewingSlot.slot_time)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold text-text-secondary">Status</dt>
                  <dd className="capitalize text-text-primary text-right">{viewingSlot.booking_summary.status}</dd>
                </div>
              </dl>
            ) : (
              <div className="py-4 text-center">
                <p className="font-body text-sm text-text-secondary">Booking details could not be loaded. The booking may have been cancelled.</p>
                <p className="font-body text-sm text-text-secondary mt-1">Date: {formatDisplayDate(viewingSlot.slot_date_ad)} at {formatTime(viewingSlot.slot_time)}</p>
              </div>
            )}
            <div className="mt-5 flex justify-end gap-3">
              {viewingSlot.booking_summary && (
                <button
                  onClick={() => { setViewingSlot(null); openReschedPatient(viewingSlot); }}
                  className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 font-body text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Reschedule Patient
                </button>
              )}
              <button
                onClick={() => setViewingSlot(null)}
                className="rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Reschedule Patient Modal ===== */}
      {reschedPatientSlot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !reschedulingPatient && setReschedPatientSlot(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Reschedule patient"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-text-primary">Reschedule Patient</h2>
              <button
                onClick={() => setReschedPatientSlot(null)}
                disabled={reschedulingPatient}
                aria-label="Close"
                className="rounded-lg p-1 text-text-secondary hover:bg-bg-light transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {reschedSuccess ? (
              <div className="py-6 text-center">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-3 font-body text-base font-semibold text-text-primary">Patient rescheduled successfully</p>
                <p className="mt-1 font-body text-sm text-text-secondary">The original slot has been blocked. Patient notification will be added when email notifications are implemented.</p>
                <button
                  onClick={() => setReschedPatientSlot(null)}
                  className="mt-5 rounded-lg border border-border bg-white px-5 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                {reschedPatientSlot.booking_summary && (
                  <div className="font-body text-sm space-y-1 mb-5">
                    <p><span className="font-semibold text-text-secondary">Patient:</span> <span className="text-text-primary">{reschedPatientSlot.booking_summary.patient_name}</span></p>
                    <p><span className="font-semibold text-text-secondary">Current slot:</span> <span className="text-text-primary">{formatDisplayDate(reschedPatientSlot.slot_date_ad)} at {formatTime(reschedPatientSlot.slot_time)}</span></p>
                    <p className="font-body text-xs text-text-secondary mt-1">After rescheduling, the current slot will be blocked with the reason selected below.</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="resched-block-reason" className="block font-body text-sm font-semibold text-text-secondary mb-1">Block reason for current slot</label>
                    <select
                      id="resched-block-reason"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      disabled={reschedulingPatient}
                      className="w-full rounded-lg border border-border bg-white px-4 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    >
                      {BLOCK_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {blockReason === "Other" && (
                      <input
                        type="text"
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Enter reason…"
                        disabled={reschedulingPatient}
                        className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      />
                    )}
                  </div>

                  <div>
                    <label htmlFor="resched-new-date" className="block font-body text-sm font-semibold text-text-secondary mb-1">New date</label>
                    <input
                      id="resched-new-date"
                      type="date"
                      value={reschedDate}
                      min={todayAD()}
                      onChange={(e) => setReschedDate(e.target.value)}
                      disabled={reschedulingPatient}
                      className="w-full rounded-lg border border-border bg-white px-4 py-2 font-body text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block font-body text-sm font-semibold text-text-secondary mb-1">New time</label>
                    {!reschedDate && <p className="font-body text-sm text-text-secondary">Select a date first.</p>}
                    {reschedDate && loadingFreeSlots && (
                      <div className="flex items-center gap-2 py-2">
                        <svg className="h-4 w-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span className="font-body text-sm text-text-secondary">Loading slots…</span>
                      </div>
                    )}
                    {reschedDate && !loadingFreeSlots && reschedFreeSlots.filter(s => !s.is_booked).length === 0 && (
                      <p className="font-body text-sm text-text-secondary">No available slots for this date.</p>
                    )}
                    {reschedDate && !loadingFreeSlots && reschedFreeSlots.filter(s => !s.is_booked).length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {reschedFreeSlots.filter(s => !s.is_booked).map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setReschedTime(s.slot_time)}
                            disabled={reschedulingPatient}
                            className={[
                              "rounded-lg border px-3 py-2 font-body text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50",
                              reschedTime === s.slot_time
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

                {reschedError && (
                  <div className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                    <p className="font-body text-sm text-danger">{reschedError}</p>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setReschedPatientSlot(null)}
                    disabled={reschedulingPatient}
                    className="rounded-lg border border-border bg-white px-5 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReschedPatient}
                    disabled={reschedulingPatient || !reschedDate || !reschedTime || (blockReason === "Other" && !customReason.trim())}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {reschedulingPatient ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Rescheduling…
                      </>
                    ) : "Confirm Reschedule"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
