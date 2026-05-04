"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  created_at: string;
  updated_at: string;
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
  created_at: string;
}

interface PatientVisit {
  id: string;
  visit_date_ad: string;
  visit_date_bs: string;
  chief_complaint: string | null;
  visit_notes: string | null;
  prescribed_medicines: string | null;
  follow_up_instructions: string | null;
  condition_summary: string | null;
  created_at: string;
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

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminPatientsPage() {
  const router = useRouter();
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
                  <h2 className="font-heading text-lg font-bold text-text-primary mb-4">Patient Profile</h2>
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
                    <div className="sm:col-span-2">
                      <dt className="font-semibold text-text-secondary">Notes</dt>
                      <dd className="text-text-primary mt-0.5 whitespace-pre-wrap">{selectedPatient.notes || "—"}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-text-secondary">Registered</dt>
                      <dd className="text-text-primary mt-0.5">{formatDateTime(selectedPatient.created_at)}</dd>
                    </div>
                  </dl>
                </div>

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
                  <h2 className="font-heading text-lg font-bold text-text-primary mb-4">Visit History</h2>
                  {patientVisits.length === 0 ? (
                    <p className="font-body text-sm text-text-secondary">No visit records yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {patientVisits.map((v) => (
                        <div key={v.id} className="rounded-xl border border-border p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-body text-sm font-semibold text-text-primary">
                              {formatDate(v.visit_date_ad)}
                            </span>
                          </div>
                          <dl className="space-y-2 font-body text-sm">
                            {v.chief_complaint && (
                              <div>
                                <dt className="font-semibold text-text-secondary">Chief Complaint</dt>
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
