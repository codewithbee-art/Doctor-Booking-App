"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatBS } from "@/lib/dateConvert";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SpecialistInfo {
  id: string;
  specialist_name: string;
  specialization: string;
  treatment_type: string;
  visit_date_bs: string;
  visit_date_ad: string;
  available_from: string;
  available_to: string;
  consultation_fee: number | null;
  visit_location: string | null;
  consultation_mode: string | null;
  preparation_note: string | null;
  profile_image_url: string | null;
  slot_duration_minutes: number;
  max_patients: number | null;
}

interface SlotInfo {
  time: string;
  available: boolean;
}

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
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function modeLabel(m: string | null) {
  if (m === "in_person") return "In-person";
  if (m === "online") return "Online";
  if (m === "both") return "In-person & Online";
  return null;
}

function getInitials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SpecialistBookPage() {
  const params = useParams();
  const id = params?.id as string;

  const [specialist, setSpecialist] = useState<SpecialistInfo | null>(null);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [maxReached, setMaxReached] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [problem, setProblem] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/specialists/${id}/slots`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load specialist");
        setSpecialist(json.specialist);
        setSlots(json.slots ?? []);
        setMaxReached(json.max_reached ?? false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormErrors([]);

    if (!selectedTime) {
      setFormError("Please select a time slot.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/specialists/${id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: name,
          patient_phone: phone,
          patient_email: email || undefined,
          problem,
          appointment_time: selectedTime,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.details && Array.isArray(json.details)) {
          setFormErrors(json.details);
        } else {
          setFormError(json.error || "Booking failed.");
        }
        return;
      }
      setSuccess(`Booking confirmed with ${json.specialist_name}! Your appointment is on ${formatDate(specialist!.visit_date_ad)} at ${formatTime(selectedTime)}.`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---- Loading ---- */
  if (loading) {
    return (
      <main className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-3 font-body text-sm text-text-secondary">Loading booking...</p>
        </div>
      </main>
    );
  }

  /* ---- Error / Not found ---- */
  if (error || !specialist) {
    return (
      <main className="min-h-screen bg-bg-light">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger/10">
            <svg className="h-7 w-7 text-danger" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-text-primary mb-2">Cannot Book Specialist</h1>
          <p className="font-body text-base text-text-secondary mb-6">{error || "This specialist is not available for booking."}</p>
          <Link href="/specialists" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
            Back to Specialists
          </Link>
        </div>
      </main>
    );
  }

  /* ---- Success ---- */
  if (success) {
    return (
      <main className="min-h-screen bg-bg-light">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-text-primary mb-2">Booking Successful!</h1>
          <p className="font-body text-base text-text-secondary mb-6">{success}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={`/specialists/${id}`} className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 font-body text-sm font-semibold text-text-primary hover:bg-bg-light transition-colors">
              View Specialist
            </Link>
            <Link href="/specialists" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
              All Specialists
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const s = specialist;
  const bsDisplay = s.visit_date_bs || formatBS(s.visit_date_ad);
  const mode = modeLabel(s.consultation_mode);
  const availableSlots = slots.filter((sl) => sl.available);

  return (
    <main className="min-h-screen bg-bg-light">
      {/* Header */}
      <div className="bg-primary px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Link href={`/specialists/${id}`} className="inline-flex items-center gap-2 font-body text-sm font-semibold text-white/80 hover:text-white transition-colors mb-4">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Back to Profile
          </Link>
          <div className="flex items-center gap-4">
            {s.profile_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.profile_image_url} alt={s.specialist_name} className="h-16 w-16 rounded-full object-cover border-2 border-white/30 flex-shrink-0" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white font-heading text-xl font-bold flex-shrink-0 border-2 border-white/20" aria-hidden="true">
                {getInitials(s.specialist_name)}
              </div>
            )}
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-bold text-white">Book {s.specialist_name}</h1>
              <p className="font-body text-sm text-light-blue font-semibold">{s.specialization}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 md:py-8 space-y-6">
        {/* Specialist info card */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-heading text-base font-bold text-text-primary mb-3">Visit Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-body text-sm">
            <div>
              <span className="text-text-secondary">Treatment:</span>
              <span className="ml-1 font-medium text-text-primary">{s.treatment_type}</span>
            </div>
            <div>
              <span className="text-text-secondary">Date:</span>
              <span className="ml-1 font-medium text-text-primary">{bsDisplay} ({formatDate(s.visit_date_ad)})</span>
            </div>
            <div>
              <span className="text-text-secondary">Time Window:</span>
              <span className="ml-1 font-medium text-text-primary">{formatTime(s.available_from)} – {formatTime(s.available_to)}</span>
            </div>
            <div>
              <span className="text-text-secondary">Fee:</span>
              <span className="ml-1 font-semibold text-text-primary">{s.consultation_fee != null ? `NPR ${s.consultation_fee}` : "Free Consultation"}</span>
            </div>
            {s.visit_location && (
              <div>
                <span className="text-text-secondary">Location:</span>
                <span className="ml-1 font-medium text-text-primary">{s.visit_location}</span>
              </div>
            )}
            {mode && (
              <div>
                <span className="text-text-secondary">Mode:</span>
                <span className="ml-1 font-medium text-text-primary">{mode}</span>
              </div>
            )}
          </div>
          {s.preparation_note && (
            <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200/60 px-4 py-3">
              <p className="font-body text-xs font-semibold text-amber-800 mb-1">Preparation</p>
              <p className="font-body text-sm text-amber-900">{s.preparation_note}</p>
            </div>
          )}
        </div>

        {/* Time slot selection */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-heading text-base font-bold text-text-primary mb-1">Select Time Slot</h2>
          <p className="font-body text-xs text-text-secondary mb-4">
            Each slot is {s.slot_duration_minutes} minutes.
            {maxReached && " All slots are full for this visit."}
          </p>

          {slots.length === 0 ? (
            <p className="font-body text-sm text-text-secondary">No time slots available.</p>
          ) : availableSlots.length === 0 ? (
            <p className="font-body text-sm text-danger">All time slots are booked. This specialist has no available slots.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2" role="radiogroup" aria-label="Available time slots">
              {slots.map((sl) => (
                <button
                  key={sl.time}
                  type="button"
                  disabled={!sl.available}
                  onClick={() => setSelectedTime(sl.time)}
                  aria-pressed={selectedTime === sl.time}
                  className={`rounded-lg px-3 py-2.5 font-body text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    selectedTime === sl.time
                      ? "bg-primary text-white ring-2 ring-primary ring-offset-1"
                      : sl.available
                      ? "border border-border text-text-primary hover:border-primary/40 hover:bg-primary/5"
                      : "border border-border/40 text-text-secondary/50 bg-bg-light cursor-not-allowed line-through"
                  }`}
                >
                  {formatTime(sl.time)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Patient form */}
        {availableSlots.length > 0 && (
          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-4">
            <h2 className="font-heading text-base font-bold text-text-primary">Your Details</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="bk-name" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  id="bk-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label htmlFor="bk-phone" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                  Phone <span className="text-danger">*</span>
                </label>
                <input
                  id="bk-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="98XXXXXXXX"
                  required
                />
              </div>
              <div>
                <label htmlFor="bk-email" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                  Email (optional)
                </label>
                <input
                  id="bk-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="your@email.com"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="bk-problem" className="block font-body text-sm font-semibold text-text-secondary mb-1">
                  Reason for Visit <span className="text-danger">*</span>
                </label>
                <textarea
                  id="bk-problem"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]"
                  rows={2}
                  placeholder="Briefly describe your condition or reason"
                  required
                />
              </div>
            </div>

            {/* Errors */}
            {formError && (
              <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                <p className="font-body text-sm text-danger">{formError}</p>
              </div>
            )}
            {formErrors.length > 0 && (
              <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                <ul className="list-disc pl-4 space-y-1">
                  {formErrors.map((err, i) => (
                    <li key={i} className="font-body text-sm text-danger">{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={submitting || !selectedTime}
                className="rounded-lg bg-accent px-6 py-2.5 font-body text-sm font-semibold text-white hover:bg-accent-hover transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {submitting ? "Booking..." : "Confirm Booking"}
              </button>
              {selectedTime && (
                <p className="font-body text-sm text-text-secondary">
                  Selected: <span className="font-semibold text-text-primary">{formatTime(selectedTime)}</span>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
