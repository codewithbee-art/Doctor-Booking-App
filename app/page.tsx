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
      <section className="bg-white px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
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
      <section className="bg-light-blue px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "5000+", label: "Happy Patients" },
              { value: "5+", label: "Years Experience" },
              { value: "98%", label: "Satisfaction" },
              { value: "24/7", label: "Emergency" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-body text-3xl font-bold text-primary md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 font-body text-base text-text-secondary">
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
                className="h-80 w-full rounded-lg object-cover md:h-[35rem]"
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
              <ul className="space-y-2 font-body text-base text-text-secondary">
                <li className="flex items-center gap-2">
                  <span className="text-accent" aria-hidden="true">&#10003;</span>
                  Ayurvedic Medicine Graduate
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent" aria-hidden="true">&#10003;</span>
                  5+ Years Experience
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent" aria-hidden="true">&#10003;</span>
                  Family Medicine Specialist
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-bg-light px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center text-3xl font-bold md:text-4xl">
            What We Treat
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="rounded-lg bg-white p-6 shadow-sm"
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
          <div className="rounded-lg border border-dashed border-border bg-bg-light px-6 py-12 text-center">
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
              <div key={item} className="rounded-lg bg-white p-5 shadow-sm">
                <div className="mb-4 h-32 rounded-lg bg-bg-off" />
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
                className="rounded-lg border border-border bg-white p-5 shadow-sm"
              >
                <div className="mb-4 h-40 rounded-lg bg-bg-off" />
                <span className="mb-2 inline-block rounded bg-light-blue px-3 py-1 font-body text-xs font-semibold text-primary">
                  Health Tips
                </span>
                <h3 className="mb-2 text-lg font-semibold">Blog Post Title</h3>
                <p className="mb-4 font-body text-base text-text-secondary line-clamp-3">
                  Short excerpt of the blog post content goes here. This
                  preview gives readers a quick idea of the article.
                </p>
                <p className="font-body text-sm text-text-secondary">
                  By Dr. Bishnu Acharya
                </p>
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
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
                  <svg
                    className="h-6 w-6 text-white"
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
                <p className="mb-1 font-body text-sm font-semibold uppercase tracking-wider text-secondary">
                  Step {item.step}
                </p>
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
      <section className="bg-primary px-4 py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to Book Your Appointment?
          </h2>
          <p className="mb-8 font-body text-lg text-white/80">
            Available Sunday to Saturday, 9 AM &ndash; 5 PM
          </p>
          <Link
            href="/booking"
            className="inline-block rounded-lg bg-accent px-10 py-4 font-body text-lg font-semibold text-white hover:bg-accent-hover transition-colors"
          >
            Book Now
          </Link>
        </div>
      </section>
    </>
  );
}
