"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LogoutButton from "../dashboard/LogoutButton";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Slot {
  id: string;
  slot_date_ad: string;
  slot_date_bs: string;
  slot_time: string;
  is_booked: boolean;
  is_blocked: boolean;
  blocked_reason: string | null;
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
  const [userEmail, setUserEmail] = useState<string | null>(null);
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
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors"
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
                return (
                  <div
                    key={slot.id}
                    className={[
                      "rounded-xl border p-3 transition-colors",
                      slot.is_blocked
                        ? "border-red-300 bg-red-50"
                        : slot.is_booked
                        ? "border-amber-300 bg-amber-50"
                        : "border-border bg-white",
                    ].join(" ")}
                  >
                    <p className={`font-body text-sm font-bold ${slot.is_blocked ? "text-red-700" : slot.is_booked ? "text-amber-700" : "text-text-primary"}`}>
                      {formatTime(slot.slot_time)}
                    </p>
                    <p className={`font-body text-xs mt-0.5 ${slot.is_blocked ? "text-red-600" : slot.is_booked ? "text-amber-600" : "text-text-secondary"}`}>
                      {slot.is_blocked
                        ? slot.blocked_reason || "Blocked"
                        : slot.is_booked
                        ? "Booked"
                        : "Available"}
                    </p>
                    <button
                      onClick={() => toggleSlot(slot)}
                      disabled={isUpdating || updatingId !== null}
                      aria-label={slot.is_blocked ? `Unblock ${formatTime(slot.slot_time)}` : `Block ${formatTime(slot.slot_time)}`}
                      className={[
                        "mt-2 w-full rounded-md px-2 py-1 font-body text-xs font-semibold transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2",
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
    </main>
  );
}
