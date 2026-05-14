"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { formatBS } from "@/lib/dateConvert";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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
  is_active: boolean;
  bio: string | null;
  qualifications: string | null;
  experience: string | null;
  work_history: string | null;
  treatment_areas: string | null;
  profile_image_url: string | null;
  visit_location: string | null;
  public_note: string | null;
  preparation_note: string | null;
  languages: string | null;
  gender: string | null;
  license_number: string | null;
  consultation_mode: string | null;
  display_order: number;
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
    weekday: "long",
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

function genderLabel(g: string | null) {
  if (g === "male") return "Male";
  if (g === "female") return "Female";
  if (g === "other") return "Other";
  return null;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Markdown section helper                                            */
/* ------------------------------------------------------------------ */

const MD_COMPONENTS = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="font-heading text-lg font-bold text-text-primary mt-4 mb-2" {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h4 className="font-heading text-base font-bold text-text-primary mt-3 mb-1.5" {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h5 className="font-body text-sm font-bold text-text-primary mt-2 mb-1" {...props} />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="font-body text-sm text-text-primary leading-relaxed mb-2" {...props} />,
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc pl-5 space-y-1 font-body text-sm text-text-primary mb-2" {...props} />,
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal pl-5 space-y-1 font-body text-sm text-text-primary mb-2" {...props} />,
  li: (props: React.HTMLAttributes<HTMLLIElement>) => <li className="leading-relaxed" {...props} />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong className="font-semibold" {...props} />,
  em: (props: React.HTMLAttributes<HTMLElement>) => <em className="italic" {...props} />,
};

function MarkdownSection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="font-heading text-base font-bold text-text-primary mb-2">{title}</h3>
      <div className="prose-sm">
        <ReactMarkdown components={MD_COMPONENTS}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Info row helper                                                    */
/* ------------------------------------------------------------------ */

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5 text-text-secondary">{icon}</div>
      <div>
        <p className="font-body text-xs text-text-secondary">{label}</p>
        <p className="font-body text-sm font-medium text-text-primary">{value}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function SpecialistDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/specialists/${id}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Specialist not found");
        setSpecialist(json.specialist);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  /* Loading */
  if (loading) {
    return (
      <main className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-3 font-body text-sm text-text-secondary">Loading specialist...</p>
        </div>
      </main>
    );
  }

  /* Error / Not found */
  if (error || !specialist) {
    return (
      <main className="min-h-screen bg-bg-light">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger/10">
            <svg className="h-7 w-7 text-danger" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-text-primary mb-2">Specialist Not Found</h1>
          <p className="font-body text-base text-text-secondary mb-6">{error || "This specialist may no longer be available."}</p>
          <Link href="/specialists" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Back to Specialists
          </Link>
        </div>
      </main>
    );
  }

  const s = specialist;
  const bsDisplay = s.visit_date_bs || formatBS(s.visit_date_ad);
  const mode = modeLabel(s.consultation_mode);
  const gender = genderLabel(s.gender);
  const isPast = s.visit_date_ad < new Date().toISOString().slice(0, 10);

  const calIcon = <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>;
  const clockIcon = <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  const feeIcon = <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>;
  const locIcon = <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
  const modeIcon = <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>;

  return (
    <main className="min-h-screen bg-bg-light">
      {/* Header */}
      <div className="bg-primary px-4 py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <Link href="/specialists" className="inline-flex items-center gap-2 font-body text-sm font-semibold text-white/80 hover:text-white transition-colors mb-4">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            All Specialists
          </Link>
          <div className="flex items-center gap-4 md:gap-6">
            {s.profile_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.profile_image_url} alt={s.specialist_name} className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover border-2 border-white/30 flex-shrink-0" />
            ) : (
              <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-white/15 text-white font-heading text-2xl md:text-3xl font-bold flex-shrink-0 border-2 border-white/20" aria-hidden="true">
                {getInitials(s.specialist_name)}
              </div>
            )}
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">{s.specialist_name}</h1>
              <p className="font-body text-lg text-light-blue font-semibold">{s.specialization}</p>
              <p className="font-body text-sm text-white/80 mt-1">{s.treatment_type}</p>
              {isPast && <span className="inline-block mt-2 rounded-full bg-amber-400/20 px-3 py-0.5 font-body text-xs font-semibold text-amber-200">Past Visit</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        {/* Visit info grid */}
        <div className="rounded-xl border border-border bg-white p-5 md:p-6 shadow-sm mb-8">
          <h2 className="font-heading text-lg font-bold text-text-primary mb-4">Visit Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow icon={calIcon} label="Visit Date" value={`${bsDisplay} (${formatDate(s.visit_date_ad)})`} />
            <InfoRow icon={clockIcon} label="Available Time" value={`${formatTime(s.available_from)} – ${formatTime(s.available_to)}`} />
            <InfoRow icon={feeIcon} label="Consultation Fee" value={s.consultation_fee != null ? `NPR ${s.consultation_fee}` : "Free Consultation"} />
            {s.visit_location && <InfoRow icon={locIcon} label="Location" value={s.visit_location} />}
            {mode && <InfoRow icon={modeIcon} label="Consultation Mode" value={mode} />}
            {s.languages && (
              <InfoRow
                icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" /></svg>}
                label="Languages"
                value={s.languages}
              />
            )}
            {gender && (
              <InfoRow
                icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>}
                label="Gender"
                value={gender}
              />
            )}
            {s.license_number && (
              <InfoRow
                icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></svg>}
                label="License / Registration"
                value={s.license_number}
              />
            )}
          </div>
        </div>

        {/* Profile sections */}
        {(s.bio || s.qualifications || s.experience || s.work_history || s.treatment_areas) && (
          <div className="rounded-xl border border-border bg-white p-5 md:p-6 shadow-sm mb-8 space-y-6">
            <h2 className="font-heading text-lg font-bold text-text-primary">About the Specialist</h2>
            {s.bio && <MarkdownSection title="Biography" content={s.bio} />}
            {s.qualifications && <MarkdownSection title="Qualifications" content={s.qualifications} />}
            {s.experience && <MarkdownSection title="Experience" content={s.experience} />}
            {s.work_history && <MarkdownSection title="Work History" content={s.work_history} />}
            {s.treatment_areas && <MarkdownSection title="Treatment Areas" content={s.treatment_areas} />}
          </div>
        )}

        {/* Public note */}
        {s.public_note && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 md:p-6 shadow-sm mb-8">
            <h2 className="font-heading text-base font-bold text-primary mb-2">Note</h2>
            <div className="prose-sm">
              <ReactMarkdown components={MD_COMPONENTS}>{s.public_note}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Preparation note */}
        {s.preparation_note && (
          <div className="rounded-xl border border-amber-300/40 bg-amber-50 p-5 md:p-6 shadow-sm mb-8">
            <h2 className="font-heading text-base font-bold text-amber-800 mb-2">How to Prepare</h2>
            <div className="prose-sm">
              <ReactMarkdown components={MD_COMPONENTS}>{s.preparation_note}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Booking CTA */}
        <div className="rounded-xl border border-border bg-white p-6 md:p-8 shadow-sm text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <h2 className="font-heading text-lg font-bold text-text-primary mb-1">Specialist Booking Coming Soon</h2>
          <p className="font-body text-sm text-text-secondary mb-4">
            Online booking for visiting specialists will be available in a future update. For now, please contact the clinic to schedule an appointment with {s.specialist_name}.
          </p>
          <Link href="/booking" className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-accent-hover transition-colors">
            Book a Regular Appointment
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link href="/specialists" className="inline-flex items-center gap-2 font-body text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Back to All Specialists
          </Link>
        </div>
      </div>
    </main>
  );
}
