import Image from "next/image";
import Link from "next/link";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; href: string };
  badge?: string;
  backgroundImage?: string;
}

export default function PageHero({
  title,
  subtitle,
  breadcrumb,
  badge,
  backgroundImage = "/Images/ayurveda/scienceoflife.png",
}: PageHeroProps) {
  return (
    <section className="relative px-4 py-16 md:py-20 lg:py-24">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/75 to-primary/85" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {breadcrumb && (
          <Link
            href={breadcrumb.href}
            className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 font-body text-sm font-medium text-white/90 backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            {breadcrumb.label}
          </Link>
        )}
        {badge && (
          <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1 font-body text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            {badge}
          </span>
        )}
        <h1 className="mb-4 font-heading text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto max-w-2xl font-body text-base text-white/90 leading-relaxed md:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
