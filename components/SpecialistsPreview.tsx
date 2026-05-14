import { supabaseAdmin } from "@/lib/supabaseAdmin";
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
  });
}

export default async function SpecialistsPreview() {
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabaseAdmin
    .from("visiting_specialists")
    .select(
      "id, specialist_name, specialization, treatment_type, visit_date_bs, visit_date_ad, available_from, available_to, consultation_fee, visit_location, consultation_mode, profile_image_url, display_order"
    )
    .eq("is_active", true)
    .gte("visit_date_ad", today)
    .order("display_order", { ascending: true })
    .order("visit_date_ad", { ascending: true })
    .limit(4);

  const specialists: Specialist[] = data ?? [];

  if (specialists.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-bg-light px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-light-blue">
          <svg className="h-7 w-7 text-secondary" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold">No Upcoming Specialists</h3>
        <p className="font-body text-base text-text-secondary">
          Check the{" "}
          <Link href="/specialists" className="text-primary font-semibold hover:underline">
            specialists page
          </Link>{" "}
          for the latest schedule.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {specialists.map((s) => {
        const bsDisplay = s.visit_date_bs || formatBS(s.visit_date_ad);
        return (
          <Link
            key={s.id}
            href={`/specialists/${s.id}`}
            className="block rounded-xl border border-primary/20 bg-white p-5 shadow-sm hover:border-primary/40 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-3">
              {s.profile_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.profile_image_url} alt={s.specialist_name} className="h-10 w-10 rounded-full object-cover border border-border flex-shrink-0" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-heading text-xs font-bold flex-shrink-0" aria-hidden="true">{getInitials(s.specialist_name)}</div>
              )}
              <div className="min-w-0">
                <h3 className="font-heading text-base font-bold text-text-primary truncate">{s.specialist_name}</h3>
                <p className="font-body text-sm text-primary font-semibold">{s.specialization}</p>
              </div>
            </div>
            <div className="space-y-1 font-body text-sm">
              <p className="text-text-primary font-medium">{bsDisplay}</p>
              <p className="text-text-secondary text-xs">{formatDate(s.visit_date_ad)}</p>
              <p className="text-text-secondary">{formatTime(s.available_from)} – {formatTime(s.available_to)}</p>
              <p className="text-text-primary font-semibold">{s.consultation_fee != null ? `NPR ${s.consultation_fee}` : "Free Consultation"}</p>
              {s.visit_location && <p className="text-text-secondary text-xs">{s.visit_location}</p>}
            </div>
            <p className="mt-3 font-body text-xs font-semibold text-primary group-hover:text-primary/80 transition-colors">View Profile &rarr;</p>
          </Link>
        );
      })}
    </div>
  );
}
