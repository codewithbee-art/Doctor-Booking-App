import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Private & Confidential Counselling",
  description:
    "Book a discreet, confidential counselling session by phone, video, or in person. Your privacy is respected at every step.",
  path: "/private-counselling",
});

const features = [
  {
    title: "Completely Confidential",
    description:
      "Your consultation details remain strictly between you and the doctor. We protect your privacy at every step.",
    icon: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
  },
  {
    title: "Phone, Video, or In-Person",
    description:
      "Choose the consultation mode that feels most comfortable. Talk from home or visit the clinic in person.",
    icon: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
  },
  {
    title: "Sensitive Concerns Welcome",
    description:
      "Whether it is stress, anxiety, personal health concerns, or anything sensitive — we listen without judgement.",
    icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  },
  {
    title: "No Detailed Forms Required",
    description:
      "You do not need to share full details online. Just book a time and our doctor will discuss everything during the session.",
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  },
  {
    title: "Handled with Respect",
    description:
      "Our doctor and admin team handle every counselling booking with professionalism, empathy, and care.",
    icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  },
  {
    title: "Flexible Payment Options",
    description:
      "Pay online, pay later, or pay during your visit — whatever is convenient for you.",
    icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
  },
];

export default function PrivateCounsellingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-light-blue/40 px-4 py-16 md:py-24">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-light-blue/30 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl lg:text-5xl">
            Private &amp; Confidential Counselling
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-body text-lg text-text-secondary leading-relaxed">
            Everyone deserves a safe, judgement-free space to discuss their health concerns.
            Book a private session with our experienced doctor — your details stay between you and the doctor.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/booking?type=counselling"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3.5 font-body text-base font-semibold text-white shadow-sm hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              Book Private Counselling
            </Link>
            <a
              href="tel:+977-9868617515"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-primary px-8 py-3.5 font-body text-base font-semibold text-primary hover:bg-primary hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Call Us Directly
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-bg-light px-4 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center font-heading text-2xl font-bold text-text-primary md:text-3xl">
            How It Works
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center font-body text-base text-text-secondary">
            Our private counselling service is designed to be simple, safe, and respectful of your privacy.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                  </svg>
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="font-body text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center font-heading text-2xl font-bold text-text-primary md:text-3xl">
            Simple 3-Step Process
          </h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Book Your Slot",
                description: "Choose a date, time, and your preferred consultation mode (phone, video, or in-person).",
              },
              {
                step: "2",
                title: "We Contact You",
                description: "Our team will confirm your appointment and reach out at the scheduled time — no need to share sensitive details upfront.",
              },
              {
                step: "3",
                title: "Private Consultation",
                description: "Speak freely with the doctor in a confidential, judgement-free environment. Your conversation stays private.",
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4 rounded-xl border border-border bg-bg-light p-5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary font-body text-sm font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-heading text-base font-semibold text-text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-1 font-body text-sm text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Assurance */}
      <section className="bg-primary/5 px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <svg className="mx-auto mb-4 h-10 w-10 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <h2 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">
            Your Privacy is Our Priority
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-base text-text-secondary leading-relaxed">
            All counselling records are handled with strict confidentiality.
            Only your doctor and the clinic admin have access to booking information.
            We never share your details with third parties.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">
            Ready to Book?
          </h2>
          <p className="mt-3 font-body text-base text-text-secondary">
            Take the first step. Your wellbeing matters.
          </p>
          <Link
            href="/booking?type=counselling"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3.5 font-body text-base font-semibold text-white shadow-sm hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Book Private Counselling
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
