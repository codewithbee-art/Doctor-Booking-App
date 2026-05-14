"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatBS } from "@/lib/dateConvert";

interface Specialist {
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
  profile_image_url: string | null;
}

function modeLabel(m: string | null) {
  if (m === "in_person") return "In-person";
  if (m === "online") return "Online";
  if (m === "both") return "In-person & Online";
  return null;
}

function getInitials(name: string) {
  return name.split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

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
    month: "short",
    year: "numeric",
  });
}

export default function SpecialistsPage() {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/specialists", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load");
        setSpecialists(json.specialists ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Separate upcoming and past
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = specialists.filter((s) => s.visit_date_ad >= today);
  const past = specialists.filter((s) => s.visit_date_ad < today);

  return (
    <main className="min-h-screen bg-bg-light">
      {/* Header */}
      <div className="bg-primary px-4 py-12 md:py-16 text-center">
        <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
          Visiting Specialists
        </h1>
        <p className="mt-3 font-body text-lg text-light-blue/90 max-w-xl mx-auto">
          Expert doctors visit our clinic regularly. Check upcoming specialist availability below.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-body text-sm font-semibold text-primary hover:text-secondary transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Home
          </Link>
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-3 font-body text-sm text-text-secondary">Loading specialists...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-danger/40 bg-danger/10 px-5 py-4 text-center">
            <p className="font-body text-sm text-danger">{error}</p>
          </div>
        )}

        {!loading && !error && specialists.length === 0 && (
          <div className="rounded-2xl border border-border bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-light-blue">
              <svg className="h-7 w-7 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h2 className="font-heading text-xl font-bold text-text-primary">No Specialists Scheduled</h2>
            <p className="mt-2 font-body text-base text-text-secondary">
              Check back soon for upcoming visiting specialist schedules.
            </p>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section className="mb-10">
            <h2 className="font-heading text-xl font-bold text-text-primary mb-4">Upcoming Visits</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {upcoming.map((s) => (
                <SpecialistCard key={s.id} specialist={s} />
              ))}
            </div>
          </section>
        )}

        {/* Past */}
        {past.length > 0 && (
          <section>
            <h2 className="font-heading text-lg font-bold text-text-secondary mb-4">Past Visits</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 opacity-70">
              {past.map((s) => (
                <SpecialistCard key={s.id} specialist={s} isPast />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function SpecialistCard({ specialist: s, isPast }: { specialist: Specialist; isPast?: boolean }) {
  const bsDisplay = s.visit_date_bs || formatBS(s.visit_date_ad);
  const mode = modeLabel(s.consultation_mode);

  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm ${isPast ? "border-border" : "border-primary/20 hover:border-primary/40"} transition-colors`}>
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        {s.profile_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.profile_image_url} alt={s.specialist_name} className="h-12 w-12 rounded-full object-cover border border-border flex-shrink-0" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-heading text-sm font-bold flex-shrink-0" aria-hidden="true">{getInitials(s.specialist_name)}</div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-base font-bold text-text-primary truncate">{s.specialist_name}</h3>
          <p className="font-body text-sm text-primary font-semibold">{s.specialization}</p>
        </div>
        {!isPast && (
          <span className="flex-shrink-0 rounded-full bg-accent/10 px-2.5 py-0.5 font-body text-xs font-semibold text-accent">Upcoming</span>
        )}
      </div>

      <div className="space-y-1.5 font-body text-sm">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
          <span className="text-text-secondary">Treatment:</span>
          <span className="text-text-primary font-medium">{s.treatment_type}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
          <span className="text-text-primary font-medium">{bsDisplay}</span>
          <span className="text-text-secondary text-xs">({formatDate(s.visit_date_ad)})</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-text-primary">{formatTime(s.available_from)} – {formatTime(s.available_to)}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
          <span className="text-text-primary font-semibold">{s.consultation_fee != null ? `NPR ${s.consultation_fee}` : "Free Consultation"}</span>
        </div>
        {s.visit_location && (
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
            <span className="text-text-primary">{s.visit_location}</span>
          </div>
        )}
        {mode && (
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>
            <span className="text-text-primary">{mode}</span>
          </div>
        )}
      </div>

      {/* View Profile */}
      <div className="mt-4 pt-3 border-t border-border/60">
        <Link href={`/specialists/${s.id}`} className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
          View Profile
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </Link>
      </div>
    </div>
  );
}
