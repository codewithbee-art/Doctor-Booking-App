import Link from "next/link";
import Image from "next/image";

const services = [
  {
    title: "General Checkups",
    description:
      "Comprehensive health assessments to keep you and your family healthy.",
    iconPath: "M12 4.5v15m7.5-7.5h-15",
  },
  {
    title: "Chronic Disease Management",
    description:
      "Ongoing care for diabetes, hypertension, and other long-term conditions.",
    iconPath:
      "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  },
  {
    title: "Pediatric Care",
    description:
      "Gentle, expert healthcare for infants, children, and adolescents.",
    iconPath:
      "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  },
  {
    title: "Preventive Medicine",
    description:
      "Vaccinations, screenings, and lifestyle guidance to prevent illness.",
    iconPath:
      "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  },
  {
    title: "Health Screenings",
    description:
      "Early detection tests for common health concerns and conditions.",
    iconPath:
      "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  },
  {
    title: "Telemedicine Consultations",
    description:
      "Consult with our doctors from the comfort of your home.",
    iconPath:
      "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white px-4 py-16 md:py-24">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-light-blue/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-light-blue/20 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="space-y-6 text-center md:text-left">
              <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
                Dr. Bishnu Acharya
              </h1>
              <p className="font-body text-lg text-text-secondary md:text-2xl">
                Ayurvedic General Physician &amp; Family Care
              </p>
              <p className="font-body text-2xl font-bold text-secondary md:text-4xl">
                &#x0924;&#x092A;&#x093E;&#x0908;&#x0902;&#x0915;&#x094B; &#x0938;&#x094D;&#x0935;&#x093E;&#x0938;&#x094D;&#x0925;&#x094D;&#x092F;, &#x0939;&#x093E;&#x092E;&#x094D;&#x0930;&#x094B; &#x092A;&#x094D;&#x0930;&#x093E;&#x0925;&#x092E;&#x093F;&#x0915;&#x0924;&#x093E;
              </p>
              <p className="font-body text-lg text-text-secondary md:text-3xl">
                (Your Health, Our Priority)
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/booking"
                  className="rounded-lg bg-accent px-8 py-3 text-center font-body text-base font-semibold text-white hover:bg-accent-hover transition-colors"
                >
                  Book Appointment
                </Link>
                <Link
                  href="/shop"
                  className="rounded-lg border-2 border-primary px-8 py-3 text-center font-body text-base font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  Visit Shop
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative">
                <Image
                  src="/images/HeroImage.jpeg"
                  alt="Dr. Bishnu Acharya"
                  width={380}
                  height={475}
                  className="rounded-2xl object-cover shadow-lg"
                  priority
                />
                <div className="absolute -right-2 top-4 rounded-full bg-accent px-4 py-2 font-body text-sm font-semibold text-white shadow-md">
                  5+ Years Experience
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-light-blue px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              {
                value: "5000+",
                label: "Happy Patients",
                iconPath:
                  "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
              },
              {
                value: "5+",
                label: "Years Experience",
                iconPath:
                  "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                value: "98%",
                label: "Satisfaction",
                iconPath:
                  "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
              },
              {
                value: "24/7",
                label: "Emergency",
                iconPath:
                  "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/80 px-4 py-6 text-center shadow-sm"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-light-blue">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={stat.iconPath}
                    />
                  </svg>
                </div>
                <p className="font-body text-3xl font-bold text-primary md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 font-body text-base text-text-secondary">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-3xl font-bold md:text-4xl">
            About Dr. Bishnu Acharya
          </h2>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="flex items-center justify-center">
              <Image
                src="/images/AboutImage.jpeg"
                alt="Dr. Bishnu Acharya consulting with a patient"
                width={600}
                height={600}
                className="h-80 w-full rounded-lg object-cover shadow-md md:h-[35rem]"
              />
            </div>
            <div className="space-y-5">
              <p className="font-body text-base text-text-secondary">
                Dr. Bishnu Acharya is a dedicated Ayurvedic general physician
                with over 5 years of practice in Nepal. He specializes in
                family care, chronic disease management, and preventive medicine.
              </p>
              <p className="font-body text-base text-text-secondary">
                With a strong foundation in Ayurvedic medicine, he has served
                thousands of patients across Nepal with dedication, compassion,
                and a holistic approach to healthcare.
              </p>
              <div className="rounded-lg bg-light-blue p-6">
                <h3 className="mb-2 text-lg font-semibold">Our Mission</h3>
                <p className="font-body text-base text-text-secondary">
                  To provide accessible, high-quality healthcare to every
                  patient with compassion and expertise.
                </p>
              </div>
              <ul className="space-y-3 font-body text-base text-text-secondary">
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10" aria-hidden="true">
                    <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  </span>
                  Ayurvedic Medicine Graduate
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10" aria-hidden="true">
                    <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  </span>
                  5+ Years Experience
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10" aria-hidden="true">
                    <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  </span>
                  Family Medicine Specialist
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Ayurveda Preview Section */}
      <section className="bg-bg-light px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
            <div className="order-2 md:order-1">
              <span className="mb-3 inline-block rounded-full bg-secondary/10 px-4 py-1 font-body text-sm font-semibold uppercase tracking-wider text-secondary">
                Understanding Ayurveda
              </span>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                The Science of Life
              </h2>
              <p className="mb-4 font-body text-base text-text-secondary leading-relaxed">
                Ayurveda teaches that health is harmony between mind, body, and spirit. 
                It looks beyond symptoms to understand the root cause of imbalance, treating 
                each person as a unique individual.
              </p>
              <p className="mb-6 font-body text-base text-text-secondary leading-relaxed">
                Discover your natural constitution (Prakriti) and learn how the five elements 
                and three Doshas—Vata, Pitta, and Kapha—shape your health and wellbeing.
              </p>
              <Link
                href="/ayurveda"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-body text-base font-semibold text-white hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Learn About Ayurveda
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="order-1 md:order-2 flex items-center justify-center">
              <div className="relative">
                <Image
                  src="/images/ayurveda/doshas-chart2.png"
                  alt="Ayurveda five elements and three doshas chart"
                  width={400}
                  height={400}
                  className="rounded-2xl object-contain shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center text-3xl font-bold md:text-4xl">
            What We Treat
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-secondary/30 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-light-blue">
                  <svg
                    className="h-6 w-6 text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={service.iconPath}
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{service.title}</h3>
                <p className="font-body text-base text-text-secondary">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visiting Specialists Preview */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-3xl font-bold md:text-4xl">
            Visiting Specialists This Week
          </h2>
          <div className="rounded-lg border border-dashed border-border bg-bg-light px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-light-blue">
              <svg className="h-7 w-7 text-secondary" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Coming Soon</h3>
            <p className="font-body text-base text-text-secondary">
              Check back soon for visiting specialists
            </p>
          </div>
        </div>
      </section>

      {/* Shop Preview */}
      <section className="bg-bg-light px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-2 text-center text-3xl font-bold md:text-4xl">
            Order Medicine Online
          </h2>
          <p className="mb-10 text-center font-body text-base text-text-secondary">
            Get essential medicines delivered to your doorstep
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-secondary/30 hover:shadow-md">
                <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-bg-off">
                  <svg className="h-10 w-10 text-border" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <h3 className="mb-1 text-base font-semibold">Product Name</h3>
                <p className="mb-4 font-body text-base font-bold text-primary">
                  NPR 250
                </p>
                <button
                  type="button"
                  className="w-full rounded-lg bg-accent px-4 py-2.5 font-body text-base font-semibold text-white hover:bg-accent-hover transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 font-body text-base font-semibold text-primary hover:text-secondary transition-colors"
            >
              View All Products
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-3xl font-bold md:text-4xl">
            Health Tips &amp; Insights
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <article
                key={item}
                className="rounded-lg border border-border bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-bg-off">
                  <svg className="h-10 w-10 text-border" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6V7.5z" />
                  </svg>
                </div>
                <span className="mb-2 inline-block rounded bg-light-blue px-3 py-1 font-body text-xs font-semibold text-primary">
                  Health Tips
                </span>
                <h3 className="mb-2 text-lg font-semibold">Blog Post Title</h3>
                <p className="mb-4 font-body text-base text-text-secondary line-clamp-3">
                  Short excerpt of the blog post content goes here. This
                  preview gives readers a quick idea of the article.
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-body text-sm text-text-secondary">
                    By Dr. Bishnu Acharya
                  </p>
                  <Link href="/blog" className="inline-flex items-center gap-1 font-body text-sm font-semibold text-primary hover:text-secondary transition-colors">
                    Read More
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="inline-block rounded-lg border-2 border-primary px-8 py-3 font-body text-base font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
            >
              View All Posts
            </Link>
          </div>
        </div>
      </section>

      {/* How to Book */}
      <section className="bg-light-blue px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center text-3xl font-bold md:text-4xl">
            Book Your Appointment in 3 Easy Steps
          </h2>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Choose Your Date & Time",
                description:
                  "Select from available appointment slots using our calendar.",
                iconPath:
                  "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
              },
              {
                step: "2",
                title: "Fill Your Details",
                description:
                  "Provide your name, phone number, and reason for visit.",
                iconPath:
                  "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
              },
              {
                step: "3",
                title: "Get Instant Confirmation",
                description:
                  "Receive your booking confirmation right away.",
                iconPath:
                  "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-xl border border-slate-200 bg-white/80 px-6 py-8 text-center shadow-sm transition-all hover:border-secondary/30 hover:shadow-md">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-md">
                  <svg
                    className="h-7 w-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={item.iconPath}
                    />
                  </svg>
                </div>
                <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1 font-body text-xs font-bold uppercase tracking-wider text-primary">
                  Step {item.step}
                </span>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="font-body text-base text-text-secondary">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to Book Your Appointment?
          </h2>
          <p className="mb-2 font-body text-lg text-white/80">
            Available Sunday to Saturday, 9 AM &ndash; 5 PM
          </p>
          <p className="mb-8 font-body text-base text-white/60">
            Call us at +977 1234567890 or book online
          </p>
          <Link
            href="/booking"
            className="inline-block rounded-lg bg-accent px-10 py-4 font-body text-lg font-semibold text-white shadow-lg hover:bg-accent-hover transition-colors"
          >
            Book Now
          </Link>
        </div>
      </section>
    </>
  );
}
