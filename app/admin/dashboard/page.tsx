"use client";

import { useEffect, useState, useMemo } from "react";
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

type FilterTab = "all" | "today" | "pending" | "confirmed" | "cancelled";

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
      if (q && !b.patient_name.toLowerCase().includes(q) && !b.patient_phone.includes(q)) return false;
      return true;
    });
  }, [bookings, filter, search]);

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
          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="font-body text-sm text-text-secondary hidden sm:inline">{userEmail}</span>
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
                <table className="w-full min-w-[700px] text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">#</th>
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">Patient</th>
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">Phone</th>
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">Problem</th>
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">Date</th>
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">Time</th>
                      <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">Status</th>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

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
    </main>
  );
}
